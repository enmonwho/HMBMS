import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://razpjifgwmyktcbohomb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhenBqaWZnd215a3RjYm9ob21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NjcxMzIsImV4cCI6MjA5ODE0MzEzMn0.eCGutO_Ngi2lQUxCGo_l15_orsyHBxkysB_yWapVnDM'
);

// From the insert error for donors:
// Failing row contains (uuid, null, null, null, ACTIVE, timestamp, timestamp, null)
// 8 columns: id, ?, ?, ?, status, created_at, updated_at, ?
// donor_number is NOT NULL => one of the nulls

// Let me try selecting specific column candidates
async function tryCol(table, col) {
  const { error } = await supabase.from(table).select(col).limit(0);
  if (!error) return true;
  return false;
}

async function main() {
  const donorCandidates = [
    'id', 'donor_number', 'applicant_id', 'first_name', 'last_name', 'full_name', 'name',
    'age', 'date_of_birth', 'civil_status', 'occupation', 'email', 'contact_number', 'phone',
    'address', 'emergency_contact_name', 'emergency_contact_number', 'emergency_contact',
    'donation_count', 'last_donation', 'last_donation_date', 'status', 'created_at', 'updated_at',
    'notes', 'application_file_url', 'approved_at', 'approved_by', 'screening_date',
    'blood_type', 'medical_history', 'lifestyle_history', 'consent'
  ];

  console.log('=== DONORS COLUMNS ===');
  for (const col of donorCandidates) {
    const exists = await tryCol('donors', col);
    if (exists) console.log(`  ✓ ${col}`);
  }

  const applicantCandidates = [
    'id', 'first_name', 'last_name', 'full_name', 'name', 'age', 'date_of_birth',
    'civil_status', 'occupation', 'email', 'contact_number', 'phone', 'address',
    'emergency_contact_name', 'emergency_contact_number', 'emergency_contact',
    'date_of_delivery', 'lactation_status', 'baby_health_status', 'doctor_name',
    'medical_history', 'lifestyle_history', 'donating_milk', 'consent',
    'date_applied', 'status', 'created_at', 'updated_at', 'notes',
    'preferred_datetime', 'screening_date', 'approved_at', 'approved_by',
    'donor_id'
  ];

  console.log('\n=== APPLICANTS COLUMNS ===');
  for (const col of applicantCandidates) {
    const exists = await tryCol('applicants', col);
    if (exists) console.log(`  ✓ ${col}`);
  }

  const collectionCandidates = [
    'id', 'collection_id', 'collection_number', 'collection_date', 'date',
    'donor_id', 'donor_name', 'volume_ml', 'volume_liters', 'volume',
    'method', 'collection_method', 'collection_site', 'notes',
    'status', 'created_at', 'updated_at', 'batch_id', 'storage_temperature',
    'expiry_date'
  ];

  console.log('\n=== MILK_COLLECTIONS COLUMNS ===');
  for (const col of collectionCandidates) {
    const exists = await tryCol('milk_collections', col);
    if (exists) console.log(`  ✓ ${col}`);
  }
}

main();
