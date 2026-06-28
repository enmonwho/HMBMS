import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import type { ReportType } from '../../shared/lib/types';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import { DownloadSimple } from '@phosphor-icons/react';
import { formatVolume } from '../../shared/lib/formatters';

const reportTypes: ReportType[] = ['Inventory Summary', 'Beneficiary Logs', 'Processing Yield'];

interface GeneratedReportRecord {
  id: string;
  report_name: string;
  generated_by: string;
  format: string;
  download_url: string;
  created_at: string;
}

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reports, setReports] = useState<GeneratedReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [stats, setStats] = useState({
    totalDonorsThisMonth: 0,
    totalVolumeCollected: 0,
    totalVolumeDispensed: 0,
    expired: 0
  });

  const { role } = useAuth();
  const canEdit = role !== 'Medical Technologist';

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: reportsData, error: reportsError } = await supabase
          .from('generated_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;
        setReports(reportsData || []);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const [donorsRes, collRes, dispRes, expRes] = await Promise.all([
          supabase.from('donors').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
          supabase.from('milk_collections').select('volume_ml'),
          supabase.from('dispensing_records').select('volume_dispensed_ml'),
          supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('status', 'EXPIRED')
        ]);

        const totalCollected = (collRes.data || []).reduce((sum, c) => sum + (c.volume_ml || 0), 0);
        const totalDispensed = (dispRes.data || []).reduce((sum, d) => sum + (d.volume_dispensed_ml || 0), 0);

        setStats({
          totalDonorsThisMonth: donorsRes.count || 0,
          totalVolumeCollected: totalCollected,
          totalVolumeDispensed: totalDispensed,
          expired: expRes.count || 0
        });
      } catch (err) {
        console.error('Error fetching reports page data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!reportType) {
      alert('Select a report type first.');
      return;
    }
    setIsGenerating(true);

    try {
      let dataToExport: any[] = [];

      // Note: we can filter by startDate and endDate if they are provided, but for this prototype we'll fetch all.
      let query;
      if (reportType === 'Inventory Summary') {
        query = supabase.from('inventory').select('*');
      } else if (reportType === 'Beneficiary Logs') {
        query = supabase.from('beneficiaries').select('*');
      } else if (reportType === 'Processing Yield') {
        query = supabase.from('batches').select('*');
      }

      if (query) {
        if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
        if (endDate) query = query.lte('created_at', new Date(endDate + 'T23:59:59').toISOString());
        const { data, error } = await query;
        if (error) throw error;
        dataToExport = data || [];
      }

      if (dataToExport.length === 0) {
        alert('No data found for this report type and date range.');
        setIsGenerating(false);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvRows = [headers.join(',')];
      for (const row of dataToExport) {
        const values = headers.map(header => {
          const val = row[header] !== null ? row[header] : '';
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }
      const csvContent = csvRows.join('\n');

      const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

      const newReport = {
        report_name: `${reportType} ${startDate ? `from ${startDate}` : ''}`,
        generated_by: 'System Admin',
        format: 'CSV',
        download_url: encodedUri,
      };

      const { data: insertedData, error: insertError } = await supabase.from('generated_reports').insert([newReport]).select();
      if (insertError) throw insertError;

      if (insertedData) {
        setReports([insertedData[0], ...reports]);
      }

      // Trigger automatic download
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportType.replace(/\s+/g, '_').toLowerCase()}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PageHeader title="Reports & Analytics" />

      <div className="admin-stat-grid">
        <div className="admin-stat-card tone-green">
          <div className="admin-stat-label">Total Donors<br />(Current Month)</div>
          <div className="admin-stat-value">{stats.totalDonorsThisMonth}</div>
        </div>
        <div className="admin-stat-card tone-amber">
          <div className="admin-stat-label">Total Volume Collected</div>
          <div className="admin-stat-value">{formatVolume(stats.totalVolumeCollected)}</div>
        </div>
        <div className="admin-stat-card tone-blue">
          <div className="admin-stat-label">Total Volume Dispensed</div>
          <div className="admin-stat-value">{formatVolume(stats.totalVolumeDispensed)}</div>
        </div>
        <div className="admin-stat-card tone-red">
          <div className="admin-stat-label">Expired</div>
          <div className="admin-stat-value">{stats.expired}</div>
        </div>
      </div>

      {canEdit && (
        <div className="admin-report-controls">
          <div className="admin-report-field">
            <label htmlFor="report-type">Select Report Type</label>
            <select
              id="report-type"
              value={reportType}
              onChange={e => setReportType(e.target.value as ReportType)}
            >
              <option value="" disabled>Select Report Type</option>
              {reportTypes.map(rt => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>
          <div className="admin-report-field">
            <label htmlFor="report-start">Start Date</label>
            <input
              id="report-start"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="admin-report-field">
            <label htmlFor="report-end">End Date</label>
            <input
              id="report-end"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <button type="button" className="admin-pill-action-btn admin-generate-btn disabled:opacity-50" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'GENERATING...' : 'GENERATE'}
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Date Generated</th>
              <th>Generated By</th>
              <th>Format</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-table-empty-row">
                <td colSpan={5}>Loading reports...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr className="admin-table-empty-row">
                <td colSpan={5}>No reports generated yet.</td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id}>
                  <td className="admin-table-name">{r.report_name}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.generated_by || 'System'}</td>
                  <td>{r.format}</td>
                  <td>
                    <a className="admin-file-link flex items-center gap-1" href={r.download_url || '#'}>
                      <DownloadSimple size={16} /> Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
