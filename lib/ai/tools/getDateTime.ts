import { tool } from 'ai';
import { z } from 'zod';

export const getCurentTimestamp = tool({
  description: 'Get current unix timestamp',
  parameters: z.object({}),
  execute: async () => {
    const now = Math.floor(Date.now() / 1000);
  return { unix_time: now }
  },
});
