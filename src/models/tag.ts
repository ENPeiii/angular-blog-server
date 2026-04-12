/** 後台完整標籤物件 */
export interface Tag {
  /** 標籤唯一識別碼（UUID，由後端自動產生） @example "b2c3d4e5-f6a7-8901-bcde-f12345678901" */
  id: string;
  /** 標籤名稱 @example "TypeScript" */
  name: string;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
}

/** 前台公開標籤物件（不含後台管理欄位） */
export interface PublicTag {
  /** 標籤唯一識別碼（UUID） @example "b2c3d4e5-f6a7-8901-bcde-f12345678901" */
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
