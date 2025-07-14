import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from "ai";
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { auth, type UserType } from "@/app/(auth)/auth";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  getToolsForUser,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { generateUUID, getTrailingMessageId } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { isProductionEnvironment } from "@/lib/constants";
import { myProvider } from "@/lib/ai/providers";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { postRequestBodySchema, type PostRequestBody } from "./schema";
import { geolocation } from "@vercel/functions";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import {
  MCPTransport,
  experimental_createMCPClient as createMCPClient,
} from 'ai';
import { after } from "next/server";
import type { Chat } from "@/lib/db/schema";
import { differenceInSeconds } from "date-fns";
import { ChatSDKError } from "@/lib/errors";
import { getDefiPrice } from "@/lib/ai/tools/get-defi-price";
import { getTokenTrending } from "@/lib/ai/tools/get-trending-token";
import { getTokenOverview } from "@/lib/ai/tools/token-overview";
import { searchTokens } from "@/lib/ai/tools/search-token";
import { getWalletPortfolio } from "@/lib/ai/tools/get-wallet-portfolio";
import { getGainerLoser } from "@/lib/ai/tools/get-gainer-loser";
import { getTokenHolder } from "@/lib/ai/tools/token-holder";
import { getPriceHistory } from "@/lib/ai/tools/get-price-history";
import { getCurentTimestamp } from "@/lib/ai/tools/getDateTime";
import { mapMcpToolsToSdk } from "@/lib/ai/tools/mcp-toolcall";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;


function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}
const url = new URL('https://dev-mcp.birdeye.so/mcp');
// const url = new URL('https://dev-mcp.birdeye.so/mcp');
// const mcpClient = await createMCPClient({
//   transport: new StreamableHTTPClientTransport(url, {
//     sessionId: 'session_123',
//     // headers: {
//     //   'x-api-key': 'YOUR_API_KEY_HERE',
//     // },
//   }),
// });

// class CustomStreamableHTTPClientTransport extends StreamableHTTPClientTransport {
//   protected override async _fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
//     const headers = new Headers(init?.headers || {});
//     headers.set('x-api-key', 'YOUR_API_KEY_HERE'); // Thay bằng API key thật
//     return super._fetch(input, { ...init, headers });
//   }
// }

// const url = new URL('https://dev-mcp.birdeye.so/mcp');
// const transport = new CustomStreamableHTTPClientTransport(url, {
//   sessionId: 'session_123',
// });

// const mcpClient = await createMCPClient({
//   transport,
// });

const toolCache: Record<string, any[]> = {};

async function getUserTools(userId: string, mcpUrl: string) {
  if (toolCache[userId]) return toolCache[userId];

  const tools = await getToolsForUser(userId, mcpUrl)
  toolCache[userId] = tools;
  return tools;
}

// Khi user update toolList, nhớ xóa cache:
function invalidateToolCache(userId: string) {
  delete toolCache[userId];
}

export async function POST(request: Request) {
 
  
  let requestBody: PostRequestBody;
  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType } =
      requestBody;
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const toolList = await getUserTools(session.user.id, 'https://dev-mcp.birdeye.so/mcp')
    // console.log('toolCache', toolCache)

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });
    // console.log('toolList[0]', toolList)
    const toolSchema = mapMcpToolsToSdk(toolList, 'e011325c-6873-4803-a61b-e0ffeadc47cf');
    // console.log('toolSchema',toolSchema)

    const mcpToolsObj = Object.fromEntries(
      toolSchema.map(tool => [tool.name, tool])
    );
    
    // console.log('mcpToolsObj', mcpToolsObj)
    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system:
            systemPrompt({ selectedChatModel, requestHints }),
          messages,
          maxSteps: 5,
          // experimental_activeTools:
          //   selectedChatModel === "chat-model-reasoning"
          //     ? []
          //     : [
          //         "searchTokens",
          //         "getPriceHistory",
          //         "getTokenTrending",
          //         "getDefiPrice",
          //         "getWalletPortfolio",
          //         "getTokenOverview",
          //         "getTokenHolder",
          //         "getCurentTimestamp",
          //         "getGainerLoser",
          //         "createDocument",
          //         "updateDocument",
          //         "requestSuggestions",
          //         "getWeather",
          //       ],
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: mcpToolsObj,
          // {
          //   searchTokens,
          //   getPriceHistory,
          //   getTokenTrending,
          //   getDefiPrice,
          //   getWalletPortfolio,
          //   getTokenOverview,
          //   getTokenHolder,
          //   getCurentTimestamp,
          //   getGainerLoser,
          //   createDocument: createDocument({ session, dataStream }),
          //   updateDocument: updateDocument({ session, dataStream }),
          //   requestSuggestions: requestSuggestions({
          //     session,
          //     dataStream,
          //   }),
          //   getWeather,
          // },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === "assistant"
                  ),
                });

                if (!assistantId) {
                  throw new Error("No assistant message found!");
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error("Failed to save chat");
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();
    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream)
      );
    } else {
      return new Response(stream);
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (chat.visibility === "private" && chat.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream
  );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== "assistant") {
      return new Response(emptyDataStream, { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createDataStream({
      execute: (buffer) => {
        buffer.writeData({
          type: "append-message",
          message: JSON.stringify(mostRecentMessage),
        });
      },
    });

    return new Response(restoredStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
