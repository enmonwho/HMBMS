import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockInventory } from '../mockData';

export default function Inventory() {
  const available = mockInventory.filter(i => i.status === 'AVAILABLE').length;
  const reserved = mockInventory.filter(i => i.status === 'RESERVED').length;
  const dispensed = mockInventory.filter(i => i.status === 'DISPENSED').length;
  const expired = mockInventory.filter(i => i.status === 'EXPIRED').length;

  return (
    <>
      <PageHeader title="Inventory" />

      <div className="admin-stat-grid">
        <div className="admin-stat-card tone-green">
          <div className="admin-stat-label">Available</div>
          <div className="admin-stat-value">{available}</div>
        </div>
        <div className="admin-stat-card tone-amber">
          <div className="admin-stat-label">Reserved</div>
          <div className="admin-stat-value">{reserved}</div>
        </div>
        <div className="admin-stat-card tone-blue">
          <div className="admin-stat-label">Dispensed</div>
          <div className="admin-stat-value">{dispensed}</div>
        </div>
        <div className="admin-stat-card tone-red">
          <div className="admin-stat-label">Expired</div>
          <div className="admin-stat-value">{expired}</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Quantity</th>
              <th>Storage</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockInventory.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={5}>No inventory items yet.</td>
              </tr>
            )}
            {mockInventory.map(item => (
              <tr key={item.batchId}>
                <td>{item.batchId}</td>
                <td>{item.quantityLiters} L</td>
                <td>{item.storage}</td>
                <td>{item.expiryDate}</td>
                <td>
                  <StatusPill status={item.status} />
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
