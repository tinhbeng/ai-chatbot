import { httpFetch } from '@/lib/http';
import { tool } from 'ai';
import { z } from 'zod';

export const getWalletPortfolio = tool({
  description: 'Retrieve the portfolio of a wallet.',
  parameters: z.object({
    wallet: z.string().describe('The address of a wallet.'),
    chain: z.enum(["solana","ethereum","arbitrum","avalanche","bsc","optimism","polygon","base","zksync","sui"]).describe('A chain name listed in supported networks.'),
  }),
  execute: async ({ wallet, chain }) => {
    const response = await httpFetch(
      'v1/wallet/token_list',
      {
        params: {
          wallet
        },
        headers: {
          'x-chain': chain,
        }
      }
    );
    return response;
  },
});
