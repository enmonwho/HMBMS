// Sidebar nav structure, matching the Canva design exactly:
// Dashboard | Donor Management > Applicants/Donors/Collections
// | Processing > Laboratory/Pasteurization/Inventory
// | Beneficiaries > Beneficiaries/Dispensing
// | Support > Hotline
// | Reports
// | Administration > User Management
//
// Routes for items not yet designed (Beneficiaries, Dispensing, Hotline,
// Reports, User Management) are included so the nav matches the spec,
// but point at a placeholder page until those screens are designed.

export interface AdminNavLeaf {
  label: string;
  path: string;
  allowedRoles: string[];
}

export interface AdminNavGroup {
  label: string;
  basePath: string; // used to detect "has-active" highlighting
  allowedRoles: string[]; // roles that can see the group
  children: AdminNavLeaf[];
}

const ALL_ROLES = ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife', 'Medical Technologist'];

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: 'DONOR MANAGEMENT',
    basePath: '/donor-management',
    allowedRoles: ALL_ROLES,
    children: [
      { label: 'APPLICANTS', path: '/donor-management/applicants', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Midwife', 'Medical Technologist'] }, // No Attendant
      { label: 'DONORS', path: '/donor-management/donors', allowedRoles: ALL_ROLES },
      { label: 'COLLECTIONS', path: '/donor-management/collections', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'] }, // No Med Tech
    ],
  },
  {
    label: 'PROCESSING',
    basePath: '/processing',
    allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife', 'Medical Technologist'], // Midwife has view to lab, so can see the group
    children: [
      { label: 'LABORATORY', path: '/processing/laboratory', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Midwife', 'Medical Technologist'] }, // No Attendant
      { label: 'PASTEURIZATION', path: '/processing/pasteurization', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Medical Technologist'] }, // No Midwife
      { label: 'INVENTORY', path: '/processing/inventory', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Medical Technologist'] }, // No Midwife
    ],
  },
  {
    label: 'BENEFICIARIES',
    basePath: '/beneficiaries',
    allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'], // No Med Tech
    children: [
      { label: 'BENEFICIARIES', path: '/beneficiaries/list', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'] },
      { label: 'DISPENSING', path: '/beneficiaries/dispensing', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'] },
    ],
  },
  {
    label: 'SUPPORT',
    basePath: '/support',
    allowedRoles: ALL_ROLES,
    children: [
      { label: 'HOTLINE', path: '/support/hotline', allowedRoles: ALL_ROLES },
    ],
  },
  {
    label: 'ADMINISTRATION',
    basePath: '/administration',
    allowedRoles: ['Administrator'],
    children: [
      { label: 'USER MANAGEMENT', path: '/administration/user-management', allowedRoles: ['Administrator'] },
    ],
  },
];
