import { Controller, Get, Path, Route, Tags, Response } from "tsoa";
import { PublicPost } from "../../models/post";
import { PostsService } from "../../services/postsService";
import { ApiResponse } from "../../models/response";

@Route("public/posts")
@Tags("Public - Posts")
export class PublicPostsController extends Controller {
  private postsService = new PostsService();

  /**
   * 取得所有文章清單
   */
  @Get("/")
  public async getPosts(): Promise<ApiResponse<PublicPost[]>> {
    const posts = await this.postsService.getAll();
    return { data: posts.map(({ updatedAt, ...post }) => post) };
  }

  /**
   * 根據 ID 取得單篇文章
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
