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
}

export interface AdminNavGroup {
  label: string;
  basePath: string; // used to detect "has-active" highlighting
  children: AdminNavLeaf[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: 'DONOR MANAGEMENT',
    basePath: '/admin/donor-management',
    children: [
      { label: 'APPLICANTS', path: '/admin/donor-management/applicants' },
      { label: 'DONORS', path: '/admin/donor-management/donors' },
      { label: 'COLLECTIONS', path: '/admin/donor-management/collections' },
    ],
  },
  {
    label: 'PROCESSING',
    basePath: '/admin/processing',
    children: [
      { label: 'LABORATORY', path: '/admin/processing/laboratory' },
      { label: 'PASTEURIZATION', path: '/admin/processing/pasteurization' },
      { label: 'INVENTORY', path: '/admin/processing/inventory' },
    ],
  },
  {
    label: 'BENEFICIARIES',
    basePath: '/admin/beneficiaries',
    children: [
      { label: 'BENEFICIARIES', path: '/admin/beneficiaries/list' },
      { label: 'DISPENSING', path: '/admin/beneficiaries/dispensing' },
    ],
  },
  {
    label: 'SUPPORT',
    basePath: '/admin/support',
    children: [
      { label: 'HOTLINE', path: '/admin/support/hotline' },
    ],
  },
  {
    label: 'ADMINISTRATION',
    basePath: '/admin/administration',
    children: [
      { label: 'USER MANAGEMENT', path: '/admin/administration/user-management' },
    ],
  },
];
