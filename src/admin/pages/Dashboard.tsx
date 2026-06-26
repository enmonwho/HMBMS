import PageHeader from '../PageHeader';
import { dashboardStats } from '../mockData';

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" />

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Donors</div>
          <div className="admin-stat-value">{dashboardStats.totalDonors}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Inventory</div>
          <div className="admin-stat-value">{dashboardStats.inventory}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Collections</div>
          <div className="admin-stat-value">{dashboardStats.collections}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Beneficiaries</div>
          <div className="admin-stat-value">{dashboardStats.beneficiaries}</div>
        </div>
      </div>

      <div className="admin-panel-grid">
        <div className="admin-panel">
          <h2>Recent Activity</h2>
          <div className="admin-panel-box">
            <div className="admin-panel-empty">No recent activity yet.</div>
          </div>
        </div>
        <div className="admin-panel">
          <h2>Notifications</h2>
          <div className="admin-panel-box">
            <div className="admin-panel-empty">You're all caught up.</div>
          </div>
        </div>
      </div>
    </>
  );
}
