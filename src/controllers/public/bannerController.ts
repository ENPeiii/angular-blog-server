import { Controller, Get, Route, Tags } from "tsoa";
import { BannerService } from "../../services/bannerService";
import { Banner } from "../../models/banner";
import { ApiResponse } from "../../models/response";

@Route("public/banner")
@Tags("Public - Banner")
export class PublicBannerController extends Controller {
  private bannerService = new BannerService();

  /**
   * 取得前台啟用中的 banner
   */
  @Get("/")
  public async getPublicBanner(): Promise<ApiResponse<Banner | undefined>> {
    return { data: await this.bannerService.getPublicBanner() };
  }
}
