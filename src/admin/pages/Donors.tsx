import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockDonors } from '../mockData';
import type { Donor } from '../types';

export default function Donors() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(mockDonors[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockDonors;
    return mockDonors.filter(d =>
      d.name.toLowerCase().includes(q) || d.contactNumber.includes(q)
    );
  }, [search]);

  const selected: Donor | undefined = mockDonors.find(d => d.id === selectedId);

  return (
    <>
      <PageHeader title="Donor Directory" />

      <div className="admin-searchbar">
        <span className="admin-searchbar-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search Donor"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search donor"
        />
      </div>

      <div className="admin-with-panel">
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Donation Count</th>
                <th>Last Donation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr className="admin-table-empty-row">
                  <td colSpan={5}>No donors found.</td>
                </tr>
              )}
              {filtered.map(d => (
                <tr
                  key={d.id}
                  className="is-clickable"
                  onClick={() => setSelectedId(d.id)}
                >
                  <td className="admin-table-name">{d.name}</td>
                  <td>{d.contactNumber}</td>
                  <td>{d.donationCount}</td>
                  <td>{d.lastDonation}</td>
                  <td>
                    <StatusPill status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {selected && (
          <aside className="admin-side-panel" aria-label="Donor profile">
            <div className="admin-side-panel-head">
              Donor Profile
              <button
                type="button"
                className="admin-side-panel-close"
                aria-label="Close donor profile"
                onClick={() => setSelectedId(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-side-panel-body">
              <h3>Personal Details</h3>
              <p>Name: {selected.name}</p>
              <p>Age: {selected.age}</p>
              <p>Civil Status: {selected.civilStatus}</p>
              <p>Occupation: {selected.occupation}</p>
              <p>Email: {selected.email}</p>
              <p>Contact Number: {selected.contactNumber}</p>
              <p>Address: {selected.address}</p>

              <h3>Emergency Contact</h3>
              <p>Name: {selected.emergencyContact.name}</p>
              <p>Contact Number: {selected.emergencyContact.contactNumber}</p>

              <h3>Application Form</h3>
              <a className="admin-file-link" href={selected.applicationFileUrl ?? '#'}>
                📄 Open File
              </a>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
