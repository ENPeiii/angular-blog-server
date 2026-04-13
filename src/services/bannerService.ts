import { Banner, CreateBannerDto, UpdateBannerDto } from "../models/banner";
import { prisma } from "../lib/prisma";

export class BannerService {
  async getPublicBanner(): Promise<Banner | undefined> {
    const banner = await prisma.banner.findFirst({
      where: { isActive: true },
    });
    return (banner as Banner) ?? undefined;
  }

  async getAll(): Promise<Banner[]> {
    return prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    }) as Promise<Banner[]>;
  }

  async getById(id: string): Promise<Banner | undefined> {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    return (banner as Banner) ?? undefined;
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    return prisma.banner.create({
      data: { ...dto, isActive: false },
    }) as Promise<Banner>;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner | undefined> {
    try {
      if (dto.isActive) {
        // 啟用此 banner 時，先把其他全部設為 inactive
        await prisma.banner.updateMany({
          where: { id: { not: id } },
          data: { isActive: false },
        });
      }
      return await prisma.banner.update({
        where: { id },
        data: dto,
      }) as Banner;
    } catch {
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.banner.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
