import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusPill from '../../shared/components/StatusPill';
import { supabase } from '../../shared/lib/supabase';

interface CollectionRecord {
  id: string;
  barcode: string;
  collection_date: string;
  volume_ml: number;
  status: string;
  donors: {
    applicants: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export default function Collections() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCollections() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('milk_collections')
        .select(`
          id,
          barcode,
          collection_date,
          volume_ml,
          status,
          donors (
            applicants (
              first_name,
              last_name
            )
          )
        `)
        .order('collection_date', { ascending: false });

      if (error) throw error;
      setCollections((data as any) || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <>
      <PageHeader title="Collection Records" />

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table w-full text-left">
          <thead>
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Barcode / ID</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Donor Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Volume</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr className="admin-table-empty-row">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading collections...</td>
              </tr>
            ) : collections.length === 0 ? (
              <tr className="admin-table-empty-row">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No collections recorded yet.</td>
              </tr>
            ) : (
              collections.map(c => {
                const donorName = `${c.donors?.applicants?.first_name || ''} ${c.donors?.applicants?.last_name || ''}`.trim();
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--admin-navy)' }}>
                      {c.barcode || c.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(c.collection_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {donorName || 'Unknown Donor'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.volume_ml} mL
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={c.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
