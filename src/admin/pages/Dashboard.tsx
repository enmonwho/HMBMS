import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../../shared/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#0ea5e9'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    inventory: 0,
    collections: 0,
    beneficiaries: 0,
  });
  const [collectionData, setCollectionData] = useState<{name: string, volume: number}[]>([]);
  const [donorData, setDonorData] = useState<{name: string, value: number}[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [donorsRes, invRes, collRes, benRes, collectionsList, donorsList] = await Promise.all([
          supabase.from('donors').select('*', { count: 'exact', head: true }),
          supabase.from('inventory').select('*', { count: 'exact', head: true }),
          supabase.from('milk_collections').select('*', { count: 'exact', head: true }),
          supabase.from('beneficiaries').select('*', { count: 'exact', head: true }),
          supabase.from('milk_collections').select('volume_ml, collection_date, created_at'),
          supabase.from('donors').select('status')
        ]);

        setStats({
          totalDonors: donorsRes.count || 0,
          inventory: invRes.count || 0,
          collections: collRes.count || 0,
          beneficiaries: benRes.count || 0,
        });

        // Process Collection Volume by Month
        if (collectionsList.data) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const volumeByMonth = new Map<string, number>();
          
          collectionsList.data.forEach(c => {
            const date = new Date(c.collection_date || c.created_at);
            const key = months[date.getMonth()];
            volumeByMonth.set(key, (volumeByMonth.get(key) || 0) + (c.volume_ml || 0));
          });
          
          const chartData = Array.from(volumeByMonth, ([name, volume]) => ({ name, volume: parseFloat((volume / 1000).toFixed(1)) }));
          
          // Sort months logically - for simplicity we just sort by their index
          chartData.sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
          setCollectionData(chartData);
        }

        // Process Donor Status
        if (donorsList.data) {
          const active = donorsList.data.filter(d => d.status === 'ACTIVE').length;
          const inactive = donorsList.data.filter(d => d.status === 'INACTIVE').length;
          setDonorData([
            { name: 'Active', value: active },
            { name: 'Inactive', value: inactive }
          ]);
        }

        // Process Inventory Alerts
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
        console.error('Error fetching dashboard stats:', err);
      }
    }

    fetchStats();
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" />

      {(totalVolume < 2000 || expiringBatches.length > 0) && (
        <div className="flex flex-col gap-3 mb-6">
          {totalVolume < 2000 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-red-500 font-bold text-xl">⚠️</span>
                <div>
                  <p className="font-bold">Low Stock Alert!</p>
                  <p className="text-sm">Total available milk is dangerously low ({totalVolume} mL). Recommended minimum is 2,000 mL.</p>
                </div>
              </div>
            </div>
          )}
          
          {expiringBatches.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-amber-500 font-bold text-xl">⏱️</span>
                <div>
                  <p className="font-bold">Batches Expiring Soon</p>
                  <p className="text-sm">You have {expiringBatches.length} batch(es) expiring within the next 7 days. Prioritize dispensing these!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Donors</div>
          <div className="admin-stat-value">{stats.totalDonors}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Inventory</div>
          <div className="admin-stat-value">{stats.inventory}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Collections</div>
          <div className="admin-stat-value">{stats.collections}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Beneficiaries</div>
          <div className="admin-stat-value">{stats.beneficiaries}</div>
        </div>
      </div>

      <div className="admin-panel-grid">
        <div className="admin-panel">
          <h2>Monthly Collection Volume (Liters)</h2>
          <div className="admin-panel-box h-[300px]">
            {collectionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="volume" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="admin-panel-empty">No collection data available.</div>
            )}
          </div>
        </div>
        <div className="admin-panel">
          <h2>Donor Demographics</h2>
          <div className="admin-panel-box h-[300px]">
            {donorData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="admin-panel-empty">No donor data available.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
