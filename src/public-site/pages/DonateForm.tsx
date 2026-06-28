import { useState, useCallback } from 'react'
import { supabase } from '../../shared/lib/supabase'

// ── Types ──
type RadioVal = 'yes' | 'no' | null

interface MedicalHistory {
  q1: RadioVal
  q2: RadioVal
  q3: RadioVal
  q4: RadioVal
}

interface LifestyleHistory {
  l1: RadioVal
  l2: RadioVal
  l3: RadioVal
  l4: RadioVal
  l5: RadioVal
}

interface DonatingMilk {
  d1: string
  d2: string
  d3: string
  d4: string
  d5: string
  d6: string
  d7: string
  preferredDateTime: string
}

interface Consent {
  testing: boolean
  honesty: boolean
  privacy: boolean
}

interface FormState {
  firstName: string
  lastName: string
  age: string
  civilStatus: string
  occupation: string
  email: string
  contactNumber: string
  address: string
  emergencyName: string
  emergencyContact: string
  dateOfDelivery: string
  lactationStatus: string
  babyHealthStatus: string
  doctorName: string
  medicalHistory: MedicalHistory
  lifestyleHistory: LifestyleHistory
  donatingMilk: DonatingMilk
  consent: Consent
}

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  age: '',
  civilStatus: '',
  occupation: '',
  email: '',
  contactNumber: '',
  address: '',
  emergencyName: '',
  emergencyContact: '',
  dateOfDelivery: '',
  lactationStatus: '',
  babyHealthStatus: '',
  doctorName: '',
  medicalHistory: { q1: null, q2: null, q3: null, q4: null },
  lifestyleHistory: { l1: null, l2: null, l3: null, l4: null, l5: null },
  donatingMilk: { d1: '', d2: '', d3: '', d4: '', d5: '', d6: '', d7: '', preferredDateTime: '' },
  consent: { testing: false, honesty: false, privacy: false },
}

// ── Question Data ──
const medicalQuestions: { key: keyof MedicalHistory; label: string }[] = [
  { key: 'q1', label: '1. Have you had any major illnesses, surgeries, or a fever within the last 12 months?*' },
  { key: 'q2', label: '2. Have you received a blood transfusion, organ transplant, or tissue graft in the past 12 months?' },
  { key: 'q3', label: '3. Have you gotten a tattoo, microblading, or any body piercing within the last 12 months?' },
  { key: 'q4', label: '4. Do you have a history of cancer, heart disease, high blood pressure, or autoimmune disorders?' },
]

const lifestyleQuestions: { key: keyof LifestyleHistory; label: string }[] = [
  { key: 'l1', label: '1. Do you smoke / vape / use electronic cigarettes / use nicotine substitutes?' },
  { key: 'l2', label: '2. Does anyone in your household smoke / vape / use electronic cigarettes?' },
  { key: 'l3', label: '3. Do you take recreational drugs?' },
  { key: 'l4', label: '4. Does anyone in your household take recreational drugs?' },
  { key: 'l5', label: '5. Do you drink alcohol?' },
]

