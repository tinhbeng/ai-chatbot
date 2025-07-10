import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const getTokenHolder = tool({
  description: 'Retrieve a list of top holders of a specified token.',
  parameters: z.object({
    address: z.string().describe('The address of the token contract.'),
    chain: z.enum(["solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).describe('A chain name listed in supported networks.'),
    offset: z.number().default(0).describe('Specify the offset for pagination. Make sure offset + limit <= 10000.'),
    limit: z.number().default(100).describe('Limit the number of records returned. Integer 1 to 100')
  }),
  execute: async ({ address, chain, offset, limit }) => {
    const response = await httpFetch(
      'defi/v3/token/holder',
      {
        params: {
          address,
          offset,
          limit
        },
        headers: {
          'x-chain': chain,
        }
      }
    );
    return response;
  },
});
