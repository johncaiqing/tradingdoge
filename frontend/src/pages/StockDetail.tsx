import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStockData, fetchDailySignals, fetchSignalStatus, OHLCV, Interval, INTERVALS, DailySignal, SignalStatus } from '../api';
import StockChart from '../components/Chart';
import './StockDetail.css';

export const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [interval, setInterval] = useState<Interval>('1day');
  const [data, setData] = useState<OHLCV[]>([]);
  const [dailySignals, setDailySignals] = useState<DailySignal[]>([]);
  const [signalStatus, setSignalStatus] = useState<SignalStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    Promise.all([
      fetchStockData(symbol, interval),
      fetchDailySignals(symbol),
      fetchSignalStatus(symbol)
    ]).then(([stockData, signalData, status]) => {
      setData(stockData.data);
      setDailySignals(signalData.data);
      setSignalStatus(status);
      setLoading(false);
    });
  }, [symbol, interval]);

  // 转换数据格式给Chart使用
  const chartData = data.map(d => ({
    time: Math.floor(new Date(d.datetime).getTime() / 1000) as any,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close
  }));

  const buildLine = (field: 'ma20' | 'ma60' | 'ma120' | 'ema20' | 'ema60' | 'ema120') =>
    data
      .filter(d => d[field] !== null)
      .map(d => ({
        time: Math.floor(new Date(d.datetime).getTime() / 1000) as any,
        value: d[field]!
      }));

  return (
    <div className="stock-detail">
      <Link to="/" className="back-link">
        ← Back
      </Link>

      <div className="detail-header">
        <h1 className="detail-symbol">{symbol}</h1>
        <div className="interval-selector">
          {INTERVALS.map(int => (
            <button
              key={int}
              className={`interval-btn ${interval === int ? 'active' : ''}`}
              onClick={() => setInterval(int)}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <div className="chart-container">
            {loading ? (
              <div className="loading">Loading chart...</div>
            ) : (
              <StockChart
                data={chartData}
                ma20={buildLine('ma20')}
                ma60={buildLine('ma60')}
                ma120={buildLine('ma120')}
                ema20={buildLine('ema20')}
                ema60={buildLine('ema60')}
                ema120={buildLine('ema120')}
              />
            )}
            <div className="chart-watermark">Tradingdoge.com</div>
          </div>

          <div className="signals-section">
            <h2 className="signals-title">Daily Signals (Last 10 Days)</h2>
            <table className="signals-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>1h</th>
                  <th>2h</th>
                  <th>4h</th>
                  <th>1day</th>
                </tr>
              </thead>
              <tbody>
                {dailySignals.map(row => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td className={row['1h'] === 'B' ? 'signal-b' : row['1h'] === 'S' ? 'signal-s' : ''}>{row['1h']}</td>
                    <td className={row['2h'] === 'B' ? 'signal-b' : row['2h'] === 'S' ? 'signal-s' : ''}>{row['2h']}</td>
                    <td className={row['4h'] === 'B' ? 'signal-b' : row['4h'] === 'S' ? 'signal-s' : ''}>{row['4h']}</td>
                    <td className={row['1day'] === 'B' ? 'signal-b' : row['1day'] === 'S' ? 'signal-s' : ''}>{row['1day']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="detail-sidebar">
          {signalStatus && (
            <div className={`signal-badge ${signalStatus.status === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell'}`}>
              <div className="signal-badge-label">
                {signalStatus.status === 'BUY' ? '买点' : '卖出'}
              </div>
              {signalStatus.status === 'BUY' && signalStatus.buyPoint != null ? (
                <>
                  <div className="signal-badge-buy-point">
                    ${signalStatus.buyPoint.toFixed(2)}
                  </div>
                  <div className="signal-badge-support">
                    {signalStatus.supportType}
                  </div>
                  {signalStatus.supportLevels && (
                    <div className="signal-badge-levels">
                      {signalStatus.supportLevels.map(l => (
                        <div key={l.label} className="signal-level-row">
                          <span className="signal-level-label">{l.label}</span>
                          <span className="signal-level-price">${l.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="signal-badge-price">
                  当前 ${signalStatus.price.toFixed(2)}
                </div>
              )}
              <div className="signal-badge-details">
                {['1h', '2h', '4h', '1day'].map(tf => (
                  <span key={tf} className={`signal-dot ${signalStatus.signals[tf]?.signal_type === 'B' ? 'dot-b' : 'dot-s'}`}>
                    {tf} {signalStatus.signals[tf]?.signal_type || '-'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetail;