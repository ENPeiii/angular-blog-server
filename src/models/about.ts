export interface About {
  /** @example "singleton" */
  id: string;
  /** 關於我的 Markdown 內容 @example "# 關於我\n..." */
  content: string;
  /** 最後更新時間（UTC） @example "2024-01-20T12:00:00.000Z" */
  updatedAt: Date;
}

export interface UpdateAboutDto {
  /** 關於我的 Markdown 內容 @example "# 關於我\n..." */
  content: string;
}
