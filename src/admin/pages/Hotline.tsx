import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { MagnifyingGlass, PencilSimple, X } from '@phosphor-icons/react';

interface HotlineTicketRecord {
  id: string;
  ticket_id: string;
  caller_name: string;
  subject: string;
  assigned_to: string;
  status: string;
  created_at: string;
}

export default function Hotline() {
  const [tickets, setTickets] = useState<HotlineTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ticket_id: '',
    caller_name: '',
    subject: '',
    assigned_to: 'Admin',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data, error } = await supabase
          .from('hotline_tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error('Error fetching hotline tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(t =>
      (t.caller_name || '').toLowerCase().includes(q) ||
      (t.ticket_id || '').toLowerCase().includes(q)
    );
  }, [search, tickets]);

  const handleLogNewCall = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ ticket_id: '', caller_name: '', subject: '', assigned_to: 'Admin' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('hotline_tickets')
        .insert([{
          ticket_id: formData.ticket_id,
          caller_name: formData.caller_name,
          subject: formData.subject,
          assigned_to: formData.assigned_to,
          status: 'OPEN'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTickets(prev => [data, ...prev]);
      handleCloseModal();
    } catch (err) {
      console.error('Error logging call:', err);
      alert('Failed to log call. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Hotline Logs" />

      <div className="admin-searchbar-row">
        <div className="admin-searchbar admin-searchbar-flex">
          <MagnifyingGlass className="admin-searchbar-icon text-slate-400" size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search Caller or Ticket Number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search caller or ticket number"
          />
        </div>
        <button type="button" className="admin-pill-action-btn" onClick={handleLogNewCall}>
          LOG NEW CALL
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Date &amp; Time</th>
              <th>Caller Name</th>
              <th>Subject</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-table-empty-row">
                <td colSpan={7}>Loading tickets...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr className="admin-table-empty-row">
                <td colSpan={7}>No hotline tickets found.</td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.ticket_id}</td>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td className="admin-table-name">{t.caller_name}</td>
                  <td>{t.subject || '—'}</td>
                  <td>{t.assigned_to || '—'}</td>
                  <td>
                    <StatusPill status={t.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-edit-btn"
                      aria-label={`Edit ticket ${t.ticket_id}`}
                    >
                      <PencilSimple size={16} />
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
              <h2 className="admin-modal-title">Log New Call</h2>
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
                <label htmlFor="ticket_id" className="text-sm font-medium text-slate-700">Ticket ID</label>
                <input
                  id="ticket_id"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. T-1045"
                  value={formData.ticket_id}
                  onChange={e => setFormData({ ...formData, ticket_id: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="caller_name" className="text-sm font-medium text-slate-700">Caller Name</label>
                <input
                  id="caller_name"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. Maria Santos"
                  value={formData.caller_name}
                  onChange={e => setFormData({ ...formData, caller_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject</label>
                <input
                  id="subject"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. Donation Inquiry"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="assigned_to" className="text-sm font-medium text-slate-700">Assign To</label>
                <select
                  id="assigned_to"
                  required
                  className="admin-modal-input"
                  value={formData.assigned_to}
                  onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Unassigned">Unassigned</option>
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
                  {isSubmitting ? 'Saving...' : 'Log Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
