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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    full_name: '',
    role: 'Nurse',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    role: 'Nurse',
    status: 'ACTIVE',
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
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
        .from('profiles')
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

  const handleEditClick = (u: SystemUserRecord) => {
    setSelectedUserId(u.id);
    setEditFormData({
      full_name: u.full_name || '',
      role: u.role || 'Nurse',
      status: u.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUserId('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.full_name,
          role: editFormData.role,
          status: editFormData.status,
        })
        .eq('id', selectedUserId)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => prev.map(u => (u.id === selectedUserId ? data : u)));
      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUserId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== selectedUserId));
      handleCloseEditModal();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user.');
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
                      onClick={() => handleEditClick(u)}
                    >
                      <Gear size={16} />
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
                <div className="relative">
                  <input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    className="admin-modal-input pr-10"
                    placeholder="Enter a secure password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                      {showPassword ? (
                        <path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,128c-58.74,0-91.13-52.12-94.67-58.4,14.61-26,50.1-51.6,94.67-51.6s80.06,25.65,94.67,51.6C219.13,131.88,186.74,184,128,184Zm0-104a46,46,0,1,0,46,46A46.06,46.06,0,0,0,128,80Zm0,76a30,30,0,1,1,30-30A30,30,0,0,1,128,156Z" />
                      ) : (
                        <path d="M234.4,211.6,183,160.2A105.7,105.7,0,0,0,240,128s-32-72-112-72a117.82,117.82,0,0,0-58,15.1L45.6,46.8A8,8,0,0,0,34.3,58.1l188.8,188.8a8,8,0,0,0,11.3-11.3ZM128,72c44.57,0,80.06,25.65,94.67,51.6-4,7-10.43,17.48-20.15,28L175.7,124.7a46,46,0,0,0-51-51L107,56.1A105.7,105.7,0,0,1,128,72ZM21.6,144.4,43.2,166a117.82,117.82,0,0,0,84.8,34c46.74,0,73.49-24,86.2-39.7l15,15c-11.45,11-40.42,36.7-101.2,36.7C48,200,16,128,16,128A143.68,143.68,0,0,1,21.6,116Z" />
                      )}
                    </svg>
                  </button>
                </div>
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
      {isEditModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit System User</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseEditModal}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="admin-modal-body space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit_full_name" className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  id="edit_full_name"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. Jane Doe"
                  value={editFormData.full_name}
                  onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit_role" className="text-sm font-medium text-slate-700">Role</label>
                <select
                  id="edit_role"
                  required
                  className="admin-modal-input"
                  value={editFormData.role}
                  onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Nurse Attendant">Nurse Attendant</option>
                  <option value="Medical Technologist">Medical Technologist</option>
                  <option value="Midwife">Midwife</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit_status" className="text-sm font-medium text-slate-700">Status</label>
                <select
                  id="edit_status"
                  required
                  className="admin-modal-input"
                  value={editFormData.status}
                  onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3" style={{ marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                >
                  Delete User
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="admin-btn-cancel"
                    onClick={handleCloseEditModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-save"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Update User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
