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
    basePath: '/admin/donor-management',
    allowedRoles: ALL_ROLES,
    children: [
      { label: 'APPLICANTS', path: '/admin/donor-management/applicants', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Midwife', 'Medical Technologist'] }, // No Attendant
      { label: 'DONORS', path: '/admin/donor-management/donors', allowedRoles: ALL_ROLES },
      { label: 'COLLECTIONS', path: '/admin/donor-management/collections', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'] }, // No Med Tech
    ],
  },
  {
    label: 'PROCESSING',
    basePath: '/admin/processing',
    allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife', 'Medical Technologist'], // Midwife has view to lab, so can see the group
    children: [
      { label: 'LABORATORY', path: '/admin/processing/laboratory', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Midwife', 'Medical Technologist'] }, // No Attendant
      { label: 'PASTEURIZATION', path: '/admin/processing/pasteurization', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Medical Technologist'] }, // No Midwife
      { label: 'INVENTORY', path: '/admin/processing/inventory', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Medical Technologist'] }, // No Midwife
    ],
  },
  {
    label: 'BENEFICIARIES',
    basePath: '/admin/beneficiaries',
    allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'], // No Med Tech
    children: [
      { label: 'BENEFICIARIES', path: '/admin/beneficiaries/list', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'] },
      { label: 'DISPENSING', path: '/admin/beneficiaries/dispensing', allowedRoles: ['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife'] },
    ],
  },
  {
    label: 'SUPPORT',
    basePath: '/admin/support',
    allowedRoles: ALL_ROLES,
    children: [
      { label: 'HOTLINE', path: '/admin/support/hotline', allowedRoles: ALL_ROLES },
    ],
  },
  {
    label: 'ADMINISTRATION',
    basePath: '/admin/administration',
    allowedRoles: ['Administrator'],
    children: [
      { label: 'USER MANAGEMENT', path: '/admin/administration/user-management', allowedRoles: ['Administrator'] },
    ],
  },
];
