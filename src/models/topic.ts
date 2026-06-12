/** 後台完整主題物件 */
export interface Topic {
  /** 主題 slug @example "vue-series" */
  id: string;
  /** 主題名稱 @example "Vue 系列" */
  name: string;
  /** 主題簡介 @example "從零開始學 Vue 3" */
  description: string | null;
  /** 此主題下的文章數 @example 5 */
  postCount: number;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 最後更新時間（UTC） @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
}

/** 章節內的文章摘要（用於後台主題詳情） */
export interface TopicSectionPost {
  /** 文章 UUID @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** 文章標題 @example "我的第一篇文章" */
  title: string;
  /** 在章節內的排序 @example 0 */
  order: number;
}

/** 後台主題章節物件 */
export interface TopicSection {
  /** 章節 UUID @example "b2c3d4e5-..." */
  id: string;
  /** 章節名稱 @example "前導知識" */
  name: string;
  /** 章節排序 @example 0 */
  order: number;
  /** 此章節下的文章列表（依 order 排序） */
  posts: TopicSectionPost[];
}

/** 後台主題詳情（含章節與文章） */
export interface TopicWithSections extends Topic {
  /** 章節列表（依 order 排序） */
  sections: TopicSection[];
}

/** 前台公開主題物件 */
export interface PublicTopic {
  /** 主題 slug @example "vue-series" */
  id: string;
  /** 主題名稱 @example "Vue 系列" */
  name: string;
  /** 主題簡介 @example "從零開始學 Vue 3" */
  description: string | null;
}

/** 前台主題 nav 單篇文章 */
export interface TopicNavPost {
  /** 文章 UUID */
  id: string;
  /** 文章標題 */
  name: string;
}

/** 前台主題 nav 章節 */
export interface TopicNavSection {
  /** 章節 UUID */
  id: string;
  /** 章節名稱 */
  name: string;
  /** 此章節下的文章 */
  items: TopicNavPost[];
}

/** 新增主題時的請求資料 */
export interface CreateTopicDto {
  /** 主題名稱（必填） @example "Vue 系列" */
  name: string;
  /** 主題簡介 @example "從零開始學 Vue 3" */
  description?: string;
}

/** 更新主題時的請求資料 */
export interface UpdateTopicDto {
  /** 主題名稱 @example "Vue 系列" */
  name?: string;
  /** 主題簡介 @example "從零開始學 Vue 3" */
  description?: string;
}

/** 同步主題章節時單一章節的資料 */
export interface SyncSectionItem {
  /** 現有章節的 UUID，null 表示新增 @example "b2c3d4e5-..." */
  id?: string;
  /** 章節名稱 @example "前導知識" */
  name: string;
  /** 章節排序 @example 0 */
  order: number;
  /** 此章節下的文章 UUID 列表（依排序） */
  postIds: string[];
}

/** 同步主題章節的請求資料 */
export interface SyncSectionsDto {
  /** 章節列表（完整替換現有章節狀態） */
  sections: SyncSectionItem[];
}
