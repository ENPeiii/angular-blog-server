import { Controller, Get, Route, Tags } from "tsoa";
import { BannerService } from "../../services/bannerService";
import { Banner } from "../../models/banner";
import { ApiResponse } from "../../models/response";

@Route("api/public/banner")
@Tags("Public - Banner")
export class PublicBannerController extends Controller {
  private bannerService = new BannerService();

  /**
   * 取得前台 banner
   */
  @Get("/")
  public getPublicBanner(): ApiResponse<Banner | undefined> {
    return { data: this.bannerService.getPublicBanner() };
  }
}
