import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { MagnifyingGlass, X, Plus } from '@phosphor-icons/react';

interface DispensingRecord {
  id: string;
  beneficiary_id: string;
  inventory_id?: string;
  volume_dispensed_ml: number;
  created_at: string;
  dispensed_date: string;
  beneficiaries?: {
    patient_name: string;
  };
  inventory?: {
    barcode: string;
  };
}

export default function Dispensing() {
  const [records, setRecords] = useState<DispensingRecord[]>([]);
  const [activeBeneficiaries, setActiveBeneficiaries] = useState<any[]>([]);
  const [availableInventory, setAvailableInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    beneficiary_id: '',
    inventory_id: '',
    dispensed_date: new Date().toISOString().split('T')[0],
    contact_number: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchRecords() {
    try {
      setLoading(true);
        const { data, error } = await supabase
        .from('dispensing_records')
        .select(`
          *,
          beneficiaries ( patient_name ),
          inventory ( barcode )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to select * if join fails
        console.error('Error fetching dispensing with join:', error);
        const fallback = await supabase.from('dispensing_records').select('*').order('created_at', { ascending: false });
        if (fallback.data) {
          setRecords(fallback.data as DispensingRecord[]);
        }
      } else {
        setRecords((data as any) || []);
      }

      const { data: benData } = await supabase
        .from('beneficiaries')
        .select('id, patient_name, hospital_id')
        .in('status', ['ACTIVE', 'PENDING']);
      if (benData) {
        setActiveBeneficiaries(benData);
      }

      const { data: invData } = await supabase
        .from('inventory')
        .select('id, barcode, volume_ml')
        .eq('status', 'AVAILABLE');
      if (invData) {
        setAvailableInventory(invData);
      }
    } catch (err) {
      console.error('Error fetching dispensing records:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(d => {
      const name = d.beneficiaries?.patient_name?.toLowerCase() || '';
      const barcode = d.inventory?.barcode?.toLowerCase() || '';
      return name.includes(q) || barcode.includes(q) || d.id.toLowerCase().includes(q) || d.beneficiary_id?.toLowerCase().includes(q);
    });
  }, [records, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedInv = availableInventory.find(i => i.id === formData.inventory_id);
      if (!selectedInv) {
        alert("Please select a valid inventory batch.");
        setIsSubmitting(false);
        return;
      }
      
      const volumeToDispense = selectedInv.volume_ml;

      const { data, error } = await supabase
        .from('dispensing_records')
        .insert([{
          beneficiary_id: formData.beneficiary_id,
          inventory_id: formData.inventory_id,
          volume_dispensed_ml: volumeToDispense,
          dispensed_date: formData.dispensed_date
        }])
        .select(`
          *,
          beneficiaries ( patient_name ),
          inventory ( barcode )
        `)
        .single();

      if (error) throw error;
      
      // Update inventory status
      await supabase
        .from('inventory')
        .update({ status: 'DISPENSED' })
        .eq('id', formData.inventory_id);
        
      setAvailableInventory(prev => prev.filter(i => i.id !== formData.inventory_id));

      // Send SMS notification if a contact number was provided
      if (formData.contact_number) {
        try {
          const selectedBen = activeBeneficiaries.find(b => b.id === formData.beneficiary_id);
          const name = selectedBen?.patient_name || 'Beneficiary';
          await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: formData.contact_number,
              message: `Hello from Makati Human Milk Bank! This is to inform you that the requested ${volumeToDispense}mL of milk for ${name} is now available and ready for dispensing.`
            })
          });
        } catch (smsErr) {
          console.error('Failed to send dispensing SMS:', smsErr);
        }
      }

      setRecords(prev => [data as any, ...prev]);
      setIsModalOpen(false);
      setFormData({
        beneficiary_id: '',
        inventory_id: '',
        dispensed_date: new Date().toISOString().split('T')[0],
        contact_number: '',
      });
      alert(formData.contact_number ? 'Milk successfully dispensed and SMS notification sent!' : 'Milk successfully dispensed!');
    } catch (err) {
      console.error('Error dispensing milk:', err);
      alert('Failed to dispense milk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Dispensing Records" />

      <div className="flex items-center justify-between mb-6">
        <div className="admin-searchbar mb-0 w-full max-w-md">
          <MagnifyingGlass className="admin-searchbar-icon text-slate-400" size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search Beneficiary or Dispensing ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search dispensing record"
          />
        </div>
        <button
          className="admin-pill-action-btn bg-(--admin-navy) text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-(--admin-navy-dark) transition-colors flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} weight="bold" />
          Dispense Milk
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dispensing ID</th>
              <th>Date</th>
              <th>Beneficiary Name</th>
              <th>Batch / Barcode</th>
              <th>Volume</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="admin-table-empty-row">
                <td colSpan={5}>Loading dispensing records...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={6}>No dispensing records found.</td>
              </tr>
            )}
            {!loading && filtered.map(d => (
              <tr key={d.id}>
                <td>{d.id.substring(0, 8)}</td>
                <td>{new Date(d.dispensed_date || d.created_at).toLocaleDateString()}</td>
                <td className="admin-table-name">{d.beneficiaries?.patient_name || d.beneficiary_id}</td>
                <td><span className="font-medium text-slate-700">{d.inventory?.barcode || 'N/A'}</span></td>
                <td>{d.volume_dispensed_ml} ml</td>
                <td>
                  <StatusPill status={'RELEASED'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Dispense Milk</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal-body space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="beneficiary" className="text-sm font-medium text-slate-700">Select Beneficiary</label>
                <select
                  id="beneficiary"
                  required
                  className="admin-modal-input"
                  value={formData.beneficiary_id}
                  onChange={e => setFormData({ ...formData, beneficiary_id: e.target.value })}
                >
                  <option value="" disabled>-- Choose a beneficiary --</option>
                  {activeBeneficiaries.map(b => (
                    <option key={b.id} value={b.id}>{b.patient_name} ({b.hospital_id})</option>
                  ))}
                </select>
                {activeBeneficiaries.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No active beneficiaries available.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="inventory_id" className="text-sm font-medium text-slate-700">Available Inventory Batch</label>
                <select
                  id="inventory_id"
                  required
                  className="admin-modal-input"
                  value={formData.inventory_id}
                  onChange={e => setFormData({ ...formData, inventory_id: e.target.value })}
                >
                  <option value="" disabled>-- Select a bottle/batch --</option>
                  {availableInventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.barcode} ({inv.volume_ml} mL)
                    </option>
                  ))}
                </select>
                {availableInventory.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No milk currently available in inventory.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="date" className="text-sm font-medium text-slate-700">Dispensing Date</label>
                <input
                  id="date"
                  required
                  type="date"
                  className="admin-modal-input"
                  value={formData.dispensed_date}
                  onChange={e => setFormData({ ...formData, dispensed_date: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 mt-4 border-t border-slate-100 pt-4">
                <label htmlFor="contact_number" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  Contact Number <span className="text-xs text-slate-400 font-normal">(Optional SMS Notification)</span>
                </label>
                <input
                  id="contact_number"
                  type="text"
                  className="admin-modal-input"
                  placeholder="e.g. 09123456789"
                  value={formData.contact_number}
                  onChange={e => setFormData({ ...formData, contact_number: e.target.value })}
                />
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
                  disabled={isSubmitting || activeBeneficiaries.length === 0 || availableInventory.length === 0}
                >
                  {isSubmitting ? 'Dispensing...' : 'Confirm Dispensing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
