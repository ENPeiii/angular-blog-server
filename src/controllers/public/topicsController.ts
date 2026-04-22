import { Controller, Get, Path, Route, Tags, Response } from "tsoa";
import { PublicTopic } from "../../models/topic";
import { TopicsService } from "../../services/topicsService";
import { ApiResponse } from "../../models/response";

@Route("public/topics")
@Tags("Public - Topics")
export class PublicTopicsController extends Controller {
  private topicsService = new TopicsService();

  /**
   * 取得所有主題列表（含簡介）
   */
  @Get("/")
  public async getTopics(): Promise<ApiResponse<PublicTopic[]>> {
    const topics = await this.topicsService.getAll();
    return { data: topics.map(({ id, name, description }) => ({ id, name, description })) };
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
}
