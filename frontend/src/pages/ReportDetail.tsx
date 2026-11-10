import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchReport, Report, ReportItem, Rating } from '../api';
import './ReportDetail.css';

const RATING_ORDER: Rating[] = ['LONG', 'SHORT', 'WATCH', 'DEFEND'];

const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(2));

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    load(parseInt(id));
  }, [id]);

  const load = async (reportId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReport(reportId);
      setReport(result.report);
    } catch (e) {
      console.error('Failed to load report:', e);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !report) return <div className="empty">{error || 'Report not found'}</div>;

  const grouped = RATING_ORDER
    .map(r => ({ rating: r, items: report.items.filter(i => i.rating === r) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="report-detail-page">
      <Link to="/reports" className="back-link">← Back</Link>
      <h1 className="page-title">Report #{report.id}</h1>
      <div className="report-meta">{new Date(report.created_at).toLocaleString()}</div>

      {grouped.map(g => (
        <section key={g.rating} className="rating-section">
          <h2 className={`rating-heading rating-${g.rating.toLowerCase()}`}>
            {g.rating} <span className="rating-count">{g.items.length}</span>
          </h2>
          <div className="item-grid">
            {g.items.map(item => <ItemCard key={item.symbol} item={item} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function ItemCard({ item }: { item: ReportItem }) {
  const up = item.changePct >= 0;
  return (
    <div className="item-card">
      <div className="item-header">
        <span className="item-symbol">{item.symbol}</span>
        <span className="item-price">{item.price.toFixed(2)}</span>
        <span className={up ? 'item-change up' : 'item-change down'}>
          {up ? '+' : ''}{item.changePct.toFixed(2)}%
        </span>
        {item.dense && <span className="item-dense">DENSE</span>}
      </div>

      {item.rating !== 'DEFEND' && (
        <div className="item-levels">
          <Level label="Entry" value={item.entry} />
          <Level label="Stop" value={item.stop} />
          <Level label="T1" value={item.t1} />
          <Level label="T2" value={item.t2} />
          <Level label="RR" value={item.riskReward} />
        </div>
      )}

      {item.trigger && <div className="item-trigger">{item.trigger}</div>}
      {item.noTrade && <div className="item-note">{item.noTrade}</div>}
      {item.blocked && <div className="item-blocked">{item.blocked}</div>}
    </div>
  );
}

function Level({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="level">
      <span className="level-label">{label}</span>
      <span className="level-value">{fmt(value)}</span>
    </div>
  );
}
