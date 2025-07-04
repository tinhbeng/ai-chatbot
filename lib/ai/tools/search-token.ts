import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const searchTokens = tool({
  description: 'Search for tokens and market data by providing a name, symbol, token address, or market address.',
  parameters: z.object({
    keyword: z.string().describe('Keyword: name, symbol, token address, or market address.'),
    chain: z.enum(["all","solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).default('all').describe('A chain name listed in supported networks.'),
    target: z.enum(['all', 'token', 'market']).default('all').describe('An option to search tokens based on their expected results as token, market, or both. Defaults to `all`'),
    search_mode: z.enum(['exact', 'fuzzy']).default('exact').describe('An option to search tokens with exact match or partially match.Defaults to `exact`'),
    search_by: z.enum(['combination', 'address', 'name', 'symbol']).default('symbol').describe('An option to search tokens by symbol, name, or both.'),
    sort_by: z.enum(["fdv","marketcap","liquidity","price","price_change_24h_percent","trade_24h","trade_24h_change_percent","buy_24h","buy_24h_change_percent","sell_24h","sell_24h_change_percent","unique_wallet_24h","unique_view_24h_change_percent","last_trade_unix_time","volume_24h_usd","volume_24h_change_percent"]).default('volume_24h_usd').describe('Specify the sort field.'),
    sort_type: z.enum(['asc', 'desc']).default('desc').describe('Specify the sort order.'),
    verify_token: z.boolean().default(false).describe('A filter to retrieve tokens based on their verification status (supported on Solana).'),
    markets: z.string().optional().describe(`A comma-separated list of market sources to filter results (supported on Solana). Available options: ['Raydium', 'Raydium CP', 'Raydium Clamm', 'Meteora', 'Meteora DLMM', 'Fluxbeam', 'Pump.fun', 'OpenBook', 'OpenBook V2', 'Orca'].`),
    offset: z.number().default(0).describe('Specify the offset for pagination. Filter for records with offset greater than the specified offset value, including those with offset equal to the specified offset.'),
    limit: z.number().default(10).describe('Limit the number of records returned. Integer 1 to 20')
}),
  execute: async ({ keyword, chain, target, search_mode, search_by, sort_by, sort_type, verify_token, markets, offset, limit }) => {
    if (chain === 'solana') {
        const response = await httpFetch(
            'defi/v3/search',
            {
              params: {
                  keyword, chain, target, search_mode, search_by, sort_by, sort_type, verify_token, markets, offset, limit
              },
            }
          );
          return response;
    } else {
        const response = await httpFetch(
            'defi/v3/search',
            {
              params: {
                  keyword, chain, target, search_mode, search_by, sort_by, sort_type, markets, offset, limit
              },
            }
          );
          return response;
    }
    
  },
});
