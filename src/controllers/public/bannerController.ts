import { Controller, Get, Route, Tags } from "tsoa";
import { BannerService } from "../../services/bannerService";
import { PublicBanner } from "../../models/banner";
import { ApiResponse } from "../../models/response";

@Route("public/banner")
@Tags("Public - Banner")
export class PublicBannerController extends Controller {
  private bannerService = new BannerService();

  /**
   * 取得前台啟用中的 banner
   */
  @Get("/")
  public async getPublicBanner(): Promise<ApiResponse<PublicBanner | undefined>> {
    const banner = await this.bannerService.getPublicBanner();
    if (!banner) return { data: undefined };
    const { isActive, createdAt, updatedAt, ...publicBanner } = banner;
    return { data: publicBanner };
  }
}
