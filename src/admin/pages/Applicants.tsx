import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockApplicants } from '../mockData';
import type { Applicant } from '../types';

export default function Applicants() {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applicants;
    return applicants.filter(a =>
      a.name.toLowerCase().includes(q) || a.contactNumber.includes(q)
    );
  }, [applicants, search]);

  const setStatus = (id: string, status: Applicant['status']) => {
    setApplicants(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <>
      <PageHeader title="Applicants" />

      <div className="admin-searchbar">
        <span className="admin-searchbar-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search Applicant"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search applicant"
        />
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Age</th>
              <th>Civil Status</th>
              <th>Occupation</th>
              <th>Address</th>
              <th>Date</th>
              <th>Forms</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="admin-table-empty-row">
                <td colSpan={10}>No applicants found.</td>
              </tr>
            )}
            {filtered.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>
                  <div className="admin-table-name">{a.name}</div>
                  <div className="admin-table-sub">{a.contactNumber}</div>
                </td>
                <td>{a.age}</td>
                <td>{a.civilStatus}</td>
                <td>{a.occupation}</td>
                <td style={{ maxWidth: 220 }}>{a.address}</td>
                <td>{a.dateApplied}</td>
                <td>
                  <span className="admin-doc-icon" title="View application form" aria-label="View application form">📄</span>
                </td>
                <td>
                  <StatusPill status={a.status} />
                </td>
                <td>
                  <div className="admin-action-group">
                    <button
                      type="button"
                      className="admin-icon-btn approve"
                      aria-label={`Approve ${a.name}`}
                      disabled={a.status === 'APPROVED'}
                      onClick={() => setStatus(a.id, 'APPROVED')}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn reject"
                      aria-label={`Reject ${a.name}`}
                      disabled={a.status === 'REJECTED'}
                      onClick={() => setStatus(a.id, 'REJECTED')}
                    >
                      ✕
                    </button>
                  </div>
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
