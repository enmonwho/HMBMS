// Shared types for the admin interface.
// These mirror the shape the eventual database/API should return —
// once the backend exists, swap the mock data fetches in mockData.ts
// for real API calls without needing to change the page components.

export type ApplicantStatus = 'FOR SCREENING' | 'APPROVED' | 'REJECTED';
export type DonorStatus = 'ACTIVE' | 'INACTIVE';
export type CollectionStatus = 'PENDING LABORATORY' | 'CLEARED' | 'REJECTED';
export type BatchStatus = 'PENDING LABORATORY' | 'PASTEURIZING' | 'COMPLETE';
export type InventoryStatus = 'AVAILABLE' | 'RESERVED' | 'DISPENSED' | 'EXPIRED';

export interface Applicant {
  id: string;
  name: string;
  contactNumber: string;
  age: number;
  civilStatus: string;
  occupation: string;
  address: string;
  dateApplied: string; // DD/MM/YYYY to match design
  status: ApplicantStatus;
}

export interface EmergencyContact {
  name: string;
  contactNumber: string;
}

export interface Donor {
  id: string;
  name: string;
  age: number;
  civilStatus: string;
  occupation: string;
  email: string;
  contactNumber: string;
  address: string;
  emergencyContact: EmergencyContact;
  donationCount: number;
  lastDonation: string; // DD/MM/YYYY
  status: DonorStatus;
  applicationFileUrl?: string;
}

export interface Collection {
  collectionId: string;
  date: string;
  donorName: string;
  volumeLiters: number;
  status: CollectionStatus;
}

export interface LabTest {
  collectionId: string;
  dateCollected: string;
  donorName: string;
  testResultUrl?: string;
  status: CollectionStatus;
}

export interface Batch {
  batchId: string;
  collectionId: string;
  date: string;
  temperatureC?: number;
  durationMinutes?: number;
  status: BatchStatus;
}

export interface InventoryItem {
  batchId: string;
  quantityLiters: number;
  storage: string;
  expiryDate: string;
  status: InventoryStatus;
}

export interface AdminUser {
  name: string;
  role: string;
}

// ── Beneficiaries ──

export type BeneficiaryStatus = 'ACTIVE' | 'INACTIVE';
export type Sex = 'Male' | 'Female';

export interface ParentGuardian {
  name: string;
  relationship: string;
  contactNumber: string;
  email: string;
  address: string;
}

export interface MedicalAffiliation {
  requestingHospital: string;
  wardRoom: string;
  attendingPhysician: string;
}

export interface Beneficiary {
  id: string;
  infantName: string;
  dateOfBirth: string; // DD/MM/YYYY
  gestationalAgeWeeks: number;
  weightKg: number;
  sex: Sex;
  diagnosis: string;
  parentGuardian: ParentGuardian;
  medicalAffiliation: MedicalAffiliation;
  prescriptionFileUrl?: string;
  consentFormUrl?: string;
  affiliatedHospital: string;
  dateRegistered: string; // DD/MM/YYYY
  status: BeneficiaryStatus;
}

// ── Dispensing ──

export type DispensingStatus = 'RELEASED' | 'PENDING';

export interface DispensingRecord {
  dispensingId: string;
  date: string;
  beneficiaryName: string;
  batchId: string;
  volumeMl: number;
  status: DispensingStatus;
}

// ── Hotline ──

export type HotlineStatus = 'OPEN' | 'RESOLVED';

export interface HotlineTicket {
  ticketId: string;
  dateTime: string;
  callerName: string;
  subject: string;
  assignedTo: string;
  status: HotlineStatus;
}

// ── Reports ──

export type ReportType = 'Inventory Summary' | 'Beneficiary Logs' | 'Processing Yield';
export type ReportFormat = 'PDF' | 'CSV';

export interface GeneratedReport {
  reportName: string;
  dateGenerated: string; // DD/MM/YYYY
  generatedBy: string;
  format: ReportFormat;
  downloadUrl?: string;
}

export interface ReportStats {
  totalDonorsThisMonth: number;
  totalVolumeCollectedLiters: number;
  totalVolumeDispensedLiters: number;
  expired: number;
}

// ── User Management ──

export type SystemUserStatus = 'ACTIVE' | 'SUSPENDED';

export interface SystemUser {
  userId: string;
  fullName: string;
  role: string;
  email: string;
  lastLogin: string; // DD/MM/YYYY
  status: SystemUserStatus;
}

