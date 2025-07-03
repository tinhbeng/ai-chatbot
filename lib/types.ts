export type DataPart = { type: "append-message"; message: string };

export type BaseResponse<D = any> = {
  statusCode: number;
  message?: string;
  data: D;
  success: boolean;
  errors?: any;
  total?: number;
  error?: {
    message: string;
  };
};

export type TokenTrending = {
  address: string;
  decimals: number;
  liquidity: number;
  logoURI: string;
  name: string;
  symbol: string;
  volume24hUSD: number;
  volume24hChangePercent: number;
  rank: number;
  price: number;
  price24hChangePercent: number;
  fdv: number;
  marketcap: number;
};

export type TokenTrendingData = {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  website: string;
  jupStrict?: boolean;
};

export type TokenTrendingV2 = {
  token: string;
  price: number;
  liquidity: number;
  tokenData: TokenTrendingData;
  network?: string;
  rank: number;

  tf24h: {
    priceChangePercent: number;
    volumeUSD: number;
    volumeChangePercent: number;
    viewCount: number;
    viewCountChangePercent: number;
  };
};