const donationQuestions: { key: keyof Omit<DonatingMilk, 'preferredDateTime'>; question: string; subtext?: string; options: string[] }[] = [
  {
    key: 'd1',
    question: '1. Where do you plan to express or pump your breast milk?',
    options: ['At home', 'At the hospital', 'I am not yet sure and would like assistance']
  },
  {
    key: 'd2',
    question: '2. How would you prefer to donate your breast milk?',
    options: [
      "I will pump and store my breast milk at home, then bring is to the hospital for donation. (Mom's Act)",
      'I would like to pump and complete the donation procedure at the hospital (Milky Way)',
      'I would like to donate through an outreach or mobile collection activity in my community (Supsup Todo)'
    ]
  },
  {
    key: 'd3',
    question: '3. What is the estimated volume of breast milk you plan to donate?',
    options: ['Less than 1 liter', '1 to 5 liters', 'More then 5 liters', 'I am not sure yet']
  },
  {
    key: 'd4',
    question: '4. Do you already have expressed breast milk available for donation?',
    options: [
      'Yes, I have breast milk stored at home',
      'No, but I plan to pump breast milk at home',
      'No, I plan to pump breast milk at the hospital',
      'I am not sure yet'
    ]
  },
  {
    key: 'd5',
    question: '5. How is your breast milk currently stored?',
    subtext: 'Please answer only if you have expressed breast milk stored at home.',
    options: [
      'Freshly expressed and refrigerated',
      'Frozen in breast milk storage bags',
      'Frozen in sterile bottle or containers',
      'Others'
    ]
  },
  {
    key: 'd6',
    question: '6. Are the breast milk containers clearly labeled with the date of expression?',
    subtext: 'Please answer only if you have expressed breast milk stored at home.',
    options: [
      'Yes, all containers are labeled',
      'Some containers are labeled',
      'No, the containers are not yet labeled',
      'Not applicable; I plan to pump at the hospital'
    ]
  },
  {
    key: 'd7',
    question: '7. What type of freezer was used to store the frozen breast milk?',
    options: [
      'Refrigerator-freezer combination unit',
      'Chest freezer or dedicated deep freezer',
      'Not applicable; I am donating refrigerated breast milk only'
    ]
  }
]

