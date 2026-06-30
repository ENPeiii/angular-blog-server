import { Controller, Get, Route, Tags } from "tsoa";
import { AboutService } from "../../services/aboutService";
import { About } from "../../models/about";
import { ApiResponse } from "../../models/response";

@Route("public/about")
@Tags("Public - About")
export class PublicAboutController extends Controller {
  private aboutService = new AboutService();

  /**
   * 取得關於我頁面內容
   */
  @Get("/")
  public async getAbout(): Promise<ApiResponse<About>> {
    return { data: await this.aboutService.get() };
  }
}
