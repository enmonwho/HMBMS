import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { Plus, X, PencilSimple, CheckCircle } from '@phosphor-icons/react';

interface BatchRecord {
  id: string;
  batch_id: string;
  collection_id?: string;
  collection_ids?: string[];
  total_volume_ml?: number;
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
  const [createData, setCreateData] = useState<{
    batch_id: string;
    collection_ids: string[];
    temperature_c: string;
    duration_minutes: string;
  }>({
    batch_id: '',
    collection_ids: [],
    temperature_c: '',
    duration_minutes: '',
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    id: '',
    batch_id: '',
    total_volume_ml: 0,
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
      const selectedCollections = passedCollections.filter(c => createData.collection_ids.includes(c.id));
      const totalVolume = selectedCollections.reduce((sum, c) => sum + (c.volume_ml || 0), 0);

      const { data, error } = await supabase
        .from('batches')
        .insert([{
          batch_id: createData.batch_id,
          collection_id: createData.collection_ids[0],
          collection_ids: createData.collection_ids,
          total_volume_ml: totalVolume,
          temperature_c: createData.temperature_c ? parseFloat(createData.temperature_c) : null,
          duration_minutes: createData.duration_minutes ? parseInt(createData.duration_minutes, 10) : null,
          status: 'PENDING'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update collection status to processing
      await supabase
        .from('milk_collections')
        .update({ status: 'PROCESSING' })
        .in('id', createData.collection_ids);

      setBatches(prev => [data, ...prev]);
      setPassedCollections(prev => prev.filter(c => !createData.collection_ids.includes(c.id)));
      setIsCreateModalOpen(false);
      setCreateData({ batch_id: '', collection_ids: [], temperature_c: '', duration_minutes: '' });
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
        const vol = updateData.total_volume_ml || 0;

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

  const handleQuickPass = async (batch: BatchRecord) => {
    if (batch.status === 'PASSED') return;
    if (!confirm(`Mark batch ${batch.batch_id} as PASSED and add to inventory?`)) return;

    setIsSubmitting(true);
    try {
      const { data: updatedBatch, error } = await supabase
        .from('batches')
        .update({ status: 'PASSED' })
        .eq('id', batch.id)
        .select()
        .single();

      if (error) throw error;

      const vol = batch.total_volume_ml || 0;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 6);

      const { error: invError } = await supabase
        .from('inventory')
        .insert([{
          barcode: batch.batch_id,
          volume_ml: vol,
          status: 'AVAILABLE',
          expiry_date: expiry.toISOString(),
          storage_location: 'Freezer A'
        }]);

      if (invError) {
        console.error('Inventory insertion error:', invError);
        alert('Batch passed, but failed to auto-add to inventory.');
      } else {
        alert('Batch passed and successfully added to Inventory!');
      }

      setBatches(prev => prev.map(b => b.id === batch.id ? updatedBatch : b));
    } catch (err) {
      console.error('Error quick passing batch:', err);
      alert('Failed to update batch status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateModal = (batch: BatchRecord) => {
    setUpdateData({
      id: batch.id,
      batch_id: batch.batch_id,
      total_volume_ml: batch.total_volume_ml || 0,
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
        <div className="flex items-center justify-end" style={{ marginBottom: '24px' }}>
          <button
            className="admin-pill-action-btn flex items-center gap-2"
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
                <th>Source</th>
                <th>Volume</th>
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
                    <td>{b.collection_ids ? `${b.collection_ids.length} Collections` : (b.collection_id ? b.collection_id.substring(0, 8) : 'N/A')}</td>
                    <td>{b.total_volume_ml ? `${b.total_volume_ml} mL` : 'Unknown'}</td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                    <td>{b.temperature_c != null ? `${b.temperature_c}°C` : '—'}</td>
                    <td>{b.duration_minutes != null ? `${b.duration_minutes} min` : '—'}</td>
                    <td>
                      <StatusPill status={b.status} />
                    </td>
                    {canEdit && (
                      <td>
                        <div className="flex items-center gap-3">
                          {b.status !== 'PASSED' && b.status !== 'FAILED' && (
                            <button
                              type="button"
                              className="admin-edit-btn text-emerald-600 hover:text-emerald-700"
                              aria-label={`Pass batch ${b.batch_id}`}
                              title="Mark as Passed"
                              onClick={() => handleQuickPass(b)}
                            >
                              <CheckCircle size={20} weight="fill" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-edit-btn"
                            aria-label={`Update batch ${b.batch_id}`}
                            title="Update batch"
                            onClick={() => openUpdateModal(b)}
                          >
                            <PencilSimple size={20} />
                          </button>
                        </div>
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
                <label className="text-sm font-medium text-slate-700">Select Source Collections</label>
                <div className="border border-slate-200 rounded-lg p-2 max-h-56 overflow-y-auto space-y-1 bg-slate-50 shadow-inner">
                  {passedCollections.map(c => {
                    const isSelected = createData.collection_ids.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-md border transition-all ${isSelected ? 'bg-white border-[#0d5780] shadow-sm' : 'bg-white border-transparent hover:border-slate-300'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-[#0d5780] border-[#0d5780]' : 'bg-slate-50 border-slate-300'
                          }`}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateData(prev => ({ ...prev, collection_ids: [...prev.collection_ids, c.id] }));
                            } else {
                              setCreateData(prev => ({ ...prev, collection_ids: prev.collection_ids.filter(id => id !== c.id) }));
                            }
                          }}
                        />
                        <span className="text-sm font-semibold text-slate-900 flex-1 flex items-center justify-between">
                          <span>
                            {c.donors?.applicants?.first_name} {c.donors?.applicants?.last_name}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs">
                            {c.volume_ml} mL
                          </span>
                        </span>
                      </label>
                    );
                  })}
                  {passedCollections.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-sm bg-white rounded-md border border-slate-200">
                      No collections have passed laboratory tests yet.
                    </div>
                  )}
                </div>
                {createData.collection_ids.length > 0 && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-md p-3 mt-3">
                    <span className="text-sm font-semibold text-blue-900">Total Pooled Volume</span>
                    <span className="text-lg font-black text-blue-700">
                      {passedCollections.filter(c => createData.collection_ids.includes(c.id)).reduce((sum, c) => sum + (c.volume_ml || 0), 0).toLocaleString()} mL
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="create_temp" className="text-sm font-medium text-slate-700">Temperature (°C)</label>
                  <input
                    id="create_temp"
                    type="number"
                    step="0.1"
                    className="admin-modal-input"
                    placeholder="e.g. 62.5"
                    value={createData.temperature_c}
                    onChange={e => setCreateData({ ...createData, temperature_c: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="create_duration" className="text-sm font-medium text-slate-700">Duration (minutes)</label>
                  <input
                    id="create_duration"
                    type="number"
                    className="admin-modal-input"
                    placeholder="e.g. 30"
                    value={createData.duration_minutes}
                    onChange={e => setCreateData({ ...createData, duration_minutes: e.target.value })}
                  />
                </div>
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
                  disabled={isSubmitting || createData.collection_ids.length === 0}
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
