import { Controller, Get, Path, Route, Tags, Response } from "tsoa";
import { PublicTag } from "../../models/tag";
import { TagsService } from "../../services/tagsService";
import { ApiResponse } from "../../models/response";

@Route("api/public/tags")
@Tags("Public - Tags")
export class PublicTagsController extends Controller {
  private tagsService = new TagsService();

  /**
   * 取得所有標籤清單
   */
  @Get("/")
  public async getTags(): Promise<ApiResponse<PublicTag[]>> {
    return { data: this.tagsService.getAll().map(({ createdAt, ...tag }) => tag) };
  }

  /**
   * 根據 ID 取得單一標籤
   * @param id 標籤 ID
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: string): Promise<ApiResponse<PublicTag>> {
    const tag = this.tagsService.getById(id);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    const { createdAt, ...publicTag } = tag;
    return { data: publicTag };
  }
}
