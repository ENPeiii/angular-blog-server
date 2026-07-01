import { Body, Controller, Post, Route, SuccessResponse, Tags } from "tsoa";
import { AiService } from "../../services/aiService";

interface PolishContentDto {
  title: string;
  content: string;
}

interface PolishContentResponse {
  polished: string;
}

@Route("admin/ai")
@Tags("Admin - AI")
export class AdminAiController extends Controller {
  private aiService = new AiService();

  /**
   * 使用 Claude AI 潤飾文章（修正語法、讓文字更流暢），回傳潤飾後的 Markdown
   */
  @Post("/polish")
  @SuccessResponse(200, "OK")
  public async polishContent(
    @Body() body: PolishContentDto,
  ): Promise<PolishContentResponse> {
    const polished = await this.aiService.polishContent(body.title, body.content);
    return { polished };
  }
}
