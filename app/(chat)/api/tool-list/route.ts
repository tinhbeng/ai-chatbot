import { auth } from "@/app/(auth)/auth";
import { saveToolsForUser } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

// /app/api/list-tool/route.ts
export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { apiKey, url: mcpUrl } = body;
        const session = await auth();
        
        if (!session?.user) {
            return new ChatSDKError("bad_request:auth").toResponse();
        }
        
      // Build header động (có thể thêm nhiều header từ user input)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Accept': 'text/event-stream, application/json'
      };
  
      // (Optional) - Nếu muốn lấy mcp_session_id trước:
      const sessionRes = await fetch(mcpUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: session?.user?.id,
          method: "initialize",
          params: {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
            "name": "whatever",
            "version": "0.0.0"
        }
          }
        }),
      });
      
      const mcp_session_id =
      sessionRes.headers.get("mcp-session-id") ||
      sessionRes.headers.get("Mcp-Session-Id") ||
      sessionRes.headers.get("MCP-SESSION-ID");

      console.log('session?.user?.id', session?.user?.id)
      console.log('mcp_session_id', mcp_session_id)

    if (!mcp_session_id) {
      return Response.json({ error: "Missing mcp-session-id" }, { status: 500 });
    }
  
      // Gọi listTools
      const res = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
            ...headers,
            'mcp-session-id': mcp_session_id
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: session?.user?.id,
          method: "tools/list",
          params: {}
        }),
      });
      const text = await res.text();

        const dataLines = text.split('\n').filter(line => line.startsWith('data: '));
        const payloads = dataLines.map(line => {
        try {
            return JSON.parse(line.replace(/^data: /, ''));
        } catch (e) {
            return null;
        }
        }).filter(Boolean);

        const toolList = payloads[0] || null; // thường payload đầu là data JSON mong muốn
        // console.log('toolList', toolList?.result?.tools)
        if (session?.user?.id)
        await saveToolsForUser(session?.user?.id, mcpUrl, toolList?.result?.tools);
        return Response.json(toolList);;
  
    } catch (error) {
      console.error(error);
      return Response.json({ error: "Request failed", detail: error }, { status: 500 });
    }
  }
  