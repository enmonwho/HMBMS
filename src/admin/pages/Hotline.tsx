import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockHotlineTickets } from '../mockData';

export default function Hotline() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockHotlineTickets;
    return mockHotlineTickets.filter(t =>
      t.callerName.toLowerCase().includes(q) ||
      t.ticketId.toLowerCase().includes(q)
    );
  }, [search]);

  const handleLogNewCall = () => {
    // No backend yet — once the API exists, this should open a form/modal
    // to create a new ticket and POST it.
    alert('Log New Call — hook this up to a form once the backend is ready.');
  };

  return (
    <>
      <PageHeader title="Hotline Logs" />

      <div className="admin-searchbar-row">
        <div className="admin-searchbar admin-searchbar-flex">
          <span className="admin-searchbar-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="Search Caller or Ticket Number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search caller or ticket number"
          />
        </div>
        <button type="button" className="admin-pill-action-btn" onClick={handleLogNewCall}>
          LOG NEW CALL
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Date &amp; Time</th>
              <th>Caller Name</th>
              <th>Subject</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={7}>No hotline tickets found.</td>
              </tr>
            )}
            {filtered.map(t => (
              <tr key={t.ticketId}>
                <td>{t.ticketId}</td>
                <td>{t.dateTime}</td>
                <td className="admin-table-name">{t.callerName}</td>
                <td>{t.subject}</td>
                <td>{t.assignedTo}</td>
                <td>
                  <StatusPill status={t.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-edit-btn"
                    aria-label={`Edit ticket ${t.ticketId}`}
                  >
                    ✏️
                  </button>
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
