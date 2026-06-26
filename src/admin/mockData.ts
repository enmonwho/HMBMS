// Mock data for frontend development.
// Replace each export with a real fetch call once the backend/database branch lands —
// page components consume these the same way they'd consume API responses.

import type {
  Applicant,
  Donor,
  Collection,
  LabTest,
  Batch,
  InventoryItem,
  AdminUser,
  Beneficiary,
  DispensingRecord,
  HotlineTicket,
  GeneratedReport,
  ReportStats,
  SystemUser,
} from './types';

export const currentUser: AdminUser = {
  name: 'Mary Grace Piattos',
  role: 'Administrator',
};

export const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'Aurora Grace Cruz',
    contactNumber: '09123456789',
    age: 26,
    civilStatus: 'Married',
    occupation: 'Housewife',
    address: '8751 Paseo de Roxas Street, San Miguel Village, Barangay Poblacion, Makati City',
    dateApplied: '23/06/2026',
    status: 'FOR SCREENING',
  },
];

export const mockDonors: Donor[] = [
  {
    id: '1',
    name: 'Aurora Grace Cruz',
    age: 26,
    civilStatus: 'Married',
    occupation: 'Housewife',
    email: 'aurgracru@gmail.com',
    contactNumber: '09123456789',
    address: '8751 Paseo de Roxas Street, San Miguel Village,',
    emergencyContact: {
      name: 'Jose Antonio Cruz',
      contactNumber: '09876543210',
    },
    donationCount: 1,
    lastDonation: '25/6/2026',
    status: 'ACTIVE',
  },
];

export const mockCollections: Collection[] = [
  {
    collectionId: '0001',
    date: '25/6/2026',
    donorName: 'Aurora Grace Cruz',
    volumeLiters: 1,
    status: 'PENDING LABORATORY',
  },
];

export const mockLabTests: LabTest[] = [
  {
    collectionId: '0001',
    dateCollected: '25/6/2026',
    donorName: 'Aurora Grace Cruz',
    status: 'PENDING LABORATORY',
  },
];

export const mockBatches: Batch[] = [
  {
    batchId: '1000',
    collectionId: '0001',
    date: '25/6/2026',
    status: 'PENDING LABORATORY',
  },
];

export const mockInventory: InventoryItem[] = [];

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: '1',
    infantName: 'Baby Juan Dela Cruz',
    dateOfBirth: '15/6/2026',
    gestationalAgeWeeks: 34,
    weightKg: 1.8,
    sex: 'Male',
    diagnosis: 'Preterm, Low Birth Weight, Maternal Illness',
    parentGuardian: {
      name: 'Maria Dela Cruz',
      relationship: 'Mother',
      contactNumber: '09171234567',
      email: 'mariadelacruz@gmail.com',
      address: '123 Sampaguita St., Brgy. Pembo, Makati City',
    },
    medicalAffiliation: {
      requestingHospital: 'Makati Medical Center',
      wardRoom: 'NICU - Bed 4',
      attendingPhysician: 'Dr. Sarah Lee',
    },
    affiliatedHospital: 'Makati Medical Center',
    dateRegistered: '26/6/2026',
    status: 'ACTIVE',
  },
  {
    id: '2',
    infantName: 'Baby Ana Santos',
    dateOfBirth: '—',
    gestationalAgeWeeks: 0,
    weightKg: 0,
    sex: 'Female',
    diagnosis: '—',
    parentGuardian: {
      name: 'Pedro Santos',
      relationship: '—',
      contactNumber: '—',
      email: '—',
      address: '—',
    },
    medicalAffiliation: {
      requestingHospital: 'Ospital ng Makati',
      wardRoom: '—',
      attendingPhysician: '—',
    },
    affiliatedHospital: 'Ospital ng Makati',
    dateRegistered: '26/6/2026',
    status: 'INACTIVE',
  },
];

export const mockDispensingRecords: DispensingRecord[] = [
  {
    dispensingId: 'D-001',
    date: '26/6/2026',
    beneficiaryName: 'Baby Juan Dela Cruz',
    batchId: '1000',
    volumeMl: 500,
    status: 'RELEASED',
  },
  {
    dispensingId: 'D-002',
    date: '26/6/2026',
    beneficiaryName: 'Baby Ana Santos',
    batchId: '1002',
    volumeMl: 250,
    status: 'PENDING',
  },
];

export const mockHotlineTickets: HotlineTicket[] = [
  {
    ticketId: 'T-1042',
    dateTime: '26/6/2026, 10:00 AM',
    callerName: 'Aurora Grace Cruz',
    subject: 'Donation Inquiry',
    assignedTo: 'Admin',
    status: 'OPEN',
  },
  {
    ticketId: 'T-1041',
    dateTime: '25/6/2026, 2:30 PM',
    callerName: 'Ospital ng Makati',
    subject: 'Emergency Request',
    assignedTo: 'Admin',
    status: 'RESOLVED',
  },
];

export const mockGeneratedReports: GeneratedReport[] = [
  {
    reportName: 'May 2026 Inventory Summary',
    dateGenerated: '01/6/2026',
    generatedBy: 'Mary Grace Piattos',
    format: 'PDF',
  },
  {
    reportName: 'May 2026 Inventory Summary',
    dateGenerated: '01/6/2026',
    generatedBy: 'Mary Grace Piattos',
    format: 'CSV',
  },
];

export const mockReportStats: ReportStats = {
  totalDonorsThisMonth: 0,
  totalVolumeCollectedLiters: 0,
  totalVolumeDispensedLiters: 0,
  expired: 0,
};

export const mockSystemUsers: SystemUser[] = [
  {
    userId: 'Admin',
    fullName: 'Mary Grace Piattos',
    role: 'Administrator',
    email: 'admin@makatimilkbank.gov',
    lastLogin: '26/6/2026',
    status: 'ACTIVE',
  },
  {
    userId: 'Admin',
    fullName: 'Itallianis Pringles',
    role: 'Coordinator',
    email: 'coord@makatimilkbank.gov',
    lastLogin: '26/6/2026',
    status: 'ACTIVE',
  },
  {
    userId: 'Admin',
    fullName: 'Jollibee Cracklings',
    role: 'Nurse',
    email: 'nurse@makatimilkbank.gov',
    lastLogin: '26/6/2026',
    status: 'SUSPENDED',
  },
  {
    userId: 'Admin',
    fullName: 'Tape Nade Lays',
    role: 'Nurse Attendant',
    email: 'na@makatimilkbank.gov',
    lastLogin: '26/6/2026',
    status: 'ACTIVE',
  },
  {
    userId: 'Admin',
    fullName: 'Fridays Mac Conkey',
    role: 'Medical Technologist',
    email: 'medtech@makatimilkbank.gov',
    lastLogin: '26/6/2026',
    status: 'ACTIVE',
  },
  {
    userId: 'Admin',
    fullName: 'Watami Eosin Methylene',
    role: 'Midwife',
    email: 'midwife@makatimilkbank.gov',
    lastLogin: '26/6/2026',
    status: 'ACTIVE',
  },
];

export const dashboardStats = {
  totalDonors: mockDonors.length,
  inventory: mockInventory.length,
  collections: mockCollections.length,
  beneficiaries: mockBeneficiaries.length,
};
