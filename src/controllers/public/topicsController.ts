import { Controller, Get, Path, Query, Route, Tags, Response } from "tsoa";
import { PublicTopic, TopicNavSection } from "../../models/topic";
import { TopicsService } from "../../services/topicsService";
import { ApiResponse, PaginatedResponse } from "../../models/response";

@Route("public/topics")
@Tags("Public - Topics")
export class PublicTopicsController extends Controller {
  private topicsService = new TopicsService();

  /**
   * 取得所有主題列表（含簡介）
   * @param page 頁碼（從 1 開始）
   * @param pageSize 每頁筆數
   */
  @Get("/")
  public async getTopics(
    @Query() page = 1,
    @Query() pageSize = 10,
  ): Promise<PaginatedResponse<PublicTopic>> {
    const { data, total } = await this.topicsService.getAll(page, pageSize);
    return {
      data: data.map(({ id, name, description }) => ({ id, name, description })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根據 ID 取得單一主題
   * @param id 主題 slug
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Topic not found")
  public async getTopic(@Path() id: string): Promise<ApiResponse<PublicTopic>> {
    const topic = await this.topicsService.getById(id);
    if (!topic) {
      this.setStatus(404);
      throw new Error("Topic not found");
    }
    return { data: { id: topic.id, name: topic.name, description: topic.description } };
  }

  /**
   * 取得主題的章節導覽結構（供前台側邊選單使用，僅含已發布文章）
   * @param id 主題 slug
   */
  @Get("{id}/nav")
  @Response<{ message: string }>(404, "Topic not found")
  public async getTopicNav(@Path() id: string): Promise<ApiResponse<TopicNavSection[]>> {
    const nav = await this.topicsService.getTopicNav(id);
    if (!nav) {
      this.setStatus(404);
      throw new Error("Topic not found");
    }
    return { data: nav };
  }
}
