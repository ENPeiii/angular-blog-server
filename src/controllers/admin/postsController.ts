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
import { CreatePostDto, Post as PostModel, UpdatePostDto } from "../../models/post";
import { PostsService } from "../../services/postsService";
import { ApiResponse } from "../../models/response";

@Route("admin/posts")
@Tags("Admin - Posts")
export class AdminPostsController extends Controller {
  private postsService = new PostsService();

  /**
   * 取得所有文章清單（含後台管理欄位）
   */
  @Get("/")
  public async getPosts(): Promise<ApiResponse<PostModel[]>> {
    return { data: await this.postsService.getAll() };
  }

  /**
   * 根據 ID 取得單篇文章（含後台管理欄位）
   * @param id 文章 ID
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Post not found")
  public async getPost(@Path() id: string): Promise<ApiResponse<PostModel>> {
    const post = await this.postsService.getById(id);
    if (!post) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    return { data: post };
  }

  /**
   * 新增一篇文章
   */
  @Post("/")
  @SuccessResponse(201, "Created")
  public async createPost(@Body() body: CreatePostDto): Promise<ApiResponse<PostModel>> {
    this.setStatus(201);
    return { data: await this.postsService.create(body) };
  }

  /**
   * 更新指定文章的內容（只傳要修改的欄位即可）
   * @param id 文章 ID
   */
  @Put("{id}")
  @Response<{ message: string }>(404, "Post not found")
  public async updatePost(
    @Path() id: string,
    @Body() body: UpdatePostDto
  ): Promise<ApiResponse<PostModel>> {
    const post = await this.postsService.update(id, body);
    if (!post) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    return { data: post };
  }

  /**
   * 刪除指定文章
   * @param id 文章 ID
   */
  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Post not found")
  public async deletePost(@Path() id: string): Promise<void> {
    const success = await this.postsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    this.setStatus(204);
  }
}
