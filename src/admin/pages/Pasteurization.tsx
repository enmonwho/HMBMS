import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockBatches } from '../mockData';

export default function Pasteurization() {
  return (
    <>
      <PageHeader title="Batch Records" />

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Collection ID</th>
              <th>Date</th>
              <th>Temperature</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockBatches.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={6}>No batches yet.</td>
              </tr>
            )}
            {mockBatches.map(b => (
              <tr key={b.batchId}>
                <td>{b.batchId}</td>
                <td>{b.collectionId}</td>
                <td>{b.date}</td>
                <td>{b.temperatureC != null ? `${b.temperatureC}°C` : '—'}</td>
                <td>{b.durationMinutes != null ? `${b.durationMinutes} min` : '—'}</td>
                <td>
                  <StatusPill status={b.status} />
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
