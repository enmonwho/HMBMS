import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { PencilSimple, X, Warning, Info } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatVolume } from '../../shared/lib/formatters';

interface InventoryItem {
  id: string;
  barcode: string;
  volume_ml: number;
  status: string;
  created_at: string;
  expiry_date: string;
  storage_location: string;
}

interface ChartDataPoint {
  name: string;
  Collected: number;
  Dispensed: number;
  Discarded: number;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [monthDispensed, setMonthDispensed] = useState(0);
  const [monthDiscarded, setMonthDiscarded] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { role } = useAuth();
  const canEdit = !role || ['Administrator', 'Coordinator'].includes(role);

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true);
        const [invRes, dispRes, collRes] = await Promise.all([
          supabase.from('inventory').select('*').order('created_at', { ascending: false }),
          supabase.from('dispensing_records').select('volume_dispensed_ml, dispensed_date, created_at'),
          supabase.from('milk_collections').select('volume_ml, collection_date, created_at')
        ]);

        if (invRes.error) throw invRes.error;
        const invData = (invRes.data as InventoryItem[]) || [];
        setInventory(invData);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let tMonthDispensed = 0;
        let tMonthDiscarded = 0;

        if (dispRes.data) {
          tMonthDispensed = dispRes.data
            .filter(d => {
              const dDate = d.dispensed_date ? new Date(d.dispensed_date) : new Date(d.created_at);
              return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + (item.volume_dispensed_ml || 0), 0);
        }

        if (invData) {
          tMonthDiscarded = invData
            .filter(i => (i.status === 'EXPIRED' || i.status === 'DISCARDED') && new Date(i.created_at).getMonth() === currentMonth && new Date(i.created_at).getFullYear() === currentYear)
            .reduce((sum, item) => sum + (item.volume_ml || 0), 0);
        }

        setMonthDispensed(tMonthDispensed);
        setMonthDiscarded(tMonthDiscarded);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartMap = new Map();
        
        for (let i = 5; i >= 0; i--) {
           const d = new Date();
           d.setMonth(d.getMonth() - i);
           const key = `${months[d.getMonth()]}`;
           chartMap.set(key, { name: key, Collected: 0, Dispensed: 0, Discarded: 0 });
        }

        if (collRes.data) {
          collRes.data.forEach(c => {
            const dDate = c.collection_date ? new Date(c.collection_date) : new Date(c.created_at);
            const key = `${months[dDate.getMonth()]}`;
            if (chartMap.has(key)) chartMap.get(key).Collected += (c.volume_ml || 0) / 1000;
          });
        }

        if (dispRes.data) {
          dispRes.data.forEach(d => {
            const dDate = d.dispensed_date ? new Date(d.dispensed_date) : new Date(d.created_at);
            const key = `${months[dDate.getMonth()]}`;
            if (chartMap.has(key)) chartMap.get(key).Dispensed += (d.volume_dispensed_ml || 0) / 1000;
          });
        }

        if (invData) {
          invData.forEach(i => {
            if (i.status === 'EXPIRED' || i.status === 'DISCARDED') {
              const date = new Date(i.created_at);
              const key = `${months[date.getMonth()]}`;
              if (chartMap.has(key)) chartMap.get(key).Discarded += (i.volume_ml || 0) / 1000;
            }
          });
        }

        setChartData(Array.from(chartMap.values()).map(item => ({
          ...item,
          Collected: parseFloat(item.Collected.toFixed(1)),
          Dispensed: parseFloat(item.Dispensed.toFixed(1)),
          Discarded: parseFloat(item.Discarded.toFixed(1)),
        })));

      } catch (err) {
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    }

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

  const availableVolume = inventory.filter(i => i.status === 'AVAILABLE').reduce((sum, item) => sum + (item.volume_ml || 0), 0);

  return (
    <>
      <PageHeader title="Inventory" />

      <div className="admin-stat-grid mb-6">
        <div className="admin-stat-card tone-blue">
          <div className="admin-stat-label">Current stock</div>
          <div className="admin-stat-value">{formatVolume(availableVolume)}</div>
          {availableVolume < 5000 && (
            <div className="mt-2 text-[0.9rem] font-semibold text-red-600 flex items-center gap-1.5">
              <Warning size={16} weight="bold" /> Low stock level
            </div>
          )}
        </div>
        
        <div className="admin-stat-card tone-amber">
          <div className="admin-stat-label">Min. threshold</div>
          <div className="admin-stat-value">{formatVolume(5000)}</div>
          <div className="text-slate-500 text-xs font-medium mt-1">Safety floor</div>
        </div>

        <div className="admin-stat-card tone-green">
          <div className="admin-stat-label">Dispensed</div>
          <div className="admin-stat-value">{formatVolume(monthDispensed)}</div>
          <div className="text-slate-500 text-xs font-medium mt-1">This month</div>
        </div>

        <div className="admin-stat-card tone-red">
          <div className="admin-stat-label">Discarded</div>
          <div className="admin-stat-value">{formatVolume(monthDiscarded)}</div>
          <div className="text-slate-500 text-xs font-medium mt-1">This month</div>
        </div>
      </div>

      <div className="admin-panel mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2>Monthly inventory volume (liters)</h2>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#0ea5e9] rounded-[2px]"></div> Collected
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#10b981] rounded-[2px]"></div> Dispensed
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#f43f5e] rounded-[2px]"></div> Discarded
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-[2px] border-t-2 border-dashed border-[#f59e0b]"></div> Min. threshold
            </div>
          </div>
        </div>
        
        <div className="admin-panel-box p-6 pb-5">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={v => `${v} L`} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155'}} />
                <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
                <Bar dataKey="Collected" fill="#0ea5e9" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="Dispensed" fill="#10b981" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="Discarded" fill="#f43f5e" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {availableVolume < 5000 && (
          <div className="mt-4 bg-orange-50 border-l-[3px] border-orange-500 rounded-r p-2.5 flex items-start gap-2 shadow-sm">
            <Info className="text-orange-600 shrink-0 mt-0.5" size={16} weight="fill" />
            <p className="text-sm font-medium text-orange-900 leading-snug">
              Stock levels below <strong className="font-bold text-orange-950">5.0 L</strong> trigger a low stock alert. Contact active donors or escalate to the Coordinator for urgent collection scheduling.
            </p>
          </div>
        )}
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
                  <td colSpan={6}>Loading inventory...</td>
                </tr>
              )}
              {!loading && inventory.length === 0 && (
                <tr className="admin-table-empty-row">
                  <td colSpan={6}>No inventory items yet.</td>
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
                    {canEdit && (
                      <button
                        type="button"
                        className="admin-edit-btn"
                        title="Update Status"
                        onClick={() => openModal(item)}
                      >
                        <PencilSimple size={18} />
                      </button>
                    )}
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
