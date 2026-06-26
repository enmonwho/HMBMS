import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockSystemUsers } from '../mockData';

export default function UserManagement() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockSystemUsers;
    return mockSystemUsers.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [search]);

  const handleAddUser = () => {
    // No backend yet — once the API exists, this should open a form/modal
    // to create a new system user.
    alert('Add New User — hook this up to a form once the backend is ready.');
  };

  return (
    <>
      <PageHeader title="System Users" />

      <div className="admin-searchbar-row">
        <div className="admin-searchbar admin-searchbar-flex">
          <span className="admin-searchbar-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="Search User"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search user"
          />
        </div>
        <button type="button" className="admin-pill-action-btn" onClick={handleAddUser}>
          ADD NEW USER
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={7}>No users found.</td>
              </tr>
            )}
            {filtered.map((u, i) => (
              <tr key={`${u.email}-${i}`}>
                <td>{u.userId}</td>
                <td className="admin-table-name">{u.fullName}</td>
                <td>{u.role}</td>
                <td>{u.email}</td>
                <td>{u.lastLogin}</td>
                <td>
                  <StatusPill status={u.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-edit-btn"
                    aria-label={`Manage ${u.fullName}`}
                  >
                    ⚙️ Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
