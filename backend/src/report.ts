import { SYMBOLS, OHLCV } from './types';
import { getStockData } from './database';
import { calculateSMA, calculateEMA } from './signals';

export type Rating = 'LONG' | 'SHORT' | 'WATCH';

export interface ReportItem {
  symbol: string;
  price: number;
  changePct: number;
  rating: Rating;
  dense: boolean;
  entry: number | null;
  stop: number | null;
  t1: number | null;
  t2: number | null;
  riskReward: number | null;
  trigger: string | null;
  noTrade: string | null;
  ma20: number;
  ma60: number;
  ma120: number;
  ema20: number;
  ema60: number;
  ema120: number;
}

export interface Report {
  id?: number;
  created_at: string;
  items: ReportItem[];
}

const roundUp05 = (x: number) => Math.ceil(x * 2) / 2;
const roundDown05 = (x: number) => Math.floor(x * 2) / 2;
const round2 = (x: number) => Math.round(x * 100) / 100;

function findSwingPoints(data: OHLCV[], lookback = 2): { lows: number[]; highs: number[] } {
  const lows: number[] = [];
  const highs: number[] = [];
  for (let i = lookback; i < data.length - lookback; i++) {
    let isLow = true;
    let isHigh = true;
    for (let j = 1; j <= lookback; j++) {
      if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) isLow = false;
      if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) isHigh = false;
    }
    if (isLow) lows.push(data[i].low);
    if (isHigh) highs.push(data[i].high);
  }
  return { lows, highs };
}

// 定价：返回入场/止损/T1/T2/盈亏比
function priceSide(data: OHLCV[], maValues: number[], side: 'long' | 'short') {
  const upperBand = Math.max(...maValues);
  const lowerBand = Math.min(...maValues);
  const { lows, highs } = findSwingPoints(data, 2);
  const prevCandle = data[data.length - 2];

  if (side === 'long') {
    const entry = roundUp05(upperBand);
    const swingLow = lows.length ? lows[lows.length - 1] : prevCandle.low;
    let stop = swingLow;
    const stopPct = (entry - stop) / entry;
    if (stopPct < 0.03) stop = entry * 0.97;
    else if (stopPct > 0.05) stop = entry * 0.95;
    stop = round2(stop);

    const r = entry - stop;
    const resAbove = highs.filter(h => h > entry).sort((a, b) => a - b);
    let t1 = resAbove[0];
    if (t1 == null || t1 <= entry) t1 = entry + 2 * r;
    let t2 = resAbove[1];
    if (t2 == null || t2 <= t1) t2 = t1 + (t1 - entry);
    t1 = round2(t1);
    t2 = round2(t2);

    const rr = (t1 - entry) / r;
    return { entry, stop, t1, t2, rr: round2(rr) };
  } else {
    const entry = roundDown05(lowerBand);
    const swingHigh = highs.length ? highs[highs.length - 1] : prevCandle.high;
    let stop = swingHigh;
    const stopPct = (stop - entry) / entry;
    if (stopPct < 0.03) stop = entry * 1.03;
    else if (stopPct > 0.05) stop = entry * 1.05;
    stop = round2(stop);

    const r = stop - entry;
    const supBelow = lows.filter(l => l < entry).sort((a, b) => b - a);
    let t1 = supBelow[0];
    if (t1 == null || t1 >= entry) t1 = entry - 2 * r;
    let t2 = supBelow[1];
    if (t2 == null || t2 >= t1) t2 = t1 - (entry - t1);
    t1 = round2(t1);
    t2 = round2(t2);

    const rr = (entry - t1) / r;
    return { entry, stop, t1, t2, rr: round2(rr) };
  }
}

function analyzeSymbol(symbol: string, data: OHLCV[]): ReportItem | null {
  if (data.length < 130) return null;

  const ma20Arr = calculateSMA(data, 20);
  const ma60Arr = calculateSMA(data, 60);
  const ma120Arr = calculateSMA(data, 120);
  const ema20Arr = calculateEMA(data, 20);
  const ema60Arr = calculateEMA(data, 60);
  const ema120Arr = calculateEMA(data, 120);

  const last = data.length - 1;
  const ma20 = ma20Arr[last]!;
  const ma60 = ma60Arr[last]!;
  const ma120 = ma120Arr[last]!;
  const ema20 = ema20Arr[last]!;
  const ema60 = ema60Arr[last]!;
  const ema120 = ema120Arr[last]!;

  const close = data[last].close;
  const prevClose = data[last - 1].close;
  const changePct = round2(((close - prevClose) / prevClose) * 100);
  const maValues = [ma20, ma60, ma120, ema20, ema60, ema120];
  const upperBand = Math.max(...maValues);
  const lowerBand = Math.min(...maValues);
  const dense = (upperBand - lowerBand) / close <= 0.02;

  const base = { symbol, price: round2(close), changePct, dense, ma20, ma60, ma120, ema20, ema60, ema120 };

  let rating: Rating;
  if (dense && close > upperBand) rating = 'LONG';
  else if (dense && close < lowerBand) rating = 'SHORT';
  else rating = 'WATCH';

  if (rating === 'LONG' || rating === 'SHORT') {
    const side = rating === 'LONG' ? 'long' : 'short';
    const p = priceSide(data, maValues, side);
    return {
      ...base,
      rating,
      entry: p.entry,
      stop: p.stop,
      t1: p.t1,
      t2: p.t2,
      riskReward: p.rr,
      trigger: side === 'long' ? `4H 收盘站上 ${round2(upperBand)}` : `4H 收盘跌破 ${round2(lowerBand)}`,
      noTrade: side === 'long'
        ? `跌破 ${p.stop.toFixed(2)} 取消计划`
        : `收复 ${p.stop.toFixed(2)} 取消计划`
    };
  }

  // WATCH：均线不密集，或密集未突破 → 观望，给突破待命价
  const tiltLong = close > (upperBand + lowerBand) / 2;
  const side = tiltLong ? 'long' : 'short';
  const p = priceSide(data, maValues, side);
  return {
    ...base,
    rating,
    entry: p.entry,
    stop: p.stop,
    t1: p.t1,
    t2: p.t2,
    riskReward: p.rr,
    trigger: dense
      ? (side === 'long' ? `4H 收盘站上 ${round2(upperBand)} 再买` : `4H 收盘跌破 ${round2(lowerBand)} 再空`)
      : '均线未密集，等待粘合',
    noTrade: '不满足条件不追'
  };
}

export async function generateReport(): Promise<Report> {
  const items: ReportItem[] = [];

  for (const symbol of SYMBOLS) {
    const data = await getStockData(symbol as string, '4h', 400);
    if (data.length < 130) {
      console.log(`[report] skip ${symbol}: only ${data.length} 4h records`);
      continue;
    }
    const item = analyzeSymbol(symbol as string, data);
    if (item) items.push(item);
  }

  return { created_at: new Date().toISOString(), items };
}
