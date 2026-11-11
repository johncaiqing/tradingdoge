export interface OHLCV {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  interval: string;
  data: OHLCV[];
}

export interface Signal {
  id?: number;
  symbol: string;
  interval: string;
  signal_type: 'B' | 'S';
  datetime: string;
  price: number;
}

export interface Stock {
  symbol: string;
  name: string;
}

export const INTERVALS = ['1h', '2h', '4h', '1day', '1week', '1month'] as const;
export type Interval = typeof INTERVALS[number];

export const SYMBOLS = ['SOXL', 'SNDK', 'MU', 'INTC', 'SKHY', 'MSTR', 'NVDA', 'SPY', 'GOOG', 'AAPL', 'TSLA', 'SPCX', 'MRVL', 'COIN', 'NBIS', 'RKLB', 'QQQ', 'EWY', 'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'NEAR', 'SUI', 'ARB', 'ENA', 'ZEC', 'HYPE'] as const;
export type Symbol = typeof SYMBOLS[number];

export const CRYPTO_SYMBOLS: ReadonlySet<string> = new Set(['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'NEAR', 'SUI', 'ARB', 'ENA', 'ZEC', 'HYPE']);

export const SYMBOL_NAMES: Record<string, string> = {
  'SPY': 'S&P 500 ETF',
  'QQQ': 'Nasdaq 100 ETF',
  'SOXL': 'Direxion 3X Semi Bull',
  'SNDK': 'Sandisk',
  'MU': 'Micron Technology',
  'INTC': 'Intel',
  'MSTR': 'MicroStrategy',
  'NVDA': 'NVIDIA',
  'GOOG': 'Alphabet',
  'AAPL': 'Apple',
  'TSLA': 'Tesla',
  'MRVL': 'Marvell Technology',
  'COIN': 'Coinbase',
  'NBIS': 'Nebius Group',
  'RKLB': 'Rocket Lab',
  'EWY': 'iShares MSCI Korea',
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'SOL': 'Solana',
  'XRP': 'XRP',
  'DOGE': 'Dogecoin',
  'NEAR': 'NEAR Protocol',
  'SUI': 'Sui',
  'ARB': 'Arbitrum',
  'ENA': 'Ethena',
  'ZEC': 'Zcash',
  'HYPE': 'Hyperliquid'
};

// ============ Agent & Comment Types ============

export interface Agent {
  id: number;
  name: string;
  api_key?: string;
  notify_enabled: number;
  notify_type: string;
  webhook_url: string | null;
  created_at: string;
}

export interface Comment {
  id: number;
  agent_id: number;
  symbol: string;
  content: string;
  created_at: string;
  agent_name?: string;
  like_count?: number;
  liked?: boolean;
}