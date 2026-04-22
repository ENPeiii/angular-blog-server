/** 後台完整主題物件 */
export interface Topic {
  /** 主題 slug @example "vue-series" */
  id: string;
  /** 主題名稱 @example "Vue 系列" */
  name: string;
  /** 主題簡介 @example "從零開始學 Vue 3" */
  description: string | null;
  /** 建立時間（UTC） @example "2024-01-15T08:30:00.000Z" */
  createdAt: Date;
  /** 最後更新時間（UTC） @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
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
