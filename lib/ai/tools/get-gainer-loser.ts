import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const getGainerLoser = tool({
  description: 'Retrieve detailed information about top gainers/losers',
  parameters: z.object({
    type: z.enum(['1W', 'yesterday', 'today']).describe('Specify the type of top gainers/losers. Filter for records with type equal to the specified type.'),
    sort_by: z.enum(['PnL']).describe('Specify the sort field..Defaults to PnL.'),
    sort_type: z.enum(['asc', 'desc']).describe('Specify the sort order.'),
    offset: z.number().describe('Make sure offset + limit <= 10000'),
    limit: z.number().describe('Limit the number of records returned.'),
    chain: z.enum(["solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).describe('A chain name listed in supported networks.'),
  }),
  execute: async ({ type, chain, sort_by, sort_type, offset, limit }) => {
    const response = await httpFetch(
      'trader/gainers-losers',
      {
        params: {
            type, sort_by, sort_type, offset, limit
        },
        headers: {
          'x-chain': chain,
        }
      }
    );
    return response;
  },
});
