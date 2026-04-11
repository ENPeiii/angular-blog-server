# Angular Blog Server — 架構說明文件

> 寫給前端開發者看的後端入門指南

---

## 目錄

1. [整體架構概覽](#1-整體架構概覽)
2. [技術棧說明](#2-技術棧說明)
3. [專案資料夾結構](#3-專案資料夾結構)
4. [資料流程：一個請求的旅程](#4-資料流程一個請求的旅程)
5. [各檔案詳解](#5-各檔案詳解)
   - [models/post.ts — 資料形狀](#51-modelspostts--資料形狀)
   - [services/postsService.ts — 業務邏輯](#52-servicespostsservicets--業務邏輯)
   - [controllers/postsController.ts — API 端點](#53-controllerspostscontrollerts--api-端點)
   - [app.ts — Express 應用程式](#54-appts--express-應用程式)
   - [server.ts — 啟動入口](#55-serverts--啟動入口)
6. [設定檔說明](#6-設定檔說明)
   - [tsconfig.json](#61-tsconfigjson)
   - [tsoa.json](#62-tsoajson)
7. [Tsoa 是什麼？它幫了什麼？](#7-tsoa-是什麼它幫了什麼)
8. [API 文件工具：Swagger UI vs ReDoc](#8-api-文件工具swagger-ui-vs-redoc)
9. [HTTP 狀態碼對照表](#9-http-狀態碼對照表)
10. [開發指令說明](#10-開發指令說明)
11. [接下來可以做什麼](#11-接下來可以做什麼)

---

## 1. 整體架構概覽

```
前端 (Angular)
     │
     │  HTTP 請求 (GET / POST / PUT / DELETE)
     ▼
┌─────────────────────────────┐
│         Express Server      │  ← 像是一個「接線生」
│                             │
│  ┌─────────────────────┐    │
│  │    Controller       │    │  ← 定義「有哪些電話分機」(API 端點)
│  └────────┬────────────┘    │
│           │                 │
│  ┌────────▼────────────┐    │
│  │    Service          │    │  ← 真正「處理事情」的人
│  └────────┬────────────┘    │
│           │                 │
│  ┌────────▼────────────┐    │
│  │  資料 (現在是記憶體) │    │  ← 暫時存在 RAM，之後會換成資料庫
│  └─────────────────────┘    │
└─────────────────────────────┘
```

這個架構叫做 **Controller → Service → Data** 三層架構，是後端最常見的設計方式。
類比成前端：Controller 像是 Component，Service 像是 Angular Service，Data 像是 State。

---

## 2. 技術棧說明

| 技術 | 用途 | 前端類比 |
|------|------|---------|
| **Node.js** | 讓 JavaScript 在伺服器端執行 | — |
| **Express** | 處理 HTTP 請求的框架 | 像是後端的 Angular Router |
| **TypeScript** | 強型別的 JavaScript | 你已經知道了 |
| **Tsoa** | 從程式碼自動產生路由和 Swagger 文件 | 像是 Angular 的 `@Component` decorator 自動產生 metadata |
| **Swagger UI** | 可互動的 API 文件網頁（`/swagger`） | — |
| **ReDoc** | 美觀的閱讀型 API 文件網頁（`/redoc`） | — |

---

## 3. 專案資料夾結構

```
angular-blog-server/
│
├── src/                          ← 所有原始碼在這裡
│   ├── models/
│   │   └── post.ts               ← 定義資料長什麼樣子 (TypeScript interface)
│   │
│   ├── services/
│   │   └── postsService.ts       ← 業務邏輯：CRUD 實際怎麼操作資料
│   │
│   ├── controllers/
│   │   └── postsController.ts    ← API 端點：哪個 URL 對應哪個功能
│   │
│   ├── lib/
│   │   └── prisma.ts             ← Prisma Client 單例（接資料庫時用）
│   ├── routes.ts                 ← ⚠️ 自動產生，不要手動修改
│   ├── app.ts                    ← 建立 Express app、掛載 Swagger UI 和 ReDoc
│   └── server.ts                 ← 啟動伺服器（監聽 port）
│
├── public/
│   └── swagger.json              ← ⚠️ 自動產生，Swagger UI / ReDoc 共用的規格檔
│
├── tsoa.json                     ← Tsoa 的設定
├── tsconfig.json                 ← TypeScript 的設定
├── nodemon.json                  ← 開發時自動重啟的設定
└── package.json                  ← 專案設定與指令
```

**哪些檔案你會常常改：**
- `src/models/` — 新增或修改資料結構
- `src/services/` — 新增或修改業務邏輯
- `src/controllers/` — 新增或修改 API 端點

**哪些檔案不要手動改：**
- `src/routes.ts` — Tsoa 自動產生
- `public/swagger.json` — Tsoa 自動產生

---

## 4. 資料流程：一個請求的旅程

以「新增一篇文章」為例，`POST /posts`：

```
1. 前端送出請求
   POST http://localhost:3000/posts
   Body: { "title": "My Post", "content": "...", "author": "Alice" }

2. Express 收到請求
   app.ts 中的 RegisterRoutes(app) 把所有路由都掛上去

3. 路由分配
   routes.ts (自動產生) 看到 POST /posts → 交給 PostsController.createPost()

4. Controller 處理
   postsController.ts 的 createPost() 被呼叫
   - 驗證 request body 格式是否正確（Tsoa 自動做）
   - 呼叫 postsService.create(body)
   - 設定 HTTP 狀態碼 201
   - 回傳結果

5. Service 處理
   postsService.ts 的 create() 被呼叫
   - 產生新的 id
   - 加上 createdAt / updatedAt 時間戳
   - 把新文章加進 posts 陣列
   - 回傳新文章

6. 回應前端
   { "id": 2, "title": "My Post", ... }
   HTTP 201 Created
```

---

## 5. 各檔案詳解

### 5.1 [models/post.ts](src/models/post.ts) — 資料形狀

```typescript
// Post 是完整的文章物件（從資料庫/記憶體讀出來的）
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// CreatePostDto 是「新增文章時，前端要送什麼」
// DTO = Data Transfer Object，傳輸用的資料格式
// 注意：不需要 id、createdAt、updatedAt，這些由後端自動產生
export interface CreatePostDto {
  title: string;
  content: string;
  author: string;
}

// UpdatePostDto 是「更新文章時，前端要送什麼」
// 所有欄位都是 optional（有 ? 號），因為可以只更新部分欄位
export interface UpdatePostDto {
  title?: string;
  content?: string;
  author?: string;
}
```

**為什麼要分三個 interface？**

因為不同情境需要不同的資料：
- 讀取 → 回傳 `Post`（包含所有欄位）
- 新增 → 前端送 `CreatePostDto`（不含 id 和時間戳）
- 更新 → 前端送 `UpdatePostDto`（所有欄位都是選填）

這樣 TypeScript 就能在你忘記送必要欄位、或送了多餘欄位時報錯。

---

### 5.2 [services/postsService.ts](src/services/postsService.ts) — 業務邏輯

```typescript
// 模擬資料庫：目前用 array 存在記憶體裡
// 伺服器重啟後資料會消失，之後接資料庫就不會有這個問題
const posts: Post[] = [
  { id: 1, title: "First Post", ... }
];

let nextId = 2; // 模擬資料庫的自動遞增 ID

export class PostsService {
  // 取得全部文章 → 直接回傳陣列
  getAll(): Post[] { ... }

  // 根據 id 找文章 → 找不到回傳 undefined
  getById(id: number): Post | undefined { ... }

  // 新增文章 → 加上 id 和時間戳後存進陣列
  create(dto: CreatePostDto): Post { ... }

  // 更新文章 → 找到後只更新有傳入的欄位
  update(id: number, dto: UpdatePostDto): Post | undefined { ... }

  // 刪除文章 → 從陣列移除，回傳是否成功
  delete(id: number): boolean { ... }
}
```

**為什麼要把邏輯放在 Service，不直接寫在 Controller？**

分離關注點（Separation of Concerns）：
- Controller 只管「收請求、回應」
- Service 只管「怎麼處理資料」

好處：之後要換資料庫時，只需要改 Service 裡的邏輯，Controller 完全不用動。

---

### 5.3 [controllers/postsController.ts](src/controllers/postsController.ts) — API 端點

這是用了最多 Tsoa decorator 的地方，一行一行解釋：

```typescript
@Route("posts")      // 這個 Controller 的基礎路徑是 /posts
@Tags("Posts")       // 在 Swagger UI 中把這些 API 歸類在 "Posts" 分組
export class PostsController extends Controller {
  // extends Controller 是 Tsoa 提供的，給我們 setStatus() 等方法用

  private postsService = new PostsService(); // 建立 Service 實例

  @Get("/")          // 對應 GET /posts
  public async getPosts(): Promise<Post[]> {
    return this.postsService.getAll();
  }

  @Get("{id}")       // 對應 GET /posts/123，{id} 是 URL 參數
  @Response<...>(404, "Post not found")  // 告訴 Swagger 這個 API 可能回 404
  public async getPost(
    @Path() id: number  // 從 URL 路徑取得 id，Tsoa 會自動轉成 number
  ): Promise<Post> {
    const post = this.postsService.getById(id);
    if (!post) {
      this.setStatus(404);   // 設定 HTTP 狀態碼為 404
      throw new Error("Post not found");
    }
    return post;
  }

  @Post("/")         // 對應 POST /posts
  @SuccessResponse(201, "Created")  // 成功時回 HTTP 201
  public async createPost(
    @Body() body: CreatePostDto  // 從 request body 取得資料，Tsoa 自動驗證格式
  ): Promise<Post> {
    this.setStatus(201);
    return this.postsService.create(body);
  }

  @Put("{id}")       // 對應 PUT /posts/123
  public async updatePost(
    @Path() id: number,
    @Body() body: UpdatePostDto
  ): Promise<Post> { ... }

  @Delete("{id}")    // 對應 DELETE /posts/123
  public async deletePost(
    @Path() id: number
  ): Promise<void> { ... }
}
```

**Decorator 速查表：**

| Decorator | 說明 |
|-----------|------|
| `@Route("posts")` | 設定這個 Controller 的 URL 前綴 |
| `@Tags("Posts")` | Swagger 分組標籤 |
| `@Get()` / `@Post()` / `@Put()` / `@Delete()` | HTTP 方法 |
| `@Path()` | 從 URL 路徑取得參數，e.g. `/posts/:id` |
| `@Body()` | 從 request body 取得資料 |
| `@SuccessResponse(201, ...)` | 宣告成功時的 HTTP 狀態碼 |
| `@Response(404, ...)` | 宣告可能的錯誤狀態碼 |

---

### 5.4 [app.ts](src/app.ts) — Express 應用程式

```typescript
export const app = express(); // 建立 Express 應用程式實例

// Middleware：處理 request body 格式
app.use(express.json());           // 讓 Express 能讀懂 JSON body
app.use(express.urlencoded(...));  // 讓 Express 能讀懂表單 body

// 靜態檔案服務：讓 /swagger.json 可以透過 HTTP 存取
// ReDoc 需要一個公開的 URL 來讀取 API 規格，所以要把 public/ 資料夾暴露出來
app.use(express.static("public"));

// 掛載 Swagger UI：互動式測試介面，瀏覽 /swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 掛載 ReDoc：美觀的閱讀型文件，瀏覽 /redoc
app.get("/redoc", redoc({ title: "Angular Blog API", specUrl: "/swagger.json" }));

// 掛載 Tsoa 產生的所有路由（Controller 裡定義的 API 端點）
RegisterRoutes(app);

// 404 handler：所有沒有對應路由的請求，回傳 404
app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

// Error handler：有任何例外拋出時，回傳 500
app.use((err, _req, res, _next) => res.status(500).json(...));
```

**什麼是 Middleware？**

Middleware 就是「請求到達最終處理函式之前，中途要經過的處理步驟」。
類比：像是快遞到你手上之前，會先經過分揀中心、再到區域配送站。

`app.use(express.json())` 的意思是：每個進來的 request，都先自動把 body 從 JSON 字串解析成 JavaScript 物件。

---

### 5.5 [server.ts](src/server.ts) — 啟動入口

```typescript
import { app } from "./app"; // 引入設定好的 Express app

const PORT = process.env.PORT || 3000; // 從環境變數讀 port，預設 3000

app.listen(PORT, () => {
  // 開始監聽這個 port 的所有 HTTP 請求
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**為什麼 app.ts 和 server.ts 要分開？**

`app.ts` 負責「設定」，`server.ts` 負責「啟動」。
這樣做的好處是：寫測試的時候，可以直接 import `app` 而不用真的啟動伺服器。

---

## 6. 設定檔說明

### 6.1 [tsconfig.json](tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",           // 編譯成 ES2020 版本的 JavaScript
    "module": "commonjs",         // 使用 Node.js 的模組系統
    "outDir": "./dist",           // 編譯結果放在 dist/ 資料夾
    "rootDir": "./src",           // 原始碼在 src/ 資料夾
    "strict": true,               // 開啟嚴格型別檢查
    "experimentalDecorators": true,   // 允許使用 @ decorator 語法
    "emitDecoratorMetadata": true     // Tsoa 需要這個才能讀取型別資訊
  }
}
```

**`experimentalDecorators` 和 `emitDecoratorMetadata` 一定要開**，否則 Tsoa 的 decorator 無法運作。

---

### 6.2 [tsoa.json](tsoa.json)

```json
{
  "entryFile": "src/app.ts",                        // Tsoa 從哪個檔案開始分析
  "noImplicitAdditionalProperties": "throw-on-extras", // 收到多餘欄位時直接報錯（防止前端送垃圾資料）
  "controllerPathGlobs": ["src/controllers/**/*.ts"], // 去哪裡找 Controller 檔案
  "spec": {
    "outputDirectory": "public",   // swagger.json 要放在哪裡
    "specVersion": 3,              // 使用 OpenAPI 3.0 規格
    "info": { ... }                // API 文件的基本資訊
  },
  "routes": {
    "routesDir": "src"             // routes.ts 要放在哪裡
  }
}
```

---

## 7. Tsoa 是什麼？它幫了什麼？

**沒有 Tsoa 的世界（手動寫）：**

```typescript
// 要自己寫路由
app.post("/posts", (req, res) => {
  // 要自己驗證 body
  if (!req.body.title) return res.status(400).json({ error: "title required" });
  // ... 業務邏輯
});

// 要另外維護一份 swagger.yaml 文件，而且很容易跟程式碼不同步
```

**有 Tsoa 的世界（現在的做法）：**

```typescript
// 只要寫 TypeScript + decorator，路由和 Swagger 文件都自動產生
@Post("/")
public async createPost(@Body() body: CreatePostDto): Promise<Post> {
  return this.postsService.create(body);
}
```

Tsoa 幫你做了三件事：
1. **產生路由** (`src/routes.ts`) — 自動把 Controller 的方法對應到 Express 路由
2. **產生 Swagger 文件** (`public/swagger.json`) — 自動根據 TypeScript 型別產生 API 文件
3. **驗證請求** — 自動檢查前端送來的資料是否符合 interface 定義

---

## 8. API 文件工具：Swagger UI vs ReDoc

這個專案同時提供兩個 API 文件介面，它們讀的是同一份 `public/swagger.json`，只是呈現方式不同：

| | Swagger UI（`/swagger`） | ReDoc（`/redoc`） |
|--|----------------------|-----------------|
| **定位** | 開發測試用 | 對外展示 / 閱讀用 |
| **特色** | 可以直接在頁面上打 API | 排版精美，側欄導覽，適合閱讀 |
| **適合對象** | 後端開發者自己測試 | 給前端、PM、其他團隊看 |

**Swagger UI** — `http://localhost:3000/swagger`

- 可以直接在頁面上填參數、送出請求、看回應
- 不需要 Postman，開發時很方便

**ReDoc** — `http://localhost:3000/redoc`

- 三欄式排版（左側欄位導覽、中間說明、右側範例）
- 更適合當作正式 API 文件給其他人看

兩份文件都是 Tsoa 根據你的 TypeScript 程式碼自動產生的，只要改完程式碼執行 `npm run tsoa`，兩個頁面的內容都會同步更新。

---

## 9. HTTP 狀態碼對照表

後端回應前端時，除了資料本身，還會附上一個狀態碼：

| 狀態碼 | 意義 | 使用情境 |
|--------|------|---------|
| **200 OK** | 成功 | GET 成功 |
| **201 Created** | 建立成功 | POST 成功 |
| **204 No Content** | 成功但沒有內容要回傳 | DELETE 成功 |
| **400 Bad Request** | 前端送來的資料格式錯誤 | 缺少必填欄位 |
| **404 Not Found** | 找不到資源 | GET /posts/999 但 id 999 不存在 |
| **500 Internal Server Error** | 伺服器內部錯誤 | 程式拋出未預期的例外 |

---

## 10. 開發指令說明

```bash
# 開發模式：啟動伺服器，存檔後自動重啟
npm run dev

# 手動重新產生 routes.ts 和 swagger.json
# 新增/修改 Controller 後需要執行這個
npm run tsoa

# 編譯成 JavaScript（部署用）
npm run build

# 執行編譯後的版本（production 用）
npm start
```

**開發流程：**
1. `npm run dev` 啟動伺服器
2. 修改 Controller / Service / Model
3. 如果修改了 Controller（新增端點、改參數），執行 `npm run tsoa` 更新文件
4. 瀏覽 `http://localhost:3000/swagger` 互動測試 API
5. 瀏覽 `http://localhost:3000/redoc` 確認對外文件排版

---

## 11. 接下來可以做什麼

按照難度排序：

1. **接資料庫**
   - 安裝 Prisma（推薦新手）或 TypeORM
   - 把 `postsService.ts` 裡的記憶體 array 換成真正的資料庫操作

2. **新增認證**
   - 安裝 `jsonwebtoken`
   - 加入登入 / 註冊 API
   - 在需要保護的 API 加上 middleware 驗證 JWT Token

3. **新增其他資源**
   - 仿照 posts 的結構，新增 `comments` 或 `users`
   - 在 `src/models/`、`src/services/`、`src/controllers/` 各建一個新檔案

4. **環境設定**
   - 安裝 `dotenv`，把 PORT 等設定移到 `.env` 檔案

---

> 有任何問題都可以問，這份文件會隨著專案成長持續更新。
