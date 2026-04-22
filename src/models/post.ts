import { PublicTag } from "./tag";

/** 後台完整文章物件（從資料庫/記憶體讀出來的完整資料） */
export interface Post {
  /** 文章唯一識別碼（UUID，由後端自動產生） @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 文章內文（支援純文字或 Markdown） @example "這是文章內容..." */
  content: string;
  /** 文章類別 @example "common" */
  categories: string;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 最後更新時間（UTC） @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
  /** 文章標籤列表 */
  tags: PublicTag[];
}

/** 前台公開文章物件（不含後台管理欄位） */
export interface PublicPost {
  /** 文章唯一識別碼（UUID） @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 文章內文 @example "這是文章內容..." */
  content: string;
  /** 文章類別 @example "common" */
  categories: string;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 文章標籤列表 */
  tags: PublicTag[];
}

/** 新增文章時的請求資料（id 和時間戳由後端自動產生） */
export interface CreatePostDto {
  /** 文章標題（必填） @example "我的第一篇文章" */
  title: string;
  /** 文章內文（必填） @example "這是文章內容..." */
  content: string;
  /** 文章類別 @example "common" */
  categories: string;
  /** 標籤名稱清單，tag 不存在時自動建立 @example ["TypeScript", "Vue 3"] */
  tags?: string[];
}

/** 更新文章時的請求資料（所有欄位皆為選填，只傳要改的欄位即可） */
export interface UpdatePostDto {
  /** 新的文章標題 @example "更新後的標題" */
  title?: string;
  /** 新的文章內文 @example "更新後的內容..." */
  content?: string;
  /** 文章類別 @example "common" */
  categories: string;
  /** 傳入則完整替換文章的 tag 列表 @example ["TypeScript"] */
  tags?: string[];
}
