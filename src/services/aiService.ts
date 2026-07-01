import Anthropic from "@anthropic-ai/sdk";

const POLISH_SYSTEM_PROMPT = `你是一位專業的繁體中文技術部落格編輯。
請修正文章中的語法錯誤、錯別字，讓文字更流暢自然，段落邏輯更清晰。
規則：
- 維持原有的 Markdown 格式（標題、清單、程式碼區塊等）完全不變
- 不要新增或產生任何 `#` H1 標題
- 保留所有技術術語、程式碼片段、URL，原樣不動
- 只回傳修改後的完整 Markdown 內容，不要加任何說明文字或前言`;

export class AiService {
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      console.warn("[AI] ANTHROPIC_API_KEY 未設定，AI 潤飾功能停用");
    }
  }

  async polishContent(title: string, content: string): Promise<string> {
    if (!this.client) throw new Error("AI 功能未啟用，請設定 ANTHROPIC_API_KEY");

    const message = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8096,
      system: POLISH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `文章標題：${title}\n\n文章內容：\n\n${content}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI 回傳格式異常");
    }
    return textBlock.text;
  }
}
