import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { MagnifyingGlass, Gear, X } from '@phosphor-icons/react';

interface SystemUserRecord {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  email: string;
  last_login: string | null;
  status: string;
  created_at: string;
}

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<SystemUserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    full_name: '',
    role: 'Nurse',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('system_users')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching system users:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [search, users]);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ user_id: '', full_name: '', role: 'Nurse', email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Create system user record
      const { data, error } = await supabase
        .from('system_users')
        .insert([{
          user_id: authData.user?.id || formData.user_id, // Link to auth user if possible
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email,
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => [...prev, data]);
      handleCloseModal();
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="System Users" />

      <div className="admin-searchbar-row">
        <div className="admin-searchbar admin-searchbar-flex">
          <MagnifyingGlass className="admin-searchbar-icon text-slate-400" size={18} aria-hidden="true" />
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
            {loading ? (
              <tr className="admin-table-empty-row">
                <td colSpan={7}>Loading users...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr className="admin-table-empty-row">
                <td colSpan={7}>No users found.</td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.user_id}</td>
                  <td className="admin-table-name">{u.full_name}</td>
                  <td>{u.role}</td>
                  <td>{u.email}</td>
                  <td>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                  <td>
                    <StatusPill status={u.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-edit-btn"
                      aria-label={`Manage ${u.full_name}`}
                    >
                      <Gear size={16} className="inline-block mr-1" /> Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add New System User</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseModal}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal-body space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="user_id" className="text-sm font-medium text-slate-700">User ID</label>
                <input
                  id="user_id"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. U-1001"
                  value={formData.user_id}
                  onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="full_name" className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  id="full_name"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. Jane Doe"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                <input
                  id="email"
                  required
                  type="email"
                  className="admin-modal-input"
                  placeholder="e.g. jane@makatimilkbank.gov"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <input
                  id="password"
                  required
                  type="password"
                  className="admin-modal-input"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="text-sm font-medium text-slate-700">Role</label>
                <select
                  id="role"
                  required
                  className="admin-modal-input"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Nurse Attendant">Nurse Attendant</option>
                  <option value="Medical Technologist">Medical Technologist</option>
                  <option value="Midwife">Midwife</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3" style={{ marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
