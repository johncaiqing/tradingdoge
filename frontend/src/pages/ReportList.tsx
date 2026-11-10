import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchReports, ReportSummary } from '../api';
import './ReportList.css';

export default function ReportList() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchReports();
      setReports(result.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <div className="report-list-page">
      <h1 className="page-title">Trading Reports</h1>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="empty">No reports yet</div>
      ) : (
        <div className="report-grid">
          {reports.map(r => (
            <Link key={r.id} to={`/reports/${r.id}`} className="report-card">
              <div className="report-id">Report #{r.id}</div>
              <div className="report-date">{formatDate(r.created_at)}</div>
              <div className="report-count">{r.count} symbols</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
