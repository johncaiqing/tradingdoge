import React from 'react';
import type { UTCTimestamp } from 'lightweight-charts';

export interface LineData {
  time: UTCTimestamp;
  value: number;
}

interface ChartProps {
  data: Array<{
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  ma20: LineData[];
  ma60: LineData[];
  ma120: LineData[];
  ema20: LineData[];
  ema60: LineData[];
  ema120: LineData[];
}

const LINE_CONFIGS: { key: keyof Omit<ChartProps, 'data'>; color: string }[] = [
  { key: 'ma20', color: '#ffd700' },
  { key: 'ma60', color: '#00bfff' },
  { key: 'ma120', color: '#ff8c00' },
  { key: 'ema20', color: '#ff69b4' },
  { key: 'ema60', color: '#9370db' },
  { key: 'ema120', color: '#32cd32' }
];

export const StockChart: React.FC<ChartProps> = ({ data, ma20, ma60, ma120, ema20, ema60, ema120 }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<any>(null);
  const seriesRef = React.useRef<any>(null);
  const lineRefs = React.useRef<Record<string, any>>({});

  const lineData = { ma20, ma60, ma120, ema20, ema60, ema120 };

  React.useEffect(() => {
    if (!containerRef.current) return;

    import('lightweight-charts').then((charts) => {
      const { createChart, ColorType } = charts;

      if (chartRef.current) {
        chartRef.current.remove();
      }

      const container = containerRef.current;
      if (!container) return;

      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#242424' },
          textColor: '#888'
        },
        grid: {
          vertLines: { color: '#333' },
          horzLines: { color: '#333' }
        },
        width: container.clientWidth,
        height: container.clientHeight || 420,
        timeScale: {
          borderColor: '#333',
          timeVisible: true,
          secondsVisible: false
        },
        rightPriceScale: {
          borderColor: '#333'
        }
      });

      chartRef.current = chart;

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#00ff88',
        downColor: '#ff4444',
        borderUpColor: '#00ff88',
        borderDownColor: '#ff4444',
        wickUpColor: '#00ff88',
        wickDownColor: '#ff4444'
      });

      seriesRef.current = candleSeries;

      for (const { key, color } of LINE_CONFIGS) {
        const line = chart.addLineSeries({
          color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false
        });
        lineRefs.current[key] = line;
      }

      if (data.length > 0) {
        candleSeries.setData(data);
        for (const { key } of LINE_CONFIGS) {
          lineRefs.current[key]?.setData(lineData[key]);
        }
        chart.timeScale().fitContent();
      }

      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight || 420
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    });
  }, []);

  React.useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
      for (const { key } of LINE_CONFIGS) {
        lineRefs.current[key]?.setData(lineData[key]);
      }
      chartRef.current?.timeScale().fitContent();
    }
  }, [data, ma20, ma60, ma120, ema20, ema60, ema120]);

  return <div ref={containerRef} className="chart-wrapper" />;
};

export default StockChart;