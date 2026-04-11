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
import { CreatePostDto, Post as PostModel, UpdatePostDto } from "../models/post";
import { PostsService } from "../services/postsService";

@Route("posts")
@Tags("Posts")
export class PostsController extends Controller {
  private postsService = new PostsService();

  /**
   * 取得所有文章
   */
  @Get("/")
  public async getPosts(): Promise<PostModel[]> {
    return this.postsService.getAll();
  }

  /**
   * 根據 ID 取得單篇文章
   */
  @Get("{id}")
  @Response<{ message: string }>(404, "Post not found")
  public async getPost(@Path() id: number): Promise<PostModel> {
    const post = this.postsService.getById(id);
    if (!post) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    return post;
  }

  /**
   * 建立新文章
   */
  @Post("/")
  @SuccessResponse(201, "Created")
  public async createPost(@Body() body: CreatePostDto): Promise<PostModel> {
    this.setStatus(201);
    return this.postsService.create(body);
  }

  /**
   * 更新文章
   */
  @Put("{id}")
  @Response<{ message: string }>(404, "Post not found")
  public async updatePost(
    @Path() id: number,
    @Body() body: UpdatePostDto
  ): Promise<PostModel> {
    const post = this.postsService.update(id, body);
    if (!post) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    return post;
  }

  /**
   * 刪除文章
   */
  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Post not found")
  public async deletePost(@Path() id: number): Promise<void> {
    const success = this.postsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Post not found");
    }
    this.setStatus(204);
  }
}
