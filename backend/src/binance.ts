import axios from 'axios';
import { OHLCV, Interval } from './types';

const BASE_URL = 'https://data-api.binance.vision/api/v3/klines';

const INTERVAL_MAP: Record<string, string> = {
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '1day': '1d',
  '1week': '1w',
  '1month': '1M'
};

export async function fetchBinanceKlines(
  symbol: string,
  interval: Interval,
  limit: number = 400,
  startDatetime?: string
): Promise<OHLCV[]> {
  const params: any = {
    symbol: `${symbol}USDT`,
    interval: INTERVAL_MAP[interval] || interval,
    limit: Math.min(limit, 1000)
  };

  if (startDatetime) {
    params.startTime = new Date(startDatetime.replace(' ', 'T') + 'Z').getTime() + 1;
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(BASE_URL, { params, validateStatus: () => true });

      if (response.status !== 200) {
        console.error(`[${symbol}/${interval}] Binance HTTP ${response.status}: ${JSON.stringify(response.data)}`);
        return [];
      }

      if (!Array.isArray(response.data)) {
        console.warn(`[${symbol}/${interval}] Binance no data returned`);
        return [];
      }

      return response.data.map((k: any[]) => ({
        datetime: new Date(k[0]).toISOString().slice(0, 19).replace('T', ' '),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));
    } catch (error: any) {
      console.error(`[${symbol}/${interval}] Binance error: ${error.message} (attempt ${attempt}/${maxRetries})`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.error(`[${symbol}/${interval}] Binance failed after ${maxRetries} attempts`);
  return [];
}
