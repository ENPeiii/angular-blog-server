import { Controller, Get, Path, Query, Route, Tags, Response } from "tsoa";
import { PublicTag, PublicTagListItem } from "../../models/tag";
import { TagsService } from "../../services/tagsService";
import { ApiResponse, PaginatedResponse } from "../../models/response";

@Route("public/tags")
@Tags("Public - Tags")
export class PublicTagsController extends Controller {
  private tagsService = new TagsService();

  /**
   * 取得所有標籤清單（含文章數）
   * @param page 頁碼（從 1 開始）
   * @param pageSize 每頁筆數
   */
  @Get("/")
  public async getTags(
    @Query() page = 1,
    @Query() pageSize = 10,
  ): Promise<PaginatedResponse<PublicTagListItem>> {
    const { data, total } = await this.tagsService.getAll(page, pageSize, undefined, true);
    return {
      data: data.map(({ id, name, postCount }) => ({ id, name, postCount })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根據 ID 取得單一標籤
   * @param id 標籤 ID
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: string): Promise<ApiResponse<PublicTag>> {
    const tag = await this.tagsService.getById(id);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return { data: { id: tag.id, name: tag.name } };
  }
}
