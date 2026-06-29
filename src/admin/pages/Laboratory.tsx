import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { Plus, X } from '@phosphor-icons/react';

interface LabTestRecord {
  id: string;
  collection_id: string;
  donor_name: string;
  status: string;
  created_at: string;
}

export default function Laboratory() {
  useEffect(() => {
    document.title = "MHMB System - Laboratory";
  }, []);

  const [tests, setTests] = useState<LabTestRecord[]>([]);
  const [pendingCollections, setPendingCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { role } = useAuth();
  const canEdit = !role || ['Administrator', 'Medical Technologist'].includes(role);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    collection_id: '',
    status: 'PASSED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: testData, error: testError } = await supabase
          .from('lab_tests')
          .select('*')
          .order('created_at', { ascending: false });

        if (testError) throw testError;
        setTests(testData || []);

        const { data: collData, error: collError } = await supabase
          .from('milk_collections')
          .select(`
            id, 
            donors ( applicants ( first_name, last_name ) )
          `)
          .eq('status', 'PENDING LABORATORY');

        if (!collError && collData) {
          setPendingCollections(collData);
        }
      } catch (err) {
        console.error('Error fetching lab tests:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRecordTest = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ collection_id: '', status: 'PASSED' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedColl = pendingCollections.find(c => c.id === formData.collection_id);
      const donorName = selectedColl?.donors?.applicants ? 
        `${selectedColl.donors.applicants.first_name} ${selectedColl.donors.applicants.last_name}` : 'Unknown';

      const { data, error } = await supabase
        .from('lab_tests')
        .insert([{
          collection_id: formData.collection_id,
          donor_name: donorName,
          status: formData.status
        }])
        .select()
        .single();

      if (error) throw error;

      // Update collection status
      const { error: updateError } = await supabase
        .from('milk_collections')
        .update({ status: formData.status })
        .eq('id', formData.collection_id);

      if (updateError) {
        console.error('Failed to update collection status:', updateError);
        alert('Lab test recorded, but failed to update collection status.');
      }
      
      setTests(prev => [data, ...prev]);
      setPendingCollections(prev => prev.filter(c => c.id !== formData.collection_id));
      handleCloseModal();
    } catch (err) {
      console.error('Error recording test:', err);
      alert('Failed to record test. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Laboratory Tests" />

      {canEdit && (
        <div className="flex items-center justify-end" style={{ marginBottom: '32px', marginTop: '16px' }}>
          <button
            className="admin-pill-action-btn bg-(--admin-navy) text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-(--admin-navy-dark) transition-colors flex items-center gap-2"
            onClick={handleRecordTest}
          >
            <Plus size={18} weight="bold" />
            Record Test Result
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Collection ID</th>
              <th>Date Collected</th>
              <th>Donor Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-table-empty-row">
                <td colSpan={4}>Loading tests...</td>
              </tr>
            ) : tests.length === 0 ? (
              <tr className="admin-table-empty-row">
                <td colSpan={4}>No pending tests.</td>
              </tr>
            ) : (
              tests.map(t => (
                <tr key={t.id}>
                  <td>{t.collection_id}</td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="admin-table-name">{t.donor_name || '—'}</td>
                  <td>
                    <StatusPill status={t.status} />
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
              <h2 className="admin-modal-title">Record Lab Test</h2>
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
                <label htmlFor="collection_id" className="text-sm font-medium text-slate-700">Select Pending Collection</label>
                <select
                  id="collection_id"
                  required
                  className="admin-modal-input"
                  value={formData.collection_id}
                  onChange={e => setFormData({ ...formData, collection_id: e.target.value })}
                >
                  <option value="" disabled>-- Choose collection --</option>
                  {pendingCollections.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id.slice(0, 8)} - {c.donors?.applicants?.first_name} {c.donors?.applicants?.last_name}
                    </option>
                  ))}
                </select>
                {pendingCollections.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No collections pending laboratory tests.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Test Result</label>
                <select
                  id="status"
                  required
                  className="admin-modal-input"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PASSED">Passed (Ready for Pasteurization)</option>
                  <option value="FAILED">Failed (Discard)</option>
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
                  disabled={isSubmitting || pendingCollections.length === 0}
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
