import { randomUUID } from "crypto";
import { Banner, CreateBannerDto, UpdateBannerDto } from './../models/banner';

const banners: Banner []= [{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  title: "logo+文字",
  type: "圖文",
  img: "https://avatars.githubusercontent.com/u/110892385?v=4",
  isActive: true,
  content: "# <span style=\"color: #F5992A\">Be my own goddess</span>\n\n程式是種樂趣，是訴說想像的語言無須畏懼",
  createdAt: new Date("2024-01-15T08:30:00.000Z"),
  updatedAt: new Date("2024-01-20T12:00:00.000Z")
}];

export class BannerService {
  /** 取得前台公開的 banner */
  getPublicBanner(): Banner | undefined {
    return banners.find((b) => b.isActive);
  }

  getAll(): Banner[] {
    return banners;
  }

  getById(id: string): Banner | undefined {
    return banners.find((b) => b.id === id);
  }

  create(dto: CreateBannerDto): Banner {
    const now = new Date();
    const banner: Banner = {
      id: randomUUID(),
      ...dto,
      isActive: false,
      createdAt: now,
      updatedAt: now
    };
    banners.push(banner);
    return banner;
  }

  update(id:string,dto: UpdateBannerDto): Banner | undefined {
    const banner = this.getById(id);
    if (!banner) return undefined;

    if (dto.title !== undefined) banner.title = dto.title;
    if (dto.type !== undefined) banner.type = dto.type;
    if (dto.img !== undefined) banner.img = dto.img;
    if (dto.content !== undefined) banner.content = dto.content;
    banner.updatedAt = new Date();

    return banner;
  }

  delete(id: string): boolean {
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return false;
    banners.splice(index, 1);
    return true;
  }

}