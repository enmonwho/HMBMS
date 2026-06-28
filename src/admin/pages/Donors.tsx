import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { Users, UserFocus, UserMinus, CalendarPlus, MagnifyingGlass, IdentificationBadge, ChartBar, X } from '@phosphor-icons/react';

interface DonorRecord {
  id: string;
  donor_number: string;
  status: string;
  created_at: string;
  applicant_id: string;
  applicants: {
    first_name: string;
    last_name: string;
    contact_number: string;
    email: string;
    street: string;
    city: string;
    province: string;
    civil_status: string;
  };
  milk_collections: {
    volume_ml: number;
  }[];
}

export default function Donors() {
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<DonorRecord | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState({ volume_ml: '' });
  const [editForm, setEditForm] = useState({
    status: '',
    contact_number: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role } = useAuth();
  const canEdit = role !== 'Medical Technologist';

  async function fetchDonors() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donors')
        .select(`
          id, donor_number, status, created_at, applicant_id,
          applicants ( id, first_name, last_name, contact_number, email, street, city, province, civil_status ),
          milk_collections ( volume_ml )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonors((data as any) || []);
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDonors();
  }, []);

  const filteredDonors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donors;
    return donors.filter(d =>
      `${d.applicants?.first_name} ${d.applicants?.last_name}`.toLowerCase().includes(q) ||
      d.donor_number?.toLowerCase().includes(q)
    );
  }, [donors, search]);

  const activeCount = donors.filter(d => d.status === 'ACTIVE').length;
  const inactiveCount = donors.filter(d => d.status === 'INACTIVE').length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = donors.filter(d => {
    const date = new Date(d.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  return (
    <>
      <PageHeader title="Donor Directory" />

      <div className="admin-stat-grid gap-6 mb-8">
        <div className="admin-stat-card tone-blue p-6 flex flex-col justify-center relative overflow-hidden">
          <Users className="absolute right-[-20px] bottom-[-20px] text-blue-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <Users size={18} /> Total Donors
          </div>
          <div className="admin-stat-value text-4xl">{donors.length}</div>
        </div>
        <div className="admin-stat-card tone-green p-6 flex flex-col justify-center relative overflow-hidden">
          <UserFocus className="absolute right-[-20px] bottom-[-20px] text-green-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <UserFocus size={18} /> Active Donors
          </div>
          <div className="admin-stat-value text-4xl">{activeCount}</div>
        </div>
        <div className="admin-stat-card tone-red p-6 flex flex-col justify-center relative overflow-hidden">
          <UserMinus className="absolute right-[-20px] bottom-[-20px] text-red-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <UserMinus size={18} /> Inactive Donors
          </div>
          <div className="admin-stat-value text-4xl">{inactiveCount}</div>
        </div>
        <div className="admin-stat-card tone-amber p-6 flex flex-col justify-center relative overflow-hidden">
          <CalendarPlus className="absolute right-[-20px] bottom-[-20px] text-orange-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <CalendarPlus size={18} /> New This Month
          </div>
          <div className="admin-stat-value text-4xl">{newThisMonth}</div>
        </div>
      </div>

      <div className="admin-searchbar mb-6">
        <MagnifyingGlass className="admin-searchbar-icon text-slate-400" size={18} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search donor"
        />
      </div>

      <div className="admin-with-panel flex gap-6 items-start">
        <div className="admin-table-wrap flex-1 min-h-[500px]">
          <div className="admin-table-scroll overflow-x-auto">
            <table className="admin-table w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Donor Number</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Registered Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr className="admin-table-empty-row">
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading records...</td>
                  </tr>
                ) : filteredDonors.length === 0 ? (
                  <tr className="admin-table-empty-row">
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No donors found.</td>
                  </tr>
                ) : (
                  filteredDonors.map(d => (
                    <tr
                      key={d.id}
                      className="is-clickable hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedDonor(d)}
                    >
                      <td className="admin-table-name px-6 py-4 font-medium" style={{ color: 'var(--admin-navy)' }}>
                        {d.donor_number}
                      </td>
                      <td className="admin-table-name px-6 py-4 font-medium text-slate-900">
                        {d.applicants?.first_name} {d.applicants?.last_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{d.applicants?.contact_number}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <StatusPill status={d.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedDonor && (
          <aside className="admin-side-panel w-[380px] shrink-0 flex flex-col overflow-hidden" aria-label="Donor profile">
            <div className="admin-side-panel-head bg-(--admin-navy) text-white px-6 py-5 flex items-center justify-between">
              <span className="font-bold text-lg tracking-wide">Donor Profile</span>
              <button
                type="button"
                className="admin-side-panel-close text-white/80 hover:text-white transition-colors"
                aria-label="Close donor profile"
                onClick={() => setSelectedDonor(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-side-panel-body p-6 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdentificationBadge size={18} /> Personal Details
                </h3>
                <div className="space-y-3">
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">ID</span> <span className="font-medium text-slate-900">{selectedDonor.donor_number}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Name</span> <span className="font-medium text-slate-900">{selectedDonor.applicants?.first_name} {selectedDonor.applicants?.last_name}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Civil Status</span> <span className="text-slate-800">{selectedDonor.applicants?.civil_status}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Email</span> <span className="text-slate-800">{selectedDonor.applicants?.email}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Contact Number</span> <span className="text-slate-800">{selectedDonor.applicants?.contact_number}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Address</span> <span className="text-slate-800 leading-snug">{selectedDonor.applicants?.street}, {selectedDonor.applicants?.city}, {selectedDonor.applicants?.province}</span></p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ChartBar size={18} /> Donation Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Volume</p>
                    <p className="font-bold text-lg text-(--admin-navy)">
                      {selectedDonor.milk_collections?.reduce((acc, curr) => acc + (curr.volume_ml || 0), 0) || 0} mL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Donation Count</p>
                    <p className="font-bold text-lg text-(--admin-navy)">
                      {selectedDonor.milk_collections?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <button 
                  onClick={() => setIsCollectionModalOpen(true)}
                  className="admin-pill-action-btn w-full py-3 rounded-lg font-semibold bg-(--admin-navy) text-white hover:bg-(--admin-navy-dark) transition-colors shadow-sm"
                >
                  Start Collection
                </button>
                {canEdit && (
                  <button 
                    onClick={() => {
                      setEditForm({
                        status: selectedDonor.status,
                        contact_number: selectedDonor.applicants?.contact_number || '',
                        email: selectedDonor.applicants?.email || ''
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="w-full py-3 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Edit Record
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Start Collection Modal */}
        {isCollectionModalOpen && selectedDonor && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Start Milk Collection</h2>
                <button 
                  onClick={() => {
                    setIsCollectionModalOpen(false);
                    setCollectionForm({ volume_ml: '' });
                  }}
                  className="admin-modal-close"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const vol = Math.round(parseFloat(collectionForm.volume_ml) * 1000);
                  if (vol < 30 || vol > 5000) {
                     alert("Collection volume must be between 0.03 L and 5.0 L per session.");
                     setIsSubmitting(false);
                     return;
                  }

                  const todayDate = new Date().toISOString().split('T')[0];
                  const { data: todayCollections } = await supabase
                    .from('milk_collections')
                    .select('volume_ml')
                    .eq('donor_id', selectedDonor.id)
                    .gte('collection_date', `${todayDate}T00:00:00.000Z`)
                    .lte('collection_date', `${todayDate}T23:59:59.999Z`);
                    
                  const totalToday = (todayCollections || []).reduce((sum, c) => sum + c.volume_ml, 0);
                  if (totalToday + vol > 10000) {
                     alert(`Daily limit exceeded! This donor has already donated ${(totalToday / 1000).toFixed(2)} L today. Adding ${(vol / 1000).toFixed(2)} L exceeds the 10.0 L/day limit.`);
                     setIsSubmitting(false);
                     return;
                  }

                  const newBarcode = `BAR-${Math.random().toString(36).substring(2, 6)}`;
                  const { error } = await supabase.from('milk_collections').insert([{
                    donor_id: selectedDonor.id,
                    volume_ml: vol,
                    status: 'PENDING LABORATORY',
                    barcode: newBarcode,
                    collection_date: new Date().toISOString()
                  }]);
                  
                  if (error) throw error;

                  await fetchDonors();
                  
                  // Update the currently selected donor so the UI reflects the new volume immediately
                  setSelectedDonor(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      milk_collections: [...(prev.milk_collections || []), { volume_ml: vol }]
                    };
                  });

                  setIsCollectionModalOpen(false);
                  setCollectionForm({ volume_ml: '' });
                  alert('Milk collection successfully recorded!');
                } catch (err) {
                  console.error('Error starting collection:', err);
                  alert('Failed to start collection. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }} className="admin-modal-body space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Volume (in Liters)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.03"
                    required
                    className="admin-modal-input"
                    value={collectionForm.volume_ml}
                    onChange={e => setCollectionForm({ volume_ml: e.target.value })}
                    placeholder="e.g. 0.15"
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3" style={{ marginTop: '2.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCollectionModalOpen(false);
                      setCollectionForm({ volume_ml: '' });
                    }}
                    className="admin-btn-cancel"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-save"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Record Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedDonor && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Edit Donor Record</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="admin-modal-close"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  // Update donor status
                  await supabase.from('donors').update({ status: editForm.status }).eq('id', selectedDonor.id);
                  // Update applicant details
                  if (selectedDonor.applicant_id) {
                    await supabase.from('applicants').update({ 
                      contact_number: editForm.contact_number,
                      email: editForm.email
                    }).eq('id', selectedDonor.applicant_id);
                  }
                  
                  await fetchDonors();
                  setIsEditModalOpen(false);
                  setSelectedDonor(null);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmitting(false);
                }
              }} className="admin-modal-body space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    className="admin-modal-input"
                    value={editForm.status}
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Contact Number</label>
                  <input 
                    type="text"
                    required
                    className="admin-modal-input"
                    value={editForm.contact_number}
                    onChange={e => setEditForm({...editForm, contact_number: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input 
                    type="email"
                    required
                    className="admin-modal-input"
                    value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3" style={{ marginTop: '2.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="admin-btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}