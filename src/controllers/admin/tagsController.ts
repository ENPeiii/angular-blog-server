import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  SuccessResponse,
  Tags,
  Response,
} from "tsoa";
import { CreateTagDto, Tag, UpdateTagDto } from "../../models/tag";
import { TagsService } from "../../services/tagsService";
import { ApiResponse } from "../../models/response";

@Route("api/admin/tags")
@Tags("Admin - Tags")
export class AdminTagsController extends Controller {
  private tagsService = new TagsService();

  /**
   * 取得所有標籤清單（含後台管理欄位）
   */
  @Get("/")
  public async getTags(): Promise<ApiResponse<Tag[]>> {
    return { data: this.tagsService.getAll() };
  }

  /**
   * 根據 ID 取得單一標籤（含後台管理欄位）
   * @param id 標籤 ID
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: string): Promise<ApiResponse<Tag>> {
    const tag = this.tagsService.getById(id);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return { data: tag };
  }

  /**
   * 新增一個標籤
   */
  @Post("/")
  @SuccessResponse(201, "Created")
  public async createTag(@Body() body: CreateTagDto): Promise<ApiResponse<Tag>> {
    this.setStatus(201);
    return { data: this.tagsService.create(body) };
  }

  /**
   * 更新指定標籤名稱
   * @param id 標籤 ID
   */
  @Put("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async updateTag(
    @Path() id: string,
    @Body() body: UpdateTagDto
  ): Promise<ApiResponse<Tag>> {
    const tag = this.tagsService.update(id, body);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return { data: tag };
  }

  /**
   * 刪除指定標籤
   * @param id 標籤 ID
   */
  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Tag not found")
  public async deleteTag(@Path() id: string): Promise<void> {
    const success = this.tagsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    this.setStatus(204);
  }
}
