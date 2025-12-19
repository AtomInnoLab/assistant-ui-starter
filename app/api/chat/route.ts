import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

const doubao = createOpenAI({
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  apiKey: process.env.DOUBAO_API_KEY || "",
  fetch: async (url, options) => {
    // 拦截请求，将 developer 角色转换为 system 角色
    // 这个 sdk 会自动把 system 等角色转换成 developer...
    if (options?.body) {
      const body = JSON.parse(options.body as string);
      if (body.messages) {
        body.messages = body.messages.map((msg: any) => ({
          ...msg,
          role: msg.role === "developer" ? "system" : msg.role,
        }));
      }
      options.body = JSON.stringify(body);
    }
    return fetch(url, options);
  },
}).chat;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: doubao("doubao-seed-1-6-flash-250828"),
    system: "你是源语奇思（AtomInfinite）开发的人工智能助手 WisModel。",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
