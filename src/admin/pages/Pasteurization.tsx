import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { Plus, X, PencilSimple } from '@phosphor-icons/react';

interface BatchRecord {
  id: string;
  batch_id: string;
  collection_id: string;
  temperature_c: number | null;
  duration_minutes: number | null;
  status: string;
  created_at: string;
}

export default function Pasteurization() {
  const { role } = useAuth();
  const canEdit = role !== 'Nurse';

  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [passedCollections, setPassedCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    batch_id: '',
    collection_id: '',
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    id: '',
    batch_id: '',
    collection_id: '',
    temperature_c: '',
    duration_minutes: '',
    status: 'PASSED',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: batchData, error: batchError } = await supabase
          .from('batches')
          .select('*')
          .order('created_at', { ascending: false });

        if (batchError) throw batchError;
        setBatches(batchData || []);

        const { data: collData, error: collError } = await supabase
          .from('milk_collections')
          .select(`
            id, 
            volume_ml,
            donors ( applicants ( first_name, last_name ) )
          `)
          .eq('status', 'PASSED'); // Passed from laboratory

        if (!collError && collData) {
          setPassedCollections(collData);
        }
      } catch (err) {
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('batches')
        .insert([{
          batch_id: createData.batch_id,
          collection_id: createData.collection_id,
          status: 'PENDING'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update collection status to processing
      await supabase
        .from('milk_collections')
        .update({ status: 'PROCESSING' })
        .eq('id', createData.collection_id);

      setBatches(prev => [data, ...prev]);
      setPassedCollections(prev => prev.filter(c => c.id !== createData.collection_id));
      setIsCreateModalOpen(false);
      setCreateData({ batch_id: '', collection_id: '' });
    } catch (err) {
      console.error('Error creating batch:', err);
      alert('Failed to create batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Update the batch
      const { data: updatedBatch, error } = await supabase
        .from('batches')
        .update({
          temperature_c: parseFloat(updateData.temperature_c),
          duration_minutes: parseInt(updateData.duration_minutes, 10),
          status: updateData.status
        })
        .eq('id', updateData.id)
        .select()
        .single();

      if (error) throw error;

      // 2. If PASSED, auto-add to inventory
      if (updateData.status === 'PASSED') {
        // fetch collection to get volume
        const { data: collData } = await supabase
          .from('milk_collections')
          .select('volume_ml')
          .eq('id', updateData.collection_id)
          .single();

        const vol = collData?.volume_ml || 0;

        // +6 months expiry
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);

        const { error: invError } = await supabase
          .from('inventory')
          .insert([{
            barcode: updateData.batch_id,
            volume_ml: vol,
            status: 'AVAILABLE',
            expiry_date: expiry.toISOString(),
            storage_location: 'Freezer A' // default
          }]);

        if (invError) {
          console.error('Inventory insertion error:', invError);
          alert('Batch updated, but failed to auto-add to inventory.');
        } else {
          alert('Batch passed and successfully added to Inventory!');
        }
      }

      setBatches(prev => prev.map(b => b.id === updateData.id ? updatedBatch : b));
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error('Error updating batch:', err);
      alert('Failed to update batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateModal = (batch: BatchRecord) => {
    setUpdateData({
      id: batch.id,
      batch_id: batch.batch_id,
      collection_id: batch.collection_id,
      temperature_c: batch.temperature_c ? String(batch.temperature_c) : '',
      duration_minutes: batch.duration_minutes ? String(batch.duration_minutes) : '',
      status: batch.status === 'PENDING' ? 'PASSED' : batch.status,
    });
    setIsUpdateModalOpen(true);
  };

  return (
    <>
      <PageHeader title="Batch Records" />

      {canEdit && (
        <div className="flex items-center justify-end mb-6">
          <button
            className="admin-pill-action-btn bg-(--admin-navy) text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-(--admin-navy-dark) transition-colors flex items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} weight="bold" />
            Create Batch
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Collection ID</th>
              <th>Date</th>
              <th>Temperature</th>
              <th>Duration</th>
              <th>Status</th>
              {canEdit && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-table-empty-row">
                <td colSpan={6}>Loading batches...</td>
              </tr>
            ) : batches.length === 0 ? (
              <tr className="admin-table-empty-row">
                <td colSpan={6}>No batches yet.</td>
              </tr>
            ) : (
              batches.map(b => (
                <tr key={b.id}>
                  <td>{b.batch_id}</td>
                  <td>{b.collection_id}</td>
                  <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>{b.temperature_c != null ? `${b.temperature_c}°C` : '—'}</td>
                  <td>{b.duration_minutes != null ? `${b.duration_minutes} min` : '—'}</td>
                  <td>
                    <StatusPill status={b.status} />
                  </td>
                  {canEdit && (
                    <td>
                      <button
                        type="button"
                        className="admin-edit-btn"
                        aria-label={`Update batch ${b.batch_id}`}
                        onClick={() => openUpdateModal(b)}
                      >
                        <PencilSimple size={16} /> Update
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Create New Batch</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="admin-modal-body space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="batch_id" className="text-sm font-medium text-slate-700">Batch ID</label>
                <input
                  id="batch_id"
                  required
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. B-2026-001"
                  value={createData.batch_id}
                  onChange={e => setCreateData({ ...createData, batch_id: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="collection_id" className="text-sm font-medium text-slate-700">Select Source Collection</label>
                <select
                  id="collection_id"
                  required
                  className="admin-modal-input"
                  value={createData.collection_id}
                  onChange={e => setCreateData({ ...createData, collection_id: e.target.value })}
                >
                  <option value="" disabled>-- Choose passed collection --</option>
                  {passedCollections.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id.slice(0, 8)} - {c.donors?.applicants?.first_name} {c.donors?.applicants?.last_name} ({c.volume_ml} mL)
                    </option>
                  ))}
                </select>
                {passedCollections.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No collections passed laboratory tests yet.</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3" style={{ marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={isSubmitting || passedCollections.length === 0}
                >
                  {isSubmitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Batch Modal */}
      {isUpdateModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Update Batch: {updateData.batch_id}</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsUpdateModalOpen(false)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="admin-modal-body space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="temp" className="text-sm font-medium text-slate-700">Temperature (°C)</label>
                <input
                  id="temp"
                  required
                  type="number"
                  step="0.1"
                  className="admin-modal-input"
                  placeholder="e.g. 62.5"
                  value={updateData.temperature_c}
                  onChange={e => setUpdateData({ ...updateData, temperature_c: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="duration" className="text-sm font-medium text-slate-700">Duration (minutes)</label>
                <input
                  id="duration"
                  required
                  type="number"
                  className="admin-modal-input"
                  placeholder="e.g. 30"
                  value={updateData.duration_minutes}
                  onChange={e => setUpdateData({ ...updateData, duration_minutes: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Result Status</label>
                <select
                  id="status"
                  required
                  className="admin-modal-input"
                  value={updateData.status}
                  onChange={e => setUpdateData({ ...updateData, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PASSED">Passed (Move to Inventory)</option>
                  <option value="FAILED">Failed (Discard)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3" style={{ marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={() => setIsUpdateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
