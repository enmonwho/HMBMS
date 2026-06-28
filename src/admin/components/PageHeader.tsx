import { useEffect, useState } from 'react';
import { supabase } from '../../shared/lib/supabase';
function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const [user, setUser] = useState({ name: 'Loading...', role: 'Loading...' });

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // Attempt to find user details in profiles table
          const { data } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('email', authUser.email)
            .single();

          if (data) {
            setUser({ name: data.full_name, role: data.role });
          } else {
            // Fallback if not yet configured in profiles
            setUser({ name: authUser.email || 'System Admin', role: 'Administrator' });
          }
        } else {
          setUser({ name: 'Guest', role: 'Unauthenticated' });
        }
      } catch (err) {
        console.error('Error fetching user for header:', err);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="admin-page-head">
      <h1>{title}</h1>
      <div className="admin-userchip">
        <div className="admin-userchip-avatar">{initials(user.name)}</div>
        <div>
          <div className="admin-userchip-name">{user.name}</div>
          <div className="admin-userchip-role">{user.role}</div>
        </div>
      </div>
    </div>
  );
}
