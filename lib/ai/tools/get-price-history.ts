import { httpFetch } from "@/lib/http";
import { tool } from "ai";
import { z } from "zod";

export const getPriceHistory = tool({
  description:
    "Provide the price data for a specified token on any network for chart visualization. The model should summarize overall trends or insights, without restating the detailed data.",
  parameters: z.object({
    address: z.string().describe("The address of the token contract."),
    address_type: z.enum(["token", "pair"]).default("token"),
    type: z
      .enum([
        "1m",
        "3m",
        "5m",
        "15m",
        "30m",
        "1H",
        "2H",
        "4H",
        "6H",
        "8H",
        "12H",
        "1D",
        "3D",
        "1W",
        "1M",
      ])
      .default("15m")
      .describe("OHLCV time frame."),
    chain: z
      .enum([
        "solana",
        "ethereum",
        "arbitrum",
        "avalanche",
        "bsc",
        "optimism",
        "polygon",
        "base",
        "zksync",
        "sui",
      ])
      .describe("A chain name listed in supported networks."),
      // use to show on header
      name: z.string().optional().describe('Token name or symbol'),
    time_from: z
      .number()
      .describe("Specify the start time using unix timestamps in seconds"),
    time_to: z
      .number()
      .describe("Specify the end time using unix timestamps in seconds"),
    ui_amount_mode: z
      .enum(["raw", "scaled", "both"])
      .default("raw")
      .describe(
        "Indicate whether to use the scaled amount for scaled ui amount tokens. Only support solana"
      ),
  }),
  execute: async ({
    address,
    chain,
    type,
    time_from,
    time_to,
    ui_amount_mode,
    name
  }) => {
    const response = await httpFetch("defi/history_price", {
      params: {
        address,
        type,
        time_from,
        time_to,
        ui_amount_mode,
        name
      },
      headers: {
        "x-chain": chain,
      },
    });
    return response;
  },
});
