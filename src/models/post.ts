import { CategoriesType } from "@prisma/client";
import { PublicTag } from "./tag";
import { PublicTopic } from "./topic";

export { CategoriesType };

/** 後台完整文章物件 */
export interface Post {
  /** 文章唯一識別碼（UUID） @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 文章內文（Markdown） @example "# Hello" */
  content: string;
  /** 文章分類 @example "tech" */
  categories: CategoriesType;
  /** 所屬主題 ID @example "vue-series" */
  topicId: string | null;
  /** 所屬主題 */
  topic: PublicTopic | null;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 最後更新時間（UTC） @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
  /** 文章標籤列表 */
  tags: PublicTag[];
}

/** 前台公開文章物件（不含 updatedAt） */
export interface PublicPost {
  /** 文章唯一識別碼（UUID） @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 文章內文（Markdown） @example "# Hello" */
  content: string;
  /** 文章分類 @example "tech" */
  categories: CategoriesType;
  /** 所屬主題 ID @example "vue-series" */
  topicId: string | null;
  /** 所屬主題 */
  topic: PublicTopic | null;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 文章標籤列表 */
  tags: PublicTag[];
}

/** 文章列表項目（分類頁 / 主題頁用，不含 content 和 tags） */
export interface PostListItem {
  /** 文章唯一識別碼 @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 文章分類 @example "tech" */
  categories: CategoriesType;
  /** 所屬主題 ID @example "vue-series" */
  topicId: string | null;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
}

/** 首頁最新文章項目（含 tags 和截斷的 content） */
export interface PostLatestItem {
  /** 文章唯一識別碼 @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 文章分類 @example "tech" */
  categories: CategoriesType;
  /** 文章內文前 100 字 @example "這是文章內容的前一百個字..." */
  content: string;
  /** 文章標籤列表 */
  tags: PublicTag[];
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
}

/** 新增文章時的請求資料 */
export interface CreatePostDto {
  /** 文章標題（必填） @example "我的第一篇文章" */
  title: string;
  /** 文章內文（必填） @example "# Hello" */
  content: string;
  /** 文章分類（必填） @example "tech" */
  categories: CategoriesType;
  /** 所屬主題 ID @example "vue-series" */
  topicId?: string;
  /** 標籤名稱清單，tag 不存在時自動建立 @example ["TypeScript", "Vue 3"] */
  tags?: string[];
}

/** 更新文章時的請求資料（所有欄位皆為選填） */
export interface UpdatePostDto {
  /** 新的文章標題 @example "更新後的標題" */
  title?: string;
  /** 新的文章內文 @example "# Updated" */
  content?: string;
  /** 文章分類 @example "life" */
  categories?: CategoriesType;
  /** 所屬主題 ID（傳 null 可解除關聯） @example "vue-series" */
  topicId?: string | null;
  /** 傳入則完整替換文章的 tag 列表 @example ["TypeScript"] */
  tags?: string[];
}
