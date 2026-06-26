import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader';
import StatusPill from '../StatusPill';
import { mockBeneficiaries } from '../mockData';
import type { Beneficiary } from '../types';

export default function Beneficiaries() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(mockBeneficiaries[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockBeneficiaries;
    return mockBeneficiaries.filter(b =>
      b.infantName.toLowerCase().includes(q) ||
      b.parentGuardian.name.toLowerCase().includes(q)
    );
  }, [search]);

  const selected: Beneficiary | undefined = mockBeneficiaries.find(b => b.id === selectedId);

  return (
    <>
      <PageHeader title="Beneficiary Directory" />

      <div className="admin-searchbar">
        <span className="admin-searchbar-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search Beneficiary"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search beneficiary"
        />
      </div>

      <div className="admin-with-panel">
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Infant Name</th>
                <th>Parent/Guardian</th>
                <th>Affiliated Hospital</th>
                <th>Date Registered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr className="admin-table-empty-row">
                  <td colSpan={6}>No beneficiaries found.</td>
                </tr>
              )}
              {filtered.map((b, i) => (
                <tr
                  key={b.id}
                  className="is-clickable"
                  onClick={() => setSelectedId(b.id)}
                >
                  <td>{i + 1}</td>
                  <td className="admin-table-name">{b.infantName}</td>
                  <td>{b.parentGuardian.name}</td>
                  <td>{b.affiliatedHospital}</td>
                  <td>{b.dateRegistered}</td>
                  <td>
                    <StatusPill status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {selected && (
          <aside className="admin-side-panel" aria-label="Baby's profile">
            <div className="admin-side-panel-head">
              Baby's Profile
              <button
                type="button"
                className="admin-side-panel-close"
                aria-label="Close baby's profile"
                onClick={() => setSelectedId(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-side-panel-body">
              <h3>Infant Details</h3>
              <p>Name: {selected.infantName}</p>
              <p>Date of Birth: {selected.dateOfBirth}</p>
              <p>
                Gestational Age / Weight:{' '}
                {selected.gestationalAgeWeeks > 0
                  ? `${selected.gestationalAgeWeeks} Weeks / ${selected.weightKg} kg`
                  : '—'}
              </p>
              <p>Sex: {selected.sex}</p>
              <p>Diagnosis / Reason for Request: {selected.diagnosis}</p>

              <h3>Parent / Guardian Details</h3>
              <p>Name: {selected.parentGuardian.name}</p>
              <p>Relationship: {selected.parentGuardian.relationship}</p>
              <p>Contact Number: {selected.parentGuardian.contactNumber}</p>
              <p>Email: {selected.parentGuardian.email}</p>
              <p>Address: {selected.parentGuardian.address}</p>

              <h3>Medical Affiliation</h3>
              <p>Requesting Hospital: {selected.medicalAffiliation.requestingHospital}</p>
              <p>Ward / Room: {selected.medicalAffiliation.wardRoom}</p>
              <p>Attending Physician: {selected.medicalAffiliation.attendingPhysician}</p>

              <h3>Attached Documents</h3>
              <p>
                <a className="admin-file-link" href={selected.prescriptionFileUrl ?? '#'}>
                  📄 Doctor's Prescription / Request Form
                </a>
              </p>
              <p>
                <a className="admin-file-link" href={selected.consentFormUrl ?? '#'}>
                  📄 Parent/Guardian Consent Form
                </a>
              </p>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
