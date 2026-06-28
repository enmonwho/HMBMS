import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { 
  Users, HourglassHigh, CheckCircle, XCircle, 
  MagnifyingGlass, UserPlus, FileText, Check, X,
  User, Phone, Heartbeat, Coffee
} from '@phosphor-icons/react';

interface ApplicantRecord {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  civil_status: string;
  occupation: string;
  email: string;
  contact_number: string;
  street?: string;
  city?: string;
  province?: string;
  zip_code?: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  medical_history: Record<string, unknown> | null;
  lifestyle_history: Record<string, unknown> | null;
  donation_preferences?: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

const QUESTION_MAP: Record<string, string> = {
  // Medical
  q1: 'Have you had any major illnesses, surgeries, or a fever within the last 12 months?',
  q2: 'Have you received a blood transfusion, organ transplant, or tissue graft in the past 12 months?',
  q3: 'Have you gotten a tattoo, microblading, or any body piercing within the last 12 months?',
  q4: 'Do you have a history of cancer, heart disease, high blood pressure, or autoimmune disorders?',
  // Lifestyle
  l1: 'Do you smoke / vape / use electronic cigarettes / use nicotine substitutes?',
  l2: 'Does anyone in your household smoke / vape / use electronic cigarettes?',
  l3: 'Do you take recreational drugs?',
  l4: 'Does anyone in your household take recreational drugs?',
  l5: 'Do you drink alcohol?',
  // Donation Preferences
  d1: 'Where do you plan to express or pump your breast milk?',
  d2: 'How would you prefer to donate your breast milk?',
  d3: 'What is the estimated volume of breast milk you plan to donate?',
  d4: 'Do you already have expressed breast milk available for donation?',
  d5: 'How is your breast milk currently stored?',
  d6: 'Are the breast milk containers clearly labeled with the date of expression?',
  d7: 'What type of freezer was used to store the frozen breast milk?',
  preferredDateTime: 'Preferred Date & Time for Donation/Drop-off'
};

const renderJson = (data: Record<string, unknown> | null | undefined) => {
  if (!data) return <span className="italic text-slate-400">None</span>;
  if (typeof data === 'string') return data;
  const entries = Object.entries(data).filter(([key, v]) => key && v !== null && v !== '');
  if (entries.length === 0) return <span className="italic text-slate-400">None</span>;
  
  return (
    <div className="flex flex-col gap-3 mt-1">
      {entries.map(([k, v]) => (
        <div key={k} className="text-sm bg-white p-3 rounded border border-slate-100 shadow-sm">
          <div className="font-medium text-slate-700 mb-1">
            {QUESTION_MAP[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase()}
          </div>
          <div className="text-slate-800 font-semibold">{String(v)}</div>
        </div>
      ))}
    </div>
  );
};

export default function Applicants() {
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const { role } = useAuth();
  const canEdit = role !== 'Medical Technologist';
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    civil_status: 'Single',
    occupation: '',
    email: '',
    contact_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    medical_history: '',
    lifestyle_history: ''
  });

