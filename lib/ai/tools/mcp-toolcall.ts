import { jsonSchema } from "ai";

const callMcpTool = async (mcp_url: string, toolName: string, params: any, mcp_session_id: string) => {
  // const body = {
  //   jsonrpc: "2.0",
  //   id: Date.now(),
  //   method: toolName,
  //   params,
  // };
  const body = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: params
    },
  };

  console.log('bodyRequest', JSON.stringify(body))
  console.log('mcp_session_id', mcp_session_id)

  const res = await fetch(mcp_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'dc9909a243924571b64f7c65fa2c032f',
      Accept: 'application/json, text/event-stream',
      'mcp-session-id': mcp_session_id,
    },
    body: JSON.stringify(body),
  });

  // Kiểm tra kiểu trả về là JSON hay event-stream
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    return data.result ?? data;
  } else {
    const text = await res.text();
    // console.log('texxxt', text)
    const dataLines = text.split('\n').filter(line => line.startsWith('data: '));
    const payloads = dataLines.map(line => {
      try { return JSON.parse(line.replace(/^data: /, '')); } catch (e) { return null }
    }).filter(Boolean);

    // lấy dòng cuối là kết quả trả về
    const lastPayload = payloads[payloads.length - 1];
    return lastPayload?.result ?? lastPayload;
  }
};


  type McpTool = {
    id: number;
    user_id: string;
    name: string;
    mcp_url: string;
    description?: string;
    input_schema?: object; // tuỳ bạn muốn detail hơn thì sửa lại
  };

export function mapMcpToolsToSdk(mcpTools: McpTool[], mcp_session_id: string) {
    return mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: jsonSchema(tool.input_schema),
      // Chuyển inputSchema MCP về zod schema nếu muốn validate tự động (có thể dùng thư viện json-schema-to-zod)
      // parameters: convertJsonSchemaToZod(tool.inputSchema),
      // Nếu không thì bỏ, SDK sẽ không validate input tự động
      execute: async (params: Record<string, any>) => callMcpTool(tool.mcp_url, tool.name, params, mcp_session_id)
    }));
  }