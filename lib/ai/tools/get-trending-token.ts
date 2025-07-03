import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const getTokenTrending = tool({
  description: 'Retrieve a dynamic and up-to-date list of trending tokens based on specified sorting criteria.',
  parameters: z.object({
    sort_by: z.enum(['rank', 'volume24hUSD', 'liquidity']).describe('Specify the sort field by rank, volume 24h USD, liquidity'),
    chain: z.enum(["solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).describe('A chain name listed in supported networks.'),
    sort_type: z.enum(['asc', 'desc']).optional().describe('Specify the sort order.'),
    offset: z.number().describe('Specify the offset for pagination. Filter for records with offset greater than the specified offset value, including those with offset equal to the specified offset.'),
    limit: z.number().describe('Limit the number of records returned. Max value 20.')
  }),
  execute: async ({ sort_by, chain, sort_type, offset, limit }) => {
    const response = await httpFetch(
      'defi/token_trending',
      {
        params: {
            sort_by, sort_type, offset, limit
        },
        headers: {
          'x-chain': chain,
        }
      }
    );
    return response;
  },
});
