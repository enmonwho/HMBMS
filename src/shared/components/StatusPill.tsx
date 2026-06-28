interface StatusPillProps {
  status: string;
}

// Maps an exact status string to its pill color treatment.
// Centralized here so every table (Applicants, Donors, Collections,
// Laboratory, Pasteurization, Inventory, Beneficiaries, Dispensing,
// Hotline, User Management) renders pills consistently.
//
// Uses exact matches rather than substring checks — substring matching
// previously caused 'INACTIVE' to match the 'ACTIVE' rule before it ever
// reached the dedicated 'INACTIVE' rule.
const PILL_VARIANTS: Record<string, string> = {
  'OPEN': 'admin-pill-open',
  'RESOLVED': 'admin-pill-resolved',
  'PENDING': 'admin-pill-pending',
  'PENDING LABORATORY': 'admin-pill-pending',
  'ACTIVE': 'admin-pill-active',
  'AVAILABLE': 'admin-pill-active',
  'COMPLETE': 'admin-pill-active',
  'CLEARED': 'admin-pill-active',
  'APPROVED': 'admin-pill-active',
  'RELEASED': 'admin-pill-active',
  'INACTIVE': 'admin-pill-neutral',
  'REJECTED': 'admin-pill-rejected',
  'EXPIRED': 'admin-pill-rejected',
  'SUSPENDED': 'admin-pill-rejected',
};

function variantFor(status: string): string {
  const s = status.toUpperCase();
  return PILL_VARIANTS[s] ?? 'admin-pill-pending';
}

export default function StatusPill({ status }: StatusPillProps) {
  return <span className={`admin-pill ${variantFor(status)}`}>{status}</span>;
}
