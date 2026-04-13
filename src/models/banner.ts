export interface Banner {
  /** 唯一識別碼（UUID，由後端自動產生） @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** banner 名稱 @example "logo+文字" */
  title: string;
  /** banner 類型 @example "圖文|圖" */
  type: string;
  /** 圖片網址 */
  img: string;
  /** 是否啟用 */
  isActive: boolean;
  /** 內容 */
  content?: string;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 最後更新時間（UTC），未更新過則為 null @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
}

/** 前台公開 banner 物件（不含後台管理欄位） */
export interface PublicBanner{
  /** 唯一識別碼（UUID，由後端自動產生） @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890" */
  id: string;
  /** banner 名稱 @example "logo+文字" */
  title: string;
  /** banner 類型 @example "圖文|圖" */
  type: string;
  /** 圖片網址 */
  img: string;
  /** 內容 */
  content?: string;
}

export interface CreateBannerDto {
  /** banner 名稱 @example "logo+文字" */
  title: string;
  /** banner 類型 @example "圖文|圖" */
  type: string;
  /** 圖片網址 */
  img: string;
  /** 內容 */
  content?: string;
}

export interface UpdateBannerDto {
  /** banner 名稱 @example "logo+文字" */
  title?: string;
  /** banner 類型 @example "圖文|圖" */
  type?: string;
  /** 圖片網址 */
  img?: string;
  /** 內容 */
  content?: string;
}