  async function fetchApplicants() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants((data as ApplicantRecord[]) || []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Auto-create donor if approved
      if (newStatus === 'APPROVED') {
        const donorNumber = `D-${Math.floor(1000 + Math.random() * 9000)}`;
        const { error: donorError } = await supabase
          .from('donors')
          .insert([{
            applicant_id: id,
            donor_number: donorNumber,
            status: 'ACTIVE'
          }]);
          
        if (donorError) {
          console.error('Error creating donor:', donorError);
          alert('Applicant approved, but failed to create Donor record automatically. Please check logs.');
        } else {
          try {
            const applicant = applicants.find(a => a.id === id);
            if (applicant && applicant.contact_number) {
              await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phoneNumber: applicant.contact_number,
                  message: `Congratulations ${applicant.first_name}! Your application to the Makati Human Milk Bank has been accepted.`
                })
              });
            }
          } catch (smsErr) {
            console.error('Failed to send approval SMS:', smsErr);
          }
          alert('Applicant approved and added to Donors directory! SMS notification sent.');
        }
      }
      
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (selectedApplicant?.id === id) {
        setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update applicant status.');
    }
  };

  const handleSendReminder = async () => {
    if (!selectedApplicant) return;
    
    const prefDate = selectedApplicant.donation_preferences?.preferredDateTime as string;
    if (!prefDate) {
      alert("No preferred date and time selected by this applicant.");
      return;
    }
    if (!selectedApplicant.contact_number) {
      alert("Applicant does not have a contact number.");
      return;
    }

    const message = `Hello ${selectedApplicant.first_name}, this is a reminder from HMBMS regarding your donation drop-off scheduled for ${prefDate}. Thank you!`;

    setIsSendingSMS(true);
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: selectedApplicant.contact_number,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send SMS');
      
      alert('SMS Reminder sent successfully!');
    } catch (err) {
      console.error('SMS Error:', err);
      alert('Failed to send SMS. Please ensure your Textbee API keys are configured correctly in the environment variables.');
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .insert([{
          first_name: formData.first_name,
          last_name: formData.last_name,
          age: parseInt(formData.age, 10),
          civil_status: formData.civil_status,
          occupation: formData.occupation,
          email: formData.email,
          contact_number: formData.contact_number,
          street: 'Unspecified',
          city: 'Unspecified',
          province: 'Unspecified',
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_number: formData.emergency_contact_number,
          medical_history: formData.medical_history ? { history: formData.medical_history } : {},
          lifestyle_history: formData.lifestyle_history ? { history: formData.lifestyle_history } : {},
          donation_preferences: {},
          status: 'PENDING'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setApplicants(prev => [data as ApplicantRecord, ...prev]);
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        age: '',
        civil_status: 'Single',
        occupation: '',
        email: '',
        contact_number: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        medical_history: '',
        lifestyle_history: ''
      });
      alert('Applicant successfully registered!');
    } catch (err) {
      console.error('Error creating applicant:', err);
      alert('Failed to register applicant. Email might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApplicants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applicants;
    return applicants.filter(a => {
      const name = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
      return name.includes(q) || (a.contact_number && a.contact_number.includes(q)) || (a.email && a.email.toLowerCase().includes(q));
    });
  }, [applicants, search]);

  const pendingCount = applicants.filter(a => a.status === 'PENDING').length;
  const approvedCount = applicants.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applicants.filter(a => a.status === 'REJECTED').length;

  return (
    <>
      <PageHeader title="Applicant Management" />

      {/* KPI Cards */}
      <div className="admin-stat-grid gap-6 mb-8">
        <div className="admin-stat-card tone-blue p-6 flex flex-col justify-center relative overflow-hidden">
          <Users className="absolute right-[-20px] bottom-[-20px] text-blue-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <Users size={18} /> Total Applicants
          </div>
          <div className="admin-stat-value text-4xl">{applicants.length}</div>
        </div>
        <div className="admin-stat-card tone-amber p-6 flex flex-col justify-center relative overflow-hidden">
          <HourglassHigh className="absolute right-[-20px] bottom-[-20px] text-orange-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <HourglassHigh size={18} /> Pending Review
          </div>
          <div className="admin-stat-value text-4xl">{pendingCount}</div>
        </div>
        <div className="admin-stat-card tone-green p-6 flex flex-col justify-center relative overflow-hidden">
          <CheckCircle className="absolute right-[-20px] bottom-[-20px] text-green-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <CheckCircle size={18} /> Approved
          </div>
          <div className="admin-stat-value text-4xl">{approvedCount}</div>
        </div>
        <div className="admin-stat-card tone-red p-6 flex flex-col justify-center relative overflow-hidden">
          <XCircle className="absolute right-[-20px] bottom-[-20px] text-red-500/10" weight="fill" size={120} />
          <div className="admin-stat-label text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <XCircle size={18} /> Rejected
          </div>
          <div className="admin-stat-value text-4xl">{rejectedCount}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="admin-searchbar mb-0">
          <MagnifyingGlass className="admin-searchbar-icon text-slate-400" size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search applicants"
          />
        </div>
        <button
          className="admin-pill-action-btn bg-(--admin-navy) text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-(--admin-navy-dark) transition-colors flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus size={18} weight="bold" />
          New Applicant
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-with-panel flex gap-6 items-start">
        <div className="admin-table-wrap flex-1 min-h-[500px]">
          <div className="admin-table-scroll overflow-x-auto">
            <table className="admin-table w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Date Applied</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr className="admin-table-empty-row">
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading records...</td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr className="admin-table-empty-row">
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No applicants found.</td>
                  </tr>
                ) : (
                  filteredApplicants.map(a => {
                    const name = `${a.first_name || ''} ${a.last_name || ''}`;
                    return (
                      <tr
                        key={a.id}
                        className="is-clickable hover:bg-slate-50 transition-colors"
                        onClick={() => setSelectedApplicant(a)}
                      >
                        <td className="admin-table-name px-6 py-4 font-medium text-slate-900 flex flex-col">
                          <span>{name}</span>
                          <span className="text-xs font-normal text-slate-400">{a.email}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {a.contact_number}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={a.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-out Panel */}
        {selectedApplicant && (
          <aside className="admin-side-panel w-[380px] lg:w-[420px] shrink-0 flex flex-col overflow-hidden shadow-lg border border-slate-200/60 bg-[#f6f1e7] rounded-xl" aria-label="Applicant details">
            <div className="admin-side-panel-head bg-(--admin-navy) text-white px-6 py-5 flex items-center justify-between">
              <span className="font-bold text-lg tracking-wide flex items-center gap-2">
                <FileText size={20} /> Applicant Review
              </span>
              <button
                type="button"
                className="admin-side-panel-close text-white/80 hover:text-white transition-colors"
                aria-label="Close applicant details"
                onClick={() => setSelectedApplicant(null)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <div className="admin-side-panel-body p-6 flex flex-col gap-6 overflow-y-auto">
              {/* Personal Details Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-(--admin-navy) uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User size={18} /> Personal Details
                </h3>
                <div className="space-y-3">
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Name</span> <span className="font-medium text-slate-900">{selectedApplicant.first_name} {selectedApplicant.last_name}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Age & Civil Status</span> <span className="text-slate-800">{selectedApplicant.age} yrs old, {selectedApplicant.civil_status}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Email</span> <span className="text-slate-800">{selectedApplicant.email}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Contact Number</span> <span className="text-slate-800">{selectedApplicant.contact_number}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Address</span> <span className="text-slate-800">{selectedApplicant.street || ''} {selectedApplicant.city || ''} {selectedApplicant.province || ''}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Occupation</span> <span className="text-slate-800">{selectedApplicant.occupation}</span></p>
                </div>
              </div>

              {/* Emergency Contact Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-(--admin-navy) uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Phone size={18} /> Emergency Contact
                </h3>
                <div className="space-y-3">
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Name</span> <span className="font-medium text-slate-900">{selectedApplicant.emergency_contact_name || 'N/A'}</span></p>
                  <p className="flex flex-col"><span className="text-xs text-slate-500 font-medium">Contact Number</span> <span className="text-slate-800">{selectedApplicant.emergency_contact_number || 'N/A'}</span></p>
                </div>
              </div>

              {/* Medical & Lifestyle Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-(--admin-navy) uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Heartbeat size={18} /> Full Form Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Heartbeat size={14} /> Medical History</p>
                    <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100">
                      {renderJson(selectedApplicant.medical_history)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Coffee size={14} /> Lifestyle History</p>
                    <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100">
                      {renderJson(selectedApplicant.lifestyle_history)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5"><FileText size={14} /> Donation Preferences</p>
                    <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100">
                      {renderJson(selectedApplicant.donation_preferences)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-2 flex flex-col gap-3">
                <div className="pt-2 border-t border-[rgba(0,0,0,0.05)] mb-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-500">Current Status:</span>
                  <StatusPill status={selectedApplicant.status} />
                </div>
                
                {canEdit && (
                  <>
                    {selectedApplicant.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleUpdateStatus(selectedApplicant.id, 'APPROVED')}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                        >
                          <Check size={18} weight="bold" /> Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(selectedApplicant.id, 'REJECTED')}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                        >
                          <X size={18} weight="bold" /> Reject
                        </button>
                      </div>
                    )}
                    
                    {selectedApplicant.status !== 'PENDING' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedApplicant.id, 'PENDING')}
                        className="w-full py-2.5 flex items-center justify-center gap-2 rounded-lg font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Revert to Pending
                      </button>
                    )}

                    {!!selectedApplicant.donation_preferences?.preferredDateTime && !!selectedApplicant.contact_number && (
                      <button
                        onClick={handleSendReminder}
                        disabled={isSendingSMS}
                        className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <Phone size={18} weight="bold" />
                        {isSendingSMS ? 'Sending SMS...' : 'Send SMS Reminder'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content max-w-2xl">
            <div className="admin-modal-header sticky top-0 z-10">
              <h2 className="admin-modal-title">Register New Applicant</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleCreateApplicant} className="admin-modal-body space-y-6">
              {/* Personal Details Section */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="first_name" className="text-sm font-medium text-slate-700">First Name</label>
                    <input id="first_name" required type="text" className="admin-modal-input" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="last_name" className="text-sm font-medium text-slate-700">Last Name</label>
                    <input id="last_name" required type="text" className="admin-modal-input" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="age" className="text-sm font-medium text-slate-700">Age</label>
                    <input id="age" required type="number" min="18" className="admin-modal-input" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="civil_status" className="text-sm font-medium text-slate-700">Civil Status</label>
                    <select id="civil_status" required className="admin-modal-input" value={formData.civil_status} onChange={e => setFormData({ ...formData, civil_status: e.target.value })}>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="occupation" className="text-sm font-medium text-slate-700">Occupation</label>
                    <input id="occupation" required type="text" className="admin-modal-input" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                    <input id="email" required type="email" className="admin-modal-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="contact_number" className="text-sm font-medium text-slate-700">Contact Number</label>
                    <input id="contact_number" required type="text" className="admin-modal-input" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="emergency_name" className="text-sm font-medium text-slate-700">Contact Name</label>
                    <input id="emergency_name" required type="text" className="admin-modal-input" value={formData.emergency_contact_name} onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="emergency_number" className="text-sm font-medium text-slate-700">Contact Number</label>
                    <input id="emergency_number" required type="text" className="admin-modal-input" value={formData.emergency_contact_number} onChange={e => setFormData({ ...formData, emergency_contact_number: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Health History Section */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Health History</h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="medical_history" className="text-sm font-medium text-slate-700">Medical History</label>
                    <textarea id="medical_history" rows={3} className="admin-modal-input resize-none" placeholder="Include any existing conditions, past surgeries, or ongoing treatments." value={formData.medical_history} onChange={e => setFormData({ ...formData, medical_history: e.target.value })}></textarea>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lifestyle_history" className="text-sm font-medium text-slate-700">Lifestyle History</label>
                    <textarea id="lifestyle_history" rows={3} className="admin-modal-input resize-none" placeholder="Include diet preferences, exercise habits, smoking or alcohol consumption." value={formData.lifestyle_history} onChange={e => setFormData({ ...formData, lifestyle_history: e.target.value })}></textarea>
                  </div>
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
                  {isSubmitting ? 'Registering...' : 'Register Applicant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
