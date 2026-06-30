import { Body, Controller, Get, Put, Route, Tags } from "tsoa";
import { AboutService } from "../../services/aboutService";
import { About, UpdateAboutDto } from "../../models/about";
import { ApiResponse } from "../../models/response";

@Route("admin/about")
@Tags("Admin - About")
export class AdminAboutController extends Controller {
  private aboutService = new AboutService();

  /**
   * 取得關於我頁面內容（後台編輯用）
   */
  @Get("/")
  public async getAbout(): Promise<ApiResponse<About>> {
    return { data: await this.aboutService.get() };
  }

  /**
   * 更新關於我頁面內容
   */
  @Put("/")
  public async updateAbout(@Body() body: UpdateAboutDto): Promise<ApiResponse<About>> {
    return { data: await this.aboutService.update(body.content) };
  }
}
