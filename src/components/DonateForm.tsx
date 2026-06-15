import { useState, useCallback } from 'react'

// ── Types ──
type RadioVal = 'yes' | 'no' | null

interface MedicalHistory {
  q1: RadioVal
  q2: RadioVal
  q3: RadioVal
  q4: RadioVal
}

interface FormState {
  // Personal Details
  firstName: string
  lastName: string
  age: string
  civilStatus: string
  occupation: string
  email: string
  contactNumber: string
  address: string
  // Emergency Contact
  emergencyName: string
  emergencyContact: string
  // Maternal & Infant
  dateOfDelivery: string
  lactationStatus: string
  babyHealthStatus: string
  doctorName: string
  // Medical History
  medicalHistory: MedicalHistory
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
}

const medicalQuestions: { key: keyof MedicalHistory; label: string }[] = [
  {
    key: 'q1',
    label: 'Have you had any major illness, surgery, or fever within the last 12 months?',
  },
  {
    key: 'q2',
    label: 'Have you received a blood transfusion, organ transplant, or tissue graft?',
  },
  {
    key: 'q3',
    label: 'Have you gotten a tattoo, microblading, or piercing within 12 months?',
  },
  {
    key: 'q4',
    label: 'Do you have a history of cancer, heart disease, hypertension, or autoimmune disorders?',
  },
]

export default function DonateForm() {
  const [form, setForm] = useState<FormState>(initialForm)

  const handleChange = useCallback(
    (field: keyof Omit<FormState, 'medicalHistory'>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }))
      },
    []
  )

  const handleMedical = useCallback(
    (key: keyof MedicalHistory, val: RadioVal) => {
      setForm(prev => ({
        ...prev,
        medicalHistory: { ...prev.medicalHistory, [key]: val },
      }))
    },
    []
  )

  // ── Form Submission Handler ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form Data Submitted:", form);
    alert("Thank you! Your donation form has been submitted.");

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
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange('firstName')}
                autoComplete="given-name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="lastName">Last Name*</label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange('lastName')}
                autoComplete="family-name"
                required
              />
            </div>

            <div className="field small">
              <label htmlFor="age">Age*</label>
              <input
                id="age"
                type="number"
                value={form.age}
                onChange={handleChange('age')}
                min="0"
                max="120"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="civilStatus">Civil Status*</label>
              <input
                id="civilStatus"
                type="text"
                value={form.civilStatus}
                onChange={handleChange('civilStatus')}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="occupation">Occupation*</label>
              <input
                id="occupation"
                type="text"
                value={form.occupation}
                onChange={handleChange('occupation')}
                autoComplete="organization-title"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email*</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="contactNumber">Contact Number*</label>
              <input
                id="contactNumber"
                type="text"
                value={form.contactNumber}
                onChange={handleChange('contactNumber')}
                autoComplete="tel"
                required
              />
            </div>

            <div className="field full">
              <label htmlFor="address">Address*</label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                autoComplete="street-address"
                required
              />
            </div>

          </div>

          {/* ── EMERGENCY CONTACT ── */}
          <h2>EMERGENCY CONTACT</h2>
          <div className="form-grid">

            <div className="field">
              <label htmlFor="emergencyName">Name*</label>
              <input
                id="emergencyName"
                type="text"
                value={form.emergencyName}
                onChange={handleChange('emergencyName')}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="emergencyContact">Contact Number*</label>
              <input
                id="emergencyContact"
                type="text"
                value={form.emergencyContact}
                onChange={handleChange('emergencyContact')}
                required
              />
            </div>

          </div>

          {/* ── MATERNAL & INFANT HEALTH STATUS ── */}
          <h2>MATERNAL &amp; INFANT HEALTH STATUS</h2>
          <div className="form-grid">

            <div className="field">
              <label htmlFor="dateOfDelivery">Date of Delivery</label>
              <input
                id="dateOfDelivery"
                type="date"
                value={form.dateOfDelivery}
                onChange={handleChange('dateOfDelivery')}
              />
            </div>

            <div className="field">
              <label htmlFor="lactationStatus">Current Lactation Status*</label>
              <input
                id="lactationStatus"
                type="text"
                value={form.lactationStatus}
                onChange={handleChange('lactationStatus')}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="babyHealthStatus">Baby's Current Health Status</label>
              <input
                id="babyHealthStatus"
                type="text"
                value={form.babyHealthStatus}
                onChange={handleChange('babyHealthStatus')}
              />
            </div>

            <div className="field">
              <label htmlFor="doctorName">Pediatrician/OB-GYN Name*</label>
              <input
                id="doctorName"
                type="text"
                value={form.doctorName}
                onChange={handleChange('doctorName')}
                required
              />
            </div>

          </div>

          {/* ── MEDICAL HISTORY ── */}
          <h2>MEDICAL HISTORY</h2>
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
                    <input
                      type="radio"
                      name={key}
                      aria-label={`${label} - Yes`}
                      checked={form.medicalHistory[key] === 'yes'}
                      onChange={() => handleMedical(key, 'yes')}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={key}
                      aria-label={`${label} - No`}
                      checked={form.medicalHistory[key] === 'no'}
                      onChange={() => handleMedical(key, 'no')}
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── LIFESTYLE & DIET HABITS ── */}
          <h2>LIFESTYLE &amp; DIET HABITS</h2>
          {/* Additional fields can be added here */}

          {/* ── SUBMIT BUTTON ── */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
            <button 
              type="submit" 
              className="btn-blue" 
              style={{ width: '100%', maxWidth: '150px', cursor: 'pointer', textAlign: 'center', border: 'none' }}
            >
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}