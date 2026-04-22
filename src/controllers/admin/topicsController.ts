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
import { CreateTopicDto, Topic, UpdateTopicDto } from "../../models/topic";
import { TopicsService } from "../../services/topicsService";
import { ApiResponse } from "../../models/response";

@Route("admin/topics")
@Tags("Admin - Topics")
export class AdminTopicsController extends Controller {
  private topicsService = new TopicsService();

  /**
   * 取得所有主題清單
   */
  @Get("/")
  public async getTopics(): Promise<ApiResponse<Topic[]>> {
    return { data: await this.topicsService.getAll() };
  }

  /**
   * 根據 ID 取得單一主題
   * @param id 主題 slug
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Topic not found")
  public async getTopic(@Path() id: string): Promise<ApiResponse<Topic>> {
    const topic = await this.topicsService.getById(id);
    if (!topic) {
      this.setStatus(404);
      throw new Error("Topic not found");
    }
    return { data: topic };
  }

  /**
   * 新增一個主題（id 由 name 自動產生 slug）
   */
  @Post("/")
  @SuccessResponse(201, "Created")
  public async createTopic(@Body() body: CreateTopicDto): Promise<ApiResponse<Topic>> {
    this.setStatus(201);
    return { data: await this.topicsService.create(body) };
  }

  /**
   * 更新指定主題
   * @param id 主題 slug
   */
  @Put("{id}")
  @Response<{ message: string }>(404, "Topic not found")
  public async updateTopic(
    @Path() id: string,
    @Body() body: UpdateTopicDto
  ): Promise<ApiResponse<Topic>> {
    const topic = await this.topicsService.update(id, body);
    if (!topic) {
      this.setStatus(404);
      throw new Error("Topic not found");
    }
    return { data: topic };
  }

  /**
   * 刪除指定主題
   * @param id 主題 slug
   */
  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Topic not found")
  public async deleteTopic(@Path() id: string): Promise<void> {
    const success = await this.topicsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Topic not found");
    }
    this.setStatus(204);
  }
}
