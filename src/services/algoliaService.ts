import { algoliasearch, SearchClient } from "algoliasearch";
import { Post } from "../models/post";
import { stripMarkdown } from "../lib/markdown";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://enpei.com.tw";
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? "blog-post";

const CATEGORY_LABEL: Record<string, string> = {
  tech: "Tech",
  life: "Life",
};

function buildRecord(post: Post) {
  // 有主題的文章連到 /topics/:topicId/:postId，否則 /blog/:postId
  const url = post.topicId
    ? `${FRONTEND_URL}/topics/${post.topicId}/${post.id}`
    : `${FRONTEND_URL}/blog/${post.id}`;

  return {
    objectID: post.id,
    url,
    type: "content",
    anchor: null,
    hierarchy: {
      lvl0: CATEGORY_LABEL[post.categories] ?? post.categories,
      lvl1: post.topic?.name ?? "一般文章",
      lvl2: post.title,
      lvl3: null,
      lvl4: null,
      lvl5: null,
      lvl6: null,
    },
    content: stripMarkdown(post.content).slice(0, 200),
  };
}

export class AlgoliaService {
  private client: SearchClient | null = null;

  constructor() {
    const appId = process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;

    if (appId && apiKey) {
      this.client = algoliasearch(appId, apiKey);
    } else {
      console.warn("[Algolia] ALGOLIA_APP_ID 或 ALGOLIA_ADMIN_API_KEY 未設定，索引功能停用");
    }
  }

  async syncPost(post: Post): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.saveObject({
        indexName: INDEX_NAME,
        body: buildRecord(post),
      });
    } catch (e) {
      console.error("[Algolia] syncPost 失敗:", e);
    }
  }

  async removePost(id: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.deleteObject({
        indexName: INDEX_NAME,
        objectID: id,
      });
    } catch (e) {
      console.error("[Algolia] removePost 失敗:", e);
    }
  }
}
