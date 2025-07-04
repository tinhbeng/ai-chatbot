import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const getTokenOverview = tool({
  description: 'Retrieve stats of a specified token.',
  parameters: z.object({
    address: z.string().describe('The address of the token contract.'),
    chain: z.enum(["solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).describe('A chain name listed in supported networks.'),
    frames: z.enum(['1m', '5m', '30m', '1h', '2h', '4h', '8h', '24h']).optional().describe('A list of time frames seprated by comma (,). List of supported time frames: 1m, 5m, 30m, 1h, 2h, 4h, 8h, 24h. Only support Solana.'),
  }),
  execute: async ({ address, chain, frames }) => {
    const response = await httpFetch(
      'defi/token_overview',
      {
        params: {
            address, chain, frames
        },
        headers: {
          'x-chain': chain,
        }
      }
    );
    return response;
  },
});
