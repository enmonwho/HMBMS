import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { PencilSimple, X } from '@phosphor-icons/react';

interface InventoryItem {
  id: string;
  barcode: string;
  volume_ml: number;
  status: string;
  created_at: string;
  expiry_date: string;
  storage_location: string;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchInventory() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory((data as InventoryItem[]) || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  const openModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({ status: newStatus })
        .eq('id', selectedItem.id)
        .select()
        .single();

      if (error) throw error;
      setInventory(prev => prev.map(i => i.id === selectedItem.id ? data : i));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const available = inventory.filter(i => i.status === 'AVAILABLE').length;
  const reserved = inventory.filter(i => i.status === 'RESERVED').length;
  const dispensed = inventory.filter(i => i.status === 'DISPENSED').length;
  const expired = inventory.filter(i => i.status === 'EXPIRED').length;

  return (
    <>
      <PageHeader title="Inventory" />

      <div className="admin-stat-grid">
        <div className="admin-stat-card tone-green">
          <div className="admin-stat-label">Available</div>
          <div className="admin-stat-value">{available}</div>
        </div>
        <div className="admin-stat-card tone-amber">
          <div className="admin-stat-label">Reserved</div>
          <div className="admin-stat-value">{reserved}</div>
        </div>
        <div className="admin-stat-card tone-blue">
          <div className="admin-stat-label">Dispensed</div>
          <div className="admin-stat-value">{dispensed}</div>
        </div>
        <div className="admin-stat-card tone-red">
          <div className="admin-stat-label">Expired</div>
          <div className="admin-stat-value">{expired}</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Batch ID / Barcode</th>
                <th>Quantity</th>
                <th>Storage</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="admin-table-empty-row">
                  <td colSpan={5}>Loading inventory...</td>
                </tr>
              )}
              {!loading && inventory.length === 0 && (
                <tr className="admin-table-empty-row">
                  <td colSpan={5}>No inventory items yet.</td>
                </tr>
              )}
              {!loading && inventory.map(item => (
                <tr key={item.id}>
                  <td>{item.barcode || item.id}</td>
                  <td>{item.volume_ml} mL</td>
                  <td>{item.storage_location || 'N/A'}</td>
                  <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <StatusPill status={item.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-edit-btn"
                      onClick={() => openModal(item)}
                    >
                      <PencilSimple size={16} /> Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {isModalOpen && selectedItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Update Status</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="admin-modal-body space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-2">Item Barcode: <span className="font-semibold text-slate-800">{selectedItem.barcode}</span></p>
                <label htmlFor="status" className="text-sm font-medium text-slate-700 block mb-1">New Status</label>
                <select
                  id="status"
                  required
                  className="admin-modal-input"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="DISPENSED">Dispensed</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="DISCARDED">Discarded</option>
                </select>
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
