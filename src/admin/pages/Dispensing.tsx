import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockDispensingRecords } from '../mockData';

export default function Dispensing() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockDispensingRecords;
    return mockDispensingRecords.filter(d =>
      d.beneficiaryName.toLowerCase().includes(q) ||
      d.dispensingId.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      <PageHeader title="Dispensing Records" />

      <div className="admin-searchbar">
        <span className="admin-searchbar-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search Beneficiary or Dispensing ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search dispensing record"
        />
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dispensing ID</th>
              <th>Date</th>
              <th>Beneficiary Name</th>
              <th>Batch ID (From Inventory)</th>
              <th>Volume</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={6}>No dispensing records found.</td>
              </tr>
            )}
            {filtered.map(d => (
              <tr key={d.dispensingId}>
                <td>{d.dispensingId}</td>
                <td>{d.date}</td>
                <td className="admin-table-name">{d.beneficiaryName}</td>
                <td>{d.batchId}</td>
                <td>{d.volumeMl} ml</td>
                <td>
                  <StatusPill status={d.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
