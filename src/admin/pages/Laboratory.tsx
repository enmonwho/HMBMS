import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockLabTests } from '../mockData';

export default function Laboratory() {
  return (
    <>
      <PageHeader title="Pending Tests" />

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Collection ID</th>
              <th>Date Collected</th>
              <th>Donor Name</th>
              <th>Test Result</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockLabTests.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={5}>No pending tests.</td>
              </tr>
            )}
            {mockLabTests.map(t => (
              <tr key={t.collectionId}>
                <td>{t.collectionId}</td>
                <td>{t.dateCollected}</td>
                <td className="admin-table-name">{t.donorName}</td>
                <td>
                  <span className="admin-doc-icon" title="View test result" aria-label="View test result">📄</span>
                </td>
                <td>
                  <StatusPill status={t.status} />
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
