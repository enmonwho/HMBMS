import { supabase } from "@/app/shared/lib/supabase";

export async function submitDonorApplication(
  donorDetails: {
    first_name: string;
    last_name: string;
    age: number;
    civil_status: string;
    occupation: string;
    email: string;
    contact_number: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
  },
  medicalHistory: Record<string, unknown>
) {
  // Step 1: Create donor profile
  const { data: donor, error: donorError } = await supabase
    .from("donors")
    .insert({
      ...donorDetails,
      status: "PENDING"
    })
    .select("donor_id")
    .single();

  if (donorError) throw donorError;
  if (!donor) throw new Error("Failed to create donor");

  // Step 2: Save complete answers as JSON inside the form_data column
  const { error: appError } = await supabase
    .from("donor_applications")
    .insert({
      donor_id: donor.donor_id,
      form_data: {
        personal_details: donorDetails,
        medical_history: medicalHistory,
      },
      review_status: "PENDING"
    });

  if (appError) throw appError;

  return { success: true };
}
