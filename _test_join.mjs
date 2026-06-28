import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://razpjifgwmyktcbohomb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhenBqaWZnd215a3RjYm9ob21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NjcxMzIsImV4cCI6MjA5ODE0MzEzMn0.eCGutO_Ngi2lQUxCGo_l15_orsyHBxkysB_yWapVnDM'
);

async function main() {
  const { data, error } = await supabase
    .from('donors')
    .select('*, applicants(*), milk_collections(*)')
    .limit(1);
    
  if (error) {
    console.error('Join Error:', error.message, error.details);
  } else {
    console.log('Join Success:', JSON.stringify(data, null, 2));
  }
}

main();
