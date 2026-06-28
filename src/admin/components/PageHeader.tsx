import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { Bell, Warning, Clock } from '@phosphor-icons/react';

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
  const [totalVolume, setTotalVolume] = useState(0);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('email', authUser.email)
            .single();

          if (data) {
            setUser({ name: data.full_name, role: data.role });
          } else {
            setUser({ name: authUser.email || 'System Admin', role: 'Administrator' });
          }
        } else {
          setUser({ name: 'Guest', role: 'Unauthenticated' });
        }
      } catch (err) {
        console.error('Error fetching user for header:', err);
      }
    }
    
    async function fetchAlerts() {
      try {
        const { data: invList } = await supabase.from('inventory').select('id, barcode, volume_ml, expiry_date').eq('status', 'AVAILABLE');
        if (invList) {
          const totalVol = invList.reduce((sum, item) => sum + (item.volume_ml || 0), 0);
          setTotalVolume(totalVol);
          
          const now = new Date();
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(now.getDate() + 7);
          
          const expiring = invList.filter(item => {
             if (!item.expiry_date) return false;
             const expDate = new Date(item.expiry_date);
             return expDate <= sevenDaysFromNow;
          });
          setExpiringBatches(expiring);
        }
      } catch (err) {
        console.error('Error fetching inventory alerts:', err);
      }
    }

    fetchUser();
    fetchAlerts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const hasLowStock = totalVolume < 2000;
  const hasExpiring = expiringBatches.length > 0;
  const alertCount = (hasLowStock ? 1 : 0) + (hasExpiring ? 1 : 0);

  return (
    <div className="admin-page-head flex items-center justify-between relative">
      <h1>{title}</h1>
      <div className="flex items-center gap-6">
        
        <div className="relative" ref={notifRef}>
          <button 
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={24} />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Notifications</span>
                {alertCount > 0 && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{alertCount}</span>}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {alertCount === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                ) : (
                  <div className="flex flex-col">
                    {hasLowStock && (
                      <div className="p-4 border-b border-slate-100 flex items-start gap-3 bg-red-50/50">
                        <Warning className="text-red-500 mt-0.5 shrink-0" weight="fill" size={20} />
                        <div>
                          <p className="text-sm font-bold text-red-800 mb-0.5">Low Stock Alert!</p>
                          <p className="text-xs text-red-700">Total available milk is dangerously low ({totalVolume} mL). Recommended minimum is 2,000 mL.</p>
                        </div>
                      </div>
                    )}
                    {hasExpiring && (
                      <div className="p-4 border-b border-slate-100 flex items-start gap-3 bg-amber-50/50">
                        <Clock className="text-amber-500 mt-0.5 shrink-0" weight="fill" size={20} />
                        <div>
                          <p className="text-sm font-bold text-amber-800 mb-0.5">Batches Expiring Soon</p>
                          <p className="text-xs text-amber-700">You have {expiringBatches.length} batch(es) expiring within the next 7 days.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-userchip">
          <div className="admin-userchip-avatar">{initials(user.name)}</div>
          <div>
            <div className="admin-userchip-name">{user.name}</div>
            <div className="admin-userchip-role">{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