export default function DonateForm() {
  const [form, setForm] = useState<FormState>(initialForm)

  const handleChange = useCallback(
    (field: keyof Omit<FormState, 'medicalHistory' | 'lifestyleHistory' | 'donatingMilk' | 'consent'>) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }))
      },
    []
  )

  const handleMedical = useCallback((key: keyof MedicalHistory, val: RadioVal) => {
    setForm(prev => ({ ...prev, medicalHistory: { ...prev.medicalHistory, [key]: val } }))
  }, [])

  const handleLifestyle = useCallback((key: keyof LifestyleHistory, val: RadioVal) => {
    setForm(prev => ({ ...prev, lifestyleHistory: { ...prev.lifestyleHistory, [key]: val } }))
  }, [])

  const handleDonatingMilk = useCallback((key: keyof DonatingMilk, val: string) => {
    setForm(prev => ({ ...prev, donatingMilk: { ...prev.donatingMilk, [key]: val } }))
  }, [])

  const handleConsent = useCallback((key: keyof Consent) => {
    setForm(prev => ({ ...prev, consent: { ...prev.consent, [key]: !prev.consent[key] } }))
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('applicants')
        .insert([{
          first_name: form.firstName,
          last_name: form.lastName,
          age: parseInt(form.age, 10) || 0,
          civil_status: form.civilStatus,
          occupation: form.occupation,
          email: form.email,
          contact_number: form.contactNumber,
          street: form.address || 'Unspecified',
          city: 'Unspecified',
          province: 'Unspecified',
          emergency_contact_name: form.emergencyName,
          emergency_contact_number: form.emergencyContact,
          medical_history: {
            ...form.medicalHistory,
            dateOfDelivery: form.dateOfDelivery,
            lactationStatus: form.lactationStatus,
            babyHealthStatus: form.babyHealthStatus,
            doctorName: form.doctorName,
          },
          lifestyle_history: {
            ...form.lifestyleHistory,
          },
          donation_preferences: {
            ...form.donatingMilk,
          },
          status: 'PENDING',
        }]);

      if (error) throw error;

      alert("Thank you! Your donation form has been submitted.");
      setForm(initialForm);
    } catch (error) {
      console.error('Form submission error:', error);
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Failed to submit form: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div 
      className="donate-page-wrap"
      style={{
        backgroundImage: `linear-gradient(rgba(68, 151, 193, 0.85), rgba(68, 151, 193, 0.85)), url('/images/image1.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
        overflow: 'auto'
      }}
    >
      <div className="milk-form-container">
        <div className="milk-logo">
          <img src="/images/mhmb-logo.png" alt="Makati Human Milk Bank" />
        </div>

        <form className="milk-form" onSubmit={handleSubmit}>
          <div className="watermark" aria-hidden="true" />

          {/* ── PERSONAL DETAILS ── */}
          <h2>PERSONAL DETAILS</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="firstName">First Name*</label>
              <input id="firstName" type="text" value={form.firstName} onChange={handleChange('firstName')} required />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last Name*</label>
              <input id="lastName" type="text" value={form.lastName} onChange={handleChange('lastName')} required />
            </div>
            <div className="field small">
              <label htmlFor="age">Age*</label>
              <input id="age" type="number" value={form.age} onChange={handleChange('age')} min="0" max="120" required />
            </div>
            <div className="field">
              <label htmlFor="civilStatus">Civil Status*</label>
              <select id="civilStatus" value={form.civilStatus} onChange={handleChange('civilStatus')} required>
                <option value="" disabled>Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="occupation">Occupation*</label>
              <input id="occupation" type="text" value={form.occupation} onChange={handleChange('occupation')} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email*</label>
              <input id="email" type="email" value={form.email} onChange={handleChange('email')} required />
            </div>
            <div className="field">
              <label htmlFor="contactNumber">Contact Number*</label>
              <input id="contactNumber" type="text" value={form.contactNumber} onChange={handleChange('contactNumber')} required />
            </div>
            <div className="field full">
              <label htmlFor="address">Address*</label>
              <input id="address" type="text" value={form.address} onChange={handleChange('address')} required />
            </div>
          </div>

          {/* ── EMERGENCY CONTACT ── */}
          <h2>EMERGENCY CONTACT</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="emergencyName">Name*</label>
              <input id="emergencyName" type="text" value={form.emergencyName} onChange={handleChange('emergencyName')} required />
            </div>
            <div className="field">
              <label htmlFor="emergencyContact">Contact Number*</label>
              <input id="emergencyContact" type="text" value={form.emergencyContact} onChange={handleChange('emergencyContact')} required />
            </div>
          </div>

          {/* ── MATERNAL & INFANT HEALTH STATUS ── */}
          <h2>MATERNAL &amp; INFANT HEALTH STATUS</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="dateOfDelivery">Date of Delivery</label>
              <input id="dateOfDelivery" type="date" value={form.dateOfDelivery} onChange={handleChange('dateOfDelivery')} />
            </div>
            <div className="field">
              <label htmlFor="lactationStatus">Current Lactation Status*</label>
              <select id="lactationStatus" value={form.lactationStatus} onChange={handleChange('lactationStatus')} required>
                <option value="" disabled>Select status</option>
                <option value="Colostrum (Day 1 to 5 postpartum)">Colostrum (Day 1 to 5 postpartum)</option>
                <option value="Transitional Milk (Day 6 to 14 postpartum)">Transitional Milk (Day 6 to 14 postpartum)</option>
                <option value="Mature Milk (Day 15+ postpartum)">Mature Milk (Day 15+ postpartum)</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="babyHealthStatus">Baby's Current Health Status (if applicable)</label>
              <input id="babyHealthStatus" type="text" value={form.babyHealthStatus} onChange={handleChange('babyHealthStatus')} />
            </div>
            <div className="field">
              <label htmlFor="doctorName">Pediatrician's/OB-GYN's Name*</label>
              <input id="doctorName" type="text" value={form.doctorName} onChange={handleChange('doctorName')} required />
            </div>
          </div>

          {/* ── MEDICAL HISTORY ── */}
          <h2 className="section-title-line">MEDICAL HISTORY</h2>
          <table className="medical-table">
            <thead>
              <tr>
                <th></th>
                <th>YES</th>
                <th>NO</th>
              </tr>
            </thead>
            <tbody>
              {medicalQuestions.map(({ key, label }) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    <input type="radio" name={`med_${key}`} checked={form.medicalHistory[key] === 'yes'} onChange={() => handleMedical(key, 'yes')} required />
                  </td>
                  <td>
                    <input type="radio" name={`med_${key}`} checked={form.medicalHistory[key] === 'no'} onChange={() => handleMedical(key, 'no')} required />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── LIFESTYLE & DIET HABITS ── */}
          <h2 className="section-title-line" style={{ marginTop: '30px' }}>LIFESTYLE &amp; DIET HABITS</h2>
          <table className="medical-table">
            <tbody>
              {lifestyleQuestions.map(({ key, label }) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    <input type="radio" name={`life_${key}`} checked={form.lifestyleHistory[key] === 'yes'} onChange={() => handleLifestyle(key, 'yes')} required />
                  </td>
                  <td>
                    <input type="radio" name={`life_${key}`} checked={form.lifestyleHistory[key] === 'no'} onChange={() => handleLifestyle(key, 'no')} required />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── DONATING BREAST MILK ── */}
          <h2 className="section-title-line" style={{ marginTop: '30px' }}>DONATING BREAST MILK</h2>
          <p className="section-subtitle">Please provide the information below so we can match you with the most suitable milk donation program.</p>
          
          <div className="mcq-list">
            {donationQuestions.map((q) => (
              <div key={q.key} className="mcq-item">
                <p className="mcq-question">{q.question}</p>
                {q.subtext && <p className="mcq-subtext">{q.subtext}</p>}
                
                <div className="mcq-options">
                  {q.options.map((option, idx) => (
                    <label key={idx} className="mcq-label">
                      <input 
                        type="radio" 
                        name={`don_${q.key}`} 
                        value={option}
                        checked={form.donatingMilk[q.key] === option}
                        onChange={(e) => handleDonatingMilk(q.key, e.target.value)}
                        required 
                      />
                      <span className="mcq-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Q8: Date & Time Picker */}
            <div className="mcq-item">
              <p className="mcq-question">8. When are you available for hospital donation, hospital pumping, or community outreach collection?</p>
              <div className="datetime-field">
                <label htmlFor="preferredDateTime">Preferred Date &amp; Time:</label>
                <input 
                  type="datetime-local" 
                  id="preferredDateTime"
                  value={form.donatingMilk.preferredDateTime}
                  onChange={(e) => handleDonatingMilk('preferredDateTime', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── CONSENT, TERMS & DECLARATION ── */}
          <h2 className="section-title-line" style={{ marginTop: '40px' }}>CONSENT, TERMS &amp; DECLARATION</h2>
          <div className="consent-list">
            <label className="consent-label">
              <input 
                type="checkbox" 
                checked={form.consent.testing}
                onChange={() => handleConsent('testing')}
                required
              />
              <span className="consent-text">
                <strong>Testing Authorization.</strong> I consent to have samples of my donated breast milk tested for bacterial contamination and any necessary screening markers to ensure safety for recipient infants.
              </span>
            </label>

            <label className="consent-label">
              <input 
                type="checkbox" 
                checked={form.consent.honesty}
                onChange={() => handleConsent('honesty')}
                required
              />
              <span className="consent-text">
                <strong>Honesty of Disclosure.</strong> I certify that all information provided in the Medical History and Lifestyle sections is true, accurate, and complete to the best of my knowledge.
              </span>
            </label>

            <label className="consent-label">
              <input 
                type="checkbox" 
                checked={form.consent.privacy}
                onChange={() => handleConsent('privacy')}
                required
              />
              <span className="consent-text">
                <strong>Privacy Consent.</strong> I understand that my personal and medical data will be kept strictly confidential and processed solely for the administration of the human milk bank program.
              </span>
            </label>
          </div>

          {/* ── SUBMIT BUTTON ── */}
          <div style={{ marginTop: '50px', marginBottom: '20px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
            <button 
              type="submit" 
              className="btn-blue" 
              style={{ width: '100%', maxWidth: '200px', cursor: 'pointer', textAlign: 'center', border: 'none', padding: '12px 0', fontSize: '1.1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}