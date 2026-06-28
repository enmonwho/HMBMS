import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { MagnifyingGlass, X, FileText, Plus } from '@phosphor-icons/react';

interface BeneficiaryRecord {
  id: string;
  hospital_id: string;
  patient_name: string;
  parent_name: string;
  diagnosis: string;
  required_volume_ml: number;
  prescription_date: string;
  status: string;
  created_at: string;
  dispensing_records?: { volume_dispensed_ml: number }[];
}

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ status: '' });

  const [formData, setFormData] = useState({
    patient_name: '',
    parent_name: '',
    hospital_id: '',
    diagnosis: '',
    required_volume_ml: '',
    prescription_date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchBeneficiaries() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*, dispensing_records(volume_dispensed_ml)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBeneficiaries((data as BeneficiaryRecord[]) || []);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return beneficiaries;
    return beneficiaries.filter(b =>
      (b.patient_name || '').toLowerCase().includes(q) ||
      (b.parent_name || '').toLowerCase().includes(q)
    );
  }, [beneficiaries, search]);

  const selected = beneficiaries.find(b => b.id === selectedId);
  const totalReceived = selected?.dispensing_records?.reduce((acc, curr) => acc + (curr.volume_dispensed_ml || 0), 0) || 0;
  const isFulfilled = totalReceived >= (selected?.required_volume_ml || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert([{
          patient_name: formData.patient_name,
          parent_name: formData.parent_name,
          hospital_id: formData.hospital_id,
          diagnosis: formData.diagnosis,
          required_volume_ml: parseInt(formData.required_volume_ml, 10),
          prescription_date: formData.prescription_date,
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) throw error;
      setBeneficiaries(prev => [data, ...prev]);
      setIsModalOpen(false);
      setFormData({
        patient_name: '',
        parent_name: '',
        hospital_id: '',
        diagnosis: '',
        required_volume_ml: '',
        prescription_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Error registering beneficiary:', err);
      alert('Failed to register beneficiary.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Beneficiary Directory" />

      <div className="flex items-center justify-between mb-6">
        <div className="admin-searchbar mb-0 w-full max-w-md">
          <MagnifyingGlass className="admin-searchbar-icon text-slate-400" size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search Beneficiary"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search beneficiary"
          />
        </div>
        <button
          className="admin-pill-action-btn bg-(--admin-navy) text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-(--admin-navy-dark) transition-colors flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} weight="bold" />
          Register Beneficiary
        </button>
      </div>

      <div className="admin-with-panel">
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Infant Name</th>
                <th>Parent/Guardian</th>
                <th>Affiliated Hospital</th>
                <th>Date Registered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="admin-table-empty-row">
                  <td colSpan={6}>Loading records...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr className="admin-table-empty-row">
                  <td colSpan={6}>No beneficiaries found.</td>
                </tr>
              )}
              {!loading && filtered.map((b, i) => (
                <tr
                  key={b.id}
                  className="is-clickable"
                  onClick={() => setSelectedId(b.id)}
                >
                  <td>{i + 1}</td>
                  <td className="admin-table-name">{b.patient_name}</td>
                  <td>{b.parent_name}</td>
                  <td>{b.hospital_id}</td>
                  <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    <StatusPill status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {selected && (
          <aside className="admin-side-panel" aria-label="Baby's profile">
            <div className="admin-side-panel-head">
              Baby's Profile
              <button
                type="button"
                className="admin-side-panel-close"
                aria-label="Close baby's profile"
                onClick={() => setSelectedId(null)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="admin-side-panel-body">
              <h3>Infant Details</h3>
              <p>Name: {selected.patient_name}</p>
              <p>Date of Birth: N/A</p>
              <p>
                Gestational Age / Weight: —
              </p>
              <p>Sex: N/A</p>
              <p>Diagnosis / Reason for Request: {selected.diagnosis}</p>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 my-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Volume Tracking</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Required Volume</p>
                    <p className="font-bold text-lg text-slate-800">{selected.required_volume_ml} mL</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Received</p>
                    <p className={`font-bold text-lg ${isFulfilled ? 'text-green-600' : 'text-blue-600'}`}>
                      {totalReceived} mL
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-3 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${isFulfilled ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (totalReceived / (selected.required_volume_ml || 1)) * 100)}%` }}
                  ></div>
                </div>
                {isFulfilled && (
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                    ✓ Required volume fulfilled
                  </p>
                )}
              </div>

              <h3>Parent / Guardian Details</h3>
              <p>Name: {selected.parent_name}</p>
              <p>Relationship: N/A</p>
              <p>Contact Number: N/A</p>
              <p>Email: N/A</p>
              <p>Address: N/A</p>

              <h3>Medical Affiliation</h3>
              <p>Requesting Hospital: {selected.hospital_id}</p>
              <p>Ward / Room: N/A</p>
              <p>Attending Physician: N/A</p>

              <h3>Attached Documents</h3>
              <p>
                <a className="admin-file-link flex items-center gap-2" href="#">
                  <FileText size={18} /> Doctor's Prescription / Request Form (Date: {selected.prescription_date ? new Date(selected.prescription_date).toLocaleDateString() : 'N/A'})
                </a>
              </p>
              <p>
                <a className="admin-file-link flex items-center gap-2" href="#">
                  <FileText size={18} /> Parent/Guardian Consent Form
                </a>
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setEditForm({ status: selected.status });
                    setIsEditModalOpen(true);
                  }}
                  className="admin-pill-action-btn w-full py-3 rounded-lg font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Edit Status
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Edit Status Modal */}
      {isEditModalOpen && selected && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit Status for {selected.patient_name}</h2>
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
                const { error } = await supabase
                  .from('beneficiaries')
                  .update({ status: editForm.status })
                  .eq('id', selected.id);
                
                if (error) throw error;

                setBeneficiaries(prev => prev.map(b => 
                  b.id === selected.id ? { ...b, status: editForm.status } : b
                ));

                setIsEditModalOpen(false);
                alert('Status updated successfully!');
              } catch (err) {
                console.error('Error updating status:', err);
                alert('Failed to update status. Please try again.');
              } finally {
                setIsSubmitting(false);
              }
            }} className="admin-modal-body space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select 
                  className="admin-modal-input"
                  value={editForm.status}
                  onChange={e => setEditForm({ status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Register Beneficiary</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal-body space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label htmlFor="patient_name" className="text-sm font-medium text-slate-700">Infant Name</label>
                <input
                  id="patient_name"
                  required
                  type="text"
                  className="admin-modal-input"
                  value={formData.patient_name}
                  onChange={e => setFormData({ ...formData, patient_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="parent_name" className="text-sm font-medium text-slate-700">Parent/Guardian Name</label>
                <input
                  id="parent_name"
                  required
                  type="text"
                  className="admin-modal-input"
                  value={formData.parent_name}
                  onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="hospital_id" className="text-sm font-medium text-slate-700">Requesting Hospital</label>
                <input
                  id="hospital_id"
                  required
                  type="text"
                  className="admin-modal-input"
                  value={formData.hospital_id}
                  onChange={e => setFormData({ ...formData, hospital_id: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="diagnosis" className="text-sm font-medium text-slate-700">Diagnosis</label>
                <input
                  id="diagnosis"
                  required
                  type="text"
                  className="admin-modal-input"
                  value={formData.diagnosis}
                  onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="required_volume_ml" className="text-sm font-medium text-slate-700">Required Vol (mL)</label>
                  <input
                    id="required_volume_ml"
                    required
                    type="number"
                    className="admin-modal-input"
                    value={formData.required_volume_ml}
                    onChange={e => setFormData({ ...formData, required_volume_ml: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="prescription_date" className="text-sm font-medium text-slate-700">Prescription Date</label>
                  <input
                    id="prescription_date"
                    required
                    type="date"
                    className="admin-modal-input"
                    value={formData.prescription_date}
                    onChange={e => setFormData({ ...formData, prescription_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3" style={{ marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
