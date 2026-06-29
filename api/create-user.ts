export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, password, user_id, full_name, role } = await request.json();

    if (!email || !password || !full_name || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: missing Supabase credentials' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Create the auth user using the Admin API (service role key)
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true, // Auto-confirm the email so they can login immediately
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('Supabase auth error:', errorData);
      return new Response(JSON.stringify({ error: errorData.msg || errorData.message || 'Failed to create auth user' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authUser = await authResponse.json();

    // 2. Insert the profile record using the service role key (bypasses RLS)
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: user_id || authUser.id,
        full_name,
        role,
        email,
        status: 'ACTIVE',
      }),
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.json();
      console.error('Profile insert error:', profileError);
      return new Response(JSON.stringify({ error: profileError.message || 'Failed to create profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const profileData = await profileResponse.json();

    return new Response(JSON.stringify({ success: true, user: profileData[0] || profileData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
