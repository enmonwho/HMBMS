import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockCollections } from '../mockData';

export default function Collections() {
  return (
    <>
      <PageHeader title="Collection Records" />

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Collection ID</th>
              <th>Date</th>
              <th>Donor Name</th>
              <th>Volume</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockCollections.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={5}>No collections recorded yet.</td>
              </tr>
            )}
            {mockCollections.map(c => (
              <tr key={c.collectionId}>
                <td>{c.collectionId}</td>
                <td>{c.date}</td>
                <td className="admin-table-name">{c.donorName}</td>
                <td>{c.volumeLiters} liter{c.volumeLiters === 1 ? '' : 's'}</td>
                <td>
                  <StatusPill status={c.status} />
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
