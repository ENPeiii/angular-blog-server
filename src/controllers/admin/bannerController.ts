import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { BannerService } from "../../services/bannerService";
import { CreateBannerDto, UpdateBannerDto,Banner as BannerModel } from './../../models/banner';


@Route("api/admin/banner")
@Tags("Admin - Banner")
export class AdminBannerController extends Controller {
  private bannerService = new BannerService();

  /**
   * 取得所有後台 banner
   */
  @Get("/")
  public getBanners(): BannerModel[] {
    return this.bannerService.getAll();
  }

  /**
   * 取得單一後台 banner
   *  @param id banner ID
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Banner not found")
  public async getBanner(@Path() id: string): Promise<BannerModel> {
      const banner = this.bannerService.getById(id);
      if (!banner) {
        this.setStatus(404);
        throw new Error("Banner not found");
      }
      return banner;
    }

  /**
   * 新增後台 banner
   */
  @Post("/")
  @SuccessResponse(201, "Created")
  public async createBanner(@Body() body: CreateBannerDto): Promise<BannerModel> {
    this.setStatus(201);
    return this.bannerService.create(body);
  }

  /**
   * 更新指定banner的內容（只傳要修改的欄位即可）
   * @param id banner ID
   */
  @Put("{id}")
  @Response<{ message: string }>(404, "Banner not found")
  public async updateBanner(
    @Path() id: string,
    @Body() body: UpdateBannerDto
  ): Promise<BannerModel> {
    const banner = this.bannerService.update(id, body);
    if (!banner) {
      this.setStatus(404);
      throw new Error("Banner not found");
    }
    return banner;
  }


  /**
   * 刪除指定banner
   * @param id banner ID
   */
  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Banner not found")
  public async deleteBanner(@Path() id: string): Promise<void> {
    const success = this.bannerService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Banner not found");
    }
    this.setStatus(204);
  }
}