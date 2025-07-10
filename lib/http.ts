import { auth } from "@/app/(auth)/auth";
import { BaseResponse } from "./types";

const BASE_URL = 'https://public-api.birdeye.so';

const defaultHeaders: Record<string, string> = {
  'X-API-KEY': 'dc9909a243924571b64f7c65fa2c032f',
  accept: 'application/json',
};

export const getPathByChain = (chain: string) => {
  return chain === 'all' ? 'multichain' : chain;
};

export async function httpFetch<T = any>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
    body?: any;
  }
): Promise<T> {
  let url: URL;
  if (/^https?:\/\//.test(path)) {
    url = new URL(path);
  } else {
    url = new URL(path, BASE_URL);
  }

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = {
    ...defaultHeaders,
    ...options?.headers,
  };

  const fetchOptions: RequestInit = {
    method: options?.method || 'GET',
    headers,
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), fetchOptions);

  try {
    const resJson: BaseResponse = await response.json();
    resJson.statusCode = resJson.statusCode || response.status;

    return resJson as T;
  } catch (err) {
    console.error('🚀 ~ Error parsing JSON:', response.url, response.status, response.statusText);
    return {
      statusCode: response.status,
      success: false,
      message: response.statusText,
    } as unknown as T;
  }
}


// async function handleToolInvocation(toolName, parameters) {

//   const session = await auth();

//   // 2.1. Tìm server chứa tool này
//   const server = listServers.find(srv =>
//     srv.toolList.some(t => t.name === toolName)
//   );
//   if (!server) throw new Error("Tool not found!");

//   // 2.2. Gửi request tới server.url (với headers), gọi tool theo JSON-RPC
//   const res = await fetch(server.url, {
//     method: "POST",
//     headers: server.headers,
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       id: Date.now(),
//       method: toolName,
//       params: parameters
//     }),
//   });
//   const result = await res.json();
//   // result có thể là kết quả trả về từ tool
//   return result.result ?? result;
// }