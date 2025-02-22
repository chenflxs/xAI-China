// main.ts
const XAI_API_URL = "https://api.x.ai/v1"; // xAI API 基础地址（根据实际情况调整）

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname; // 获取请求路径，例如 "/chat/completions"

  // 从请求头中获取用户的 API Key
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "请提供有效的 xAI API Key（Authorization: Bearer <key>）" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const apiKey = authHeader.split(" ")[1]; // 提取 Bearer 后的 API Key
  const targetUrl = `${XAI_API_URL}${path}`;

  // 转发请求
  try {
    const proxyReq = new Request(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers, // 保留用户传入的头
        "Authorization": `Bearer ${apiKey}`, // 使用用户提供的 API Key
        "Host": "api.x.ai", // 确保 Host 正确
      },
      body: req.body ? req.body : null, // 转发请求体（如有）
    });

    // 发送请求到 xAI API
    const response = await fetch(proxyReq);

    // 返回 xAI API 的响应
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("代理请求失败:", error);
    return new Response(
      JSON.stringify({ error: "代理请求失败，请检查 API Key 或网络" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// 使用 Deno.serve（Deno Deploy 原生支持）
Deno.serve(handler);