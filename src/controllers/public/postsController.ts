import { Controller, Get, Path, Query, Route, Tags, Response } from "tsoa";
import { PostLatestItem, PostListItem, PublicPost } from "../../models/post";
import { PostsService } from "../../services/postsService";
import { ApiResponse, PaginatedResponse } from "../../models/response";

@Route("public/posts")
@Tags("Public - Posts")
export class PublicPostsController extends Controller {
  private postsService = new PostsService();

  /**
   * 取得文章列表（不含內文與標籤），可依分類或主題篩選
   * @param page 頁碼（從 1 開始）
   * @param pageSize 每頁筆數
   * @param categories 文章分類（tech | life），不傳則取全部
   * @param topicId 主題 slug，不傳則取全部
   */
  @Get("/")
  public async getPosts(
    @Query() page = 1,
    @Query() pageSize = 10,
    @Query() categories?: string,
    @Query() topicId?: string,
  ): Promise<PaginatedResponse<PostListItem>> {
    const { data, total } = await this.postsService.getList(page, pageSize, categories, topicId);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * 取得首頁最新 5 篇文章（含標籤、內文前 100 字）
   */
  @Get("latest")
  public async getLatestPosts(): Promise<ApiResponse<PostLatestItem[]>> {
    return { data: await this.postsService.getLatest() };
  }

  /**
   * 根據 ID 取得單篇文章完整內容
   * @param id 文章 ID
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Post not found")
  public async getPost(@Path() id: string): Promise<ApiResponse<PublicPost>> {
    const post = await this.postsService.getById(id);
    if (!post) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    const { updatedAt, ...publicPost } = post;
    return { data: publicPost };
  }
}
