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
import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";
import { TagsService } from "../services/tagsService";

@Route("tags")
@Tags("Tags")
export class TagsController extends Controller {
  private tagsService = new TagsService();

  @Get("/")
  public async getTags(): Promise<Tag[]> {
    return this.tagsService.getAll();
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: number): Promise<Tag> {
    const tag = this.tagsService.getById(id);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return tag;
  }

  @Post("/")
  @SuccessResponse(201, "Created")
  public async createTag(@Body() body: CreateTagDto): Promise<Tag> {
    this.setStatus(201);
    return this.tagsService.create(body);
  }

  @Put("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async updateTag(
    @Path() id: number,
    @Body() body: UpdateTagDto
  ): Promise<Tag> {
    const tag = this.tagsService.update(id, body);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return tag;
  }

  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Tag not found")
  public async deleteTag(@Path() id: number): Promise<void> {
    const success = this.tagsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    this.setStatus(204);
  }
}
