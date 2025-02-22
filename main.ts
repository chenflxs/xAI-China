// main.ts
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const targetApiUrl = Deno.env.get("TARGET_API_URL") || "https://api.example.com/v1/";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  const headers = new Headers(req.headers);
  headers.delete("host"); // 移除 host 头部

  const proxyUrl = targetApiUrl + path.substring(1); // 去掉前导 '/'

  try {
    const response = await fetch(proxyUrl, {
      method,
      headers,
      body: method !== "GET" && method !== "HEAD" ? req.body : undefined,
    });

    // 返回响应
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

serve(handler, { port: 8000 });
console.log("Server running on http://localhost:8000");