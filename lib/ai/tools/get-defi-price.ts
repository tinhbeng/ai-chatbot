import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const getDefiPrice = tool({
  description: 'Retrieve the latest price information for a specified token.',
  parameters: z.object({
    address: z.string().describe('The address of the token contract.'),
    chain: z.enum(["solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).describe('A chain name listed in supported networks.'),
    check_liquidity: z.number().optional().describe('Specify the liquidity value to check.'),
    include_liquidity: z.boolean().optional().describe('Specify whether to include liquidity in the response.')
  }),
  execute: async ({ address, chain, check_liquidity, include_liquidity }) => {
    const response = await httpFetch(
      'defi/price',
      {
        params: {
          address,
          check_liquidity,
          include_liquidity
        },
        headers: {
          'x-chain': chain,
        }
      }
    );
    return response;
  },
});
