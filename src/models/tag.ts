/** 後台完整標籤物件 */
export interface Tag {
  /** 標籤id（前端當作路由使用） @example "typescript"*/
  id: string;
  /** 標籤名稱 @example "TypeScript" */
  name: string;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 最後更新時間（UTC），未更新過則為 null @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
}

/** 前台公開標籤物件（不含後台管理欄位） */
export interface PublicTag {
  /** 標籤 slug（前端當作路由使用） @example "typescript" */
  id: string;
  /** 標籤名稱 @example "TypeScript" */
  name: string;
}

/** 新增標籤時的請求資料 */
export interface CreateTagDto {
  /** 標籤名稱（必填） @example "TypeScript" */
  name: string;
}

/** 更新標籤時的請求資料 */
export interface UpdateTagDto {
  /** 新的標籤名稱 @example "JavaScript" */
  name: string;
}
