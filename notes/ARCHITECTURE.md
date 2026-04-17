# Angular Blog Server — 架構說明文件

> 寫給前端開發者看的後端入門指南

---

## 目錄

1. [整體架構概覽](#1-整體架構概覽)
2. [技術棧說明](#2-技術棧說明)
3. [專案資料夾結構](#3-專案資料夾結構)
4. [前後台 API 分離設計](#4-前後台-api-分離設計)
5. [資料流程：一個請求的旅程](#5-資料流程一個請求的旅程)
6. [各檔案詳解](#6-各檔案詳解)
   - [models/post.ts — 資料形狀](#61-modelspostts--資料形狀)
   - [services/postsService.ts — 業務邏輯](#62-servicespostsservicets--業務邏輯)
   - [controllers/ — API 端點](#63-controllers--api-端點)
   - [middleware/auth.ts — 後台驗證](#64-middlewareauthts--後台驗證)
   - [app.ts — Express 應用程式](#65-appts--express-應用程式)
   - [server.ts — 啟動入口](#66-serverts--啟動入口)
7. [設定檔說明](#7-設定檔說明)
   - [tsconfig.json](#71-tsconfigjson)
   - [tsoa.json](#72-tsoajson)
8. [Tsoa 是什麼？它幫了什麼？](#8-tsoa-是什麼它幫了什麼)
9. [Prisma 是什麼？它幫了什麼？](#9-prisma-是什麼它幫了什麼)
10. [API 文件工具：Swagger UI vs ReDoc](#10-api-文件工具swagger-ui-vs-redoc)
11. [HTTP 狀態碼對照表](#11-http-狀態碼對照表)
12. [開發指令說明](#12-開發指令說明)
13. [接下來可以做什麼](#13-接下來可以做什麼)

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
│  │    Prisma Client    │    │  ← ORM，把 TypeScript 呼叫轉成 SQL
│  └────────┬────────────┘    │
└───────────┼─────────────────┘
            │
            ▼
     PostgreSQL (Docker)
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
| **Prisma** | ORM：用 TypeScript 操作資料庫，自動產生型別 | 像是後端的 HttpClient |
| **PostgreSQL** | 關聯式資料庫，跑在 Docker 容器裡 | — |

---

## 3. 專案資料夾結構

```
angular-blog-server/
│
├── src/
│   ├── models/
│   │   ├── post.ts               ← Post 的 interface（Post、PublicPost、CreatePostDto、UpdatePostDto）
│   │   ├── tag.ts                ← Tag 的 interface（Tag、PublicTag、CreateTagDto、UpdateTagDto）
│   │   ├── banner.ts             ← Banner 的 interface（Banner、PublicBanner、CreateBannerDto、UpdateBannerDto）
│   │   └── response.ts           ← 統一 API 回傳格式 ApiResponse<T>
│   │
│   ├── services/
│   │   ├── postsService.ts       ← Post CRUD（Prisma / PostgreSQL）
│   │   ├── tagsService.ts        ← Tag CRUD（Prisma / PostgreSQL）
│   │   └── bannerService.ts      ← Banner CRUD（Prisma / PostgreSQL）
│   │
│   ├── controllers/
│   │   ├── public/               ← 前台：只有讀取，不需要登入
│   │   │   ├── postsController.ts   (@Route("public/posts"))
│   │   │   ├── tagsController.ts    (@Route("public/tags"))
│   │   │   └── bannerController.ts  (@Route("public/banner"))
│   │   └── admin/                ← 後台：完整 CRUD，需要 Authorization header
│   │       ├── postsController.ts   (@Route("admin/posts"))
│   │       ├── tagsController.ts    (@Route("admin/tags"))
│   │       └── bannerController.ts  (@Route("admin/banner"))
│   │
│   ├── middleware/
│   │   └── auth.ts               ← 後台身份驗證，檢查 Authorization header
│   │
│   ├── lib/
│   │   └── prisma.ts             ← Prisma Client 單例（避免 hot-reload 時連線數爆炸）
│   ├── routes.ts                 ← ⚠️ 自動產生，不要手動修改
│   ├── app.ts                    ← Express 設定：掛載 middleware、文件、路由
│   └── server.ts                 ← 啟動伺服器（監聽 port）
│
├── public/
│   └── swagger.json              ← ⚠️ 自動產生，Swagger UI / ReDoc 共用
│
├── prisma/
│   ├── schema.prisma             ← 資料庫 schema（Post、Tag、Banner 三張表）
│   └── migrations/               ← ⚠️ Prisma 自動產生的 SQL 歷史，不要手動修改
│       ├── 20260413134045_init/
│       │   └── migration.sql     ← 建立 Post 資料表
│       └── 20260413151214_add_tag_banner/
│           └── migration.sql     ← 新增 Tag、Banner 資料表
│
├── notes/                        ← 學習筆記
│   ├── ARCHITECTURE.md           ← 這份文件
│   ├── COMMANDS.md               ← 常用指令速查（npm、Docker、Prisma）
│   ├── DOCKER_POSTGRES.md        ← 環境建立：Docker + PostgreSQL + Prisma 從零到跑起來
│   ├── new-resource.md           ← 開發日常：新增資源、欄位、常用 Prisma 指令
│   └── database.vuerd            ← DB ER 圖設計檔（用 vuerd 開啟）
│
├── docker-compose.yml            ← PostgreSQL 容器設定
├── prisma.config.ts              ← Prisma 7 資料庫連線設定
├── tsoa.json                     ← Tsoa 的設定
├── tsconfig.json                 ← TypeScript 的設定
└── package.json
```

**哪些檔案你會常常改：**
- `src/models/` — 新增或修改資料結構
- `src/services/` — 新增或修改業務邏輯
- `src/controllers/public/` — 新增或修改前台 API
- `src/controllers/admin/` — 新增或修改後台 API

**哪些檔案不要手動改：**
- `src/routes.ts` — Tsoa 自動產生
- `public/swagger.json` — Tsoa 自動產生

---

## 4. 前後台 API 分離設計

所有 API 都掛在 `/api/` 前綴下，再依身份分為兩組：

```
/api/public/*   → 前台，任何人都能存取（不需要登入）
/api/admin/*    → 後台，需要在 Header 帶上 Authorization token
```

**完整 API 路徑對照：**

| 資源 | 動作 | 前台（公開） | 後台（需登入） |
|------|------|------------|--------------|
| **Posts** | 取得全部 | GET `/api/public/posts` | GET `/api/admin/posts` |
| | 取得單筆 | GET `/api/public/posts/:id` | GET `/api/admin/posts/:id` |
| | 新增 | — | POST `/api/admin/posts` |
| | 更新 | — | PUT `/api/admin/posts/:id` |
| | 刪除 | — | DELETE `/api/admin/posts/:id` |
| **Tags** | 取得全部 | GET `/api/public/tags` | GET `/api/admin/tags` |
| | 取得單筆 | GET `/api/public/tags/:id` | GET `/api/admin/tags/:id` |
| | 新增 | — | POST `/api/admin/tags` |
| | 更新 | — | PUT `/api/admin/tags/:id` |
| | 刪除 | — | DELETE `/api/admin/tags/:id` |
| **Banner** | 取得啟用中 | GET `/api/public/banner` | — |
| | 取得全部 | — | GET `/api/admin/banner` |
| | 取得單筆 | — | GET `/api/admin/banner/:id` |
| | 新增 | — | POST `/api/admin/banner` |
| | 更新 | — | PUT `/api/admin/banner/:id` |
| | 刪除 | — | DELETE `/api/admin/banner/:id` |

**為什麼前台也需要讀取的 API？**

前台（Angular 部落格網站）只需要「讀取」文章給訪客看，不需要 CRUD。
後台（管理介面）才需要完整的 CRUD 來管理內容。

**保護機制如何運作（`app.ts` 裡的關鍵順序）：**

```typescript
// API 路由：/api 前綴統一在這裡定義一次
const API_PREFIX = "/api";
const apiRouter = express.Router();

// ⚠️ 順序重要：authMiddleware 必須在 RegisterRoutes 之前
// 後台路由保護：所有 /api/admin/* 都先過這道關卡
apiRouter.use("/admin", authMiddleware);

// Tsoa 產生的路由（包含 public 和 admin）
RegisterRoutes(apiRouter);

app.use(API_PREFIX, apiRouter);
```

Express 的 middleware 按照掛載順序執行。
`/api/admin/*` 的請求會先被 `authMiddleware` 攔截，沒有 token 直接回 401，
通過後才繼續到 `RegisterRoutes` 裡實際的 Controller 方法。

**`api` 前綴為什麼只在 `app.ts` 定義一次？**

`Controller` 的 `@Route()` 只寫 `admin/posts`（不帶 `api/`），
前綴 `/api` 統一由 `app.use(API_PREFIX, apiRouter)` 負責掛載。
這樣以後要改前綴（例如改成 `/v2`），只需要改 `API_PREFIX` 一個地方。

---

## 5. 資料流程：一個請求的旅程

以「後台新增一篇文章」為例，`POST /api/admin/posts`：

```
1. 前端送出請求
   POST http://localhost:3000/api/admin/posts
   Headers: { Authorization: "Bearer my-token" }
   Body: { "title": "My Post", "content": "...", "author": "Alice" }

2. authMiddleware 攔截
   檢查 Authorization header 是否存在
   → 有 token：繼續
   → 沒有 token：立即回 401 Unauthorized，流程中斷

3. RegisterRoutes 分配路由
   routes.ts 看到 POST /api/admin/posts
   → 交給 AdminPostsController.createPost()

4. Controller 處理
   - Tsoa 自動驗證 request body 格式
   - 呼叫 postsService.create(body)
   - 設定 HTTP 201
   - 回傳結果

5. Service 處理
   - 呼叫 Prisma Client：`prisma.post.create({ data: dto })`
   - Prisma 自動產生 UUID、createdAt、updatedAt
   - PostgreSQL 寫入資料並回傳完整物件

6. 回應前端
   { "id": 2, "title": "My Post", ... }
   HTTP 201 Created
```

---

## 6. 各檔案詳解

### 6.1 [models/post.ts](../src/models/post.ts) — 資料形狀

```typescript
// Post 是完整的文章物件（從資料庫讀出來的）
// 後台 controller 回傳這個，包含所有欄位
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// 前台回傳用：不含 updatedAt（訪客不需要知道最後修改時間）
// public controller 回傳這個，只暴露前台需要的欄位
export interface PublicPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
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

**為什麼要分這幾個 interface？**

因為不同情境需要不同的資料形狀：

| interface | 用在哪 | 說明 |
|-----------|--------|------|
| `Post` | 後台 controller 回傳、Service 內部流通 | 完整資料，所有欄位都有 |
| `PublicPost` | 前台 controller 回傳 | 精簡版，只有前台需要的欄位 |
| `CreatePostDto` | 前端新增時送來 | 不含 id 和時間戳（後端自動產生） |
| `UpdatePostDto` | 前端更新時送來 | 所有欄位都是選填 |

**為什麼 id 用 UUID（`string`）而不是流水號（`number`）？**

```
流水號：GET /api/public/posts/1、/posts/2、/posts/3...
→ 外部可以用迴圈枚舉所有資源，知道「總共有幾篇文章」

UUID：GET /api/public/posts/a1b2c3d4-e5f6-7890-abcd-ef1234567890
→ 無法猜測其他 ID，安全性較高
```

UUID 由 Prisma schema 的 `@default(uuid())` 自動產生，不需要在程式碼裡手動產生：

```prisma
model Post {
  id String @id @default(uuid())  // ← PostgreSQL 在 INSERT 時自動產生 UUID
}
```

**前台 controller 如何轉換：**

```typescript
// Service 回傳完整的 Post（含 updatedAt）
// Controller 用解構賦值過濾掉不該給前台的欄位
const { updatedAt, ...publicPost } = post;
return publicPost; // 型別剛好符合 PublicPost
```

這樣的好處是：**Service 邏輯完全不用動**，只在 Controller 層控制「要給前台看哪些欄位」。

---

### 6.2 [services/postsService.ts](../src/services/postsService.ts) — 業務邏輯

所有 Service 現在都是 **Prisma（非同步）版本**，直接操作 PostgreSQL：

```typescript
export class PostsService {
  // 所有方法都是 async，回傳 Promise
  async getAll(): Promise<Post[]> {
    return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  }

  async getById(id: string): Promise<Post | undefined> {
    const post = await prisma.post.findUnique({ where: { id } });
    return post ?? undefined;
  }

  async create(dto: CreatePostDto): Promise<Post> {
    return prisma.post.create({ data: dto });
    // Prisma 自動處理：uuid() → id、now() → createdAt、@updatedAt → updatedAt
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post | undefined> {
    try {
      return await prisma.post.update({ where: { id }, data: dto });
    } catch {
      return undefined; // Prisma P2025：找不到 id 時 throw，統一回傳 undefined
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.post.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
```

**為什麼要把邏輯放在 Service，不直接寫在 Controller？**

分離關注點（Separation of Concerns）：
- Controller 只管「收請求、回應」
- Service 只管「怎麼處理資料」

好處：之後要換資料庫或 ORM 時，只需要改 Service，Controller 完全不用動。

---

### 6.3 [controllers/](../src/controllers/) — API 端點

Controllers 分成兩個子資料夾，用 `@Route` 的路徑前綴來區分前後台：

```typescript
// controllers/public/postsController.ts — 前台（只讀）
// @Route 只寫 "public/posts"，不含 api/ 前綴
// /api 前綴由 app.ts 的 app.use(API_PREFIX, apiRouter) 統一加上
@Route("public/posts")
@Tags("Public - Posts")
export class PublicPostsController extends Controller {
  // 只有 GET，沒有 POST / PUT / DELETE
}

// controllers/admin/postsController.ts — 後台（完整 CRUD）
@Route("admin/posts")
@Tags("Admin - Posts")
export class AdminPostsController extends Controller {
  // GET + POST + PUT + DELETE 全部都有
}
```

**Decorator 速查表：**

| Decorator | 說明 |
|-----------|------|
| `@Route("admin/posts")` | 設定這個 Controller 的路徑（不含 `/api` 前綴，前綴由 `app.ts` + `tsoa.json` 負責） |
| `@Tags("Admin - Posts")` | Swagger 分組標籤（決定文件裡的分類名稱） |
| `@Get()` / `@Post()` / `@Put()` / `@Delete()` | HTTP 方法 |
| `@Path()` | 從 URL 路徑取得參數，e.g. `{id}` → `req.params.id` |
| `@Body()` | 從 request body 取得資料，Tsoa 自動驗證格式 |
| `@SuccessResponse(201, ...)` | 宣告成功時的 HTTP 狀態碼 |
| `@Response(404, ...)` | 宣告可能的錯誤狀態碼（供 Swagger 文件顯示） |

---

### 6.4 [middleware/auth.ts](../src/middleware/auth.ts) — 後台驗證

```typescript
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;   // ← return 很重要！阻止繼續往下執行
  }
  // 有 token → 呼叫 next()，讓請求繼續到 Controller
  next();
}
```

目前只檢查 token 是否存在，之後換成真正的 JWT 驗證：

```typescript
import jwt from "jsonwebtoken";
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

---

### 6.5 [app.ts](../src/app.ts) — Express 應用程式

```typescript
export const app: Application = express();

app.use(cors({ origin: "http://localhost:4200" })); // 允許 Angular dev server 跨域
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // 讓 /swagger.json 可透過 HTTP 存取

// Swagger UI — 互動式測試介面
const swaggerPath = path.join(__dirname, "../public/swagger.json");
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ReDoc — 美觀的閱讀型 API 文件
app.get("/redoc", redoc({ title: "Angular Blog API", specUrl: "/swagger.json" }));

// API 路由：/api 前綴統一在這裡定義一次（改前綴需同步改 tsoa.json 的 basePath）
const API_PREFIX = "/api";
const apiRouter = express.Router();

// ⚠️ 順序重要：authMiddleware 必須在 RegisterRoutes 之前
apiRouter.use("/admin", authMiddleware); // 後台路由保護

RegisterRoutes(apiRouter); // Tsoa 產生的路由（public + admin 都在這裡）

app.use(API_PREFIX, apiRouter);

app.use((_req: Request, res: Response) => res.status(404).json({ message: "Not Found" }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: err.message || "Internal Server Error" });
});
```

**什麼是 Middleware？**

Middleware 就是「請求到達最終處理函式之前，中途要經過的處理步驟」。
類比：像是快遞到你手上之前，會先經過分揀中心、再到區域配送站。

Express 的 middleware **按照 `app.use()` 的順序執行**，這就是為什麼 `authMiddleware` 一定要放在 `RegisterRoutes` 之前。

---

### 6.6 [server.ts](../src/server.ts) — 啟動入口

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

## 7. 設定檔說明

### 7.1 [tsconfig.json](../tsconfig.json)

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

### 7.2 [tsoa.json](../tsoa.json)

```json
{
  "entryFile": "src/app.ts",                           // Tsoa 從哪個檔案開始分析
  "noImplicitAdditionalProperties": "throw-on-extras", // 收到多餘欄位時直接報錯（防止前端送垃圾資料）
  "controllerPathGlobs": ["src/controllers/**/*.ts"],  // 去哪裡找 Controller 檔案
  "spec": {
    "outputDirectory": "public",   // swagger.json 要放在哪裡
    "specVersion": 3,              // 使用 OpenAPI 3.0 規格
    "basePath": "/api",            // Swagger UI 顯示的 URL 前綴（要與 app.ts 的 API_PREFIX 保持一致）
    "info": { ... }                // API 文件的基本資訊
  },
  "routes": {
    "routesDir": "src"             // routes.ts 要放在哪裡
  }
}
```

**`basePath` 是什麼？**

`basePath: "/api"` 會寫進自動產生的 `swagger.json`，告訴 Swagger UI「所有 API 的 URL 前面都要加 `/api`」。

沒有它：Swagger UI 顯示 `/public/posts`（實際打過去會 404）
有了它：Swagger UI 顯示 `/api/public/posts`（正確的完整路徑）

這個值要和 `app.ts` 裡的 `API_PREFIX = "/api"` **保持一致**。
如果之後要改 API 前綴（例如改成 `/v2`），需要同步改兩個地方：
- `app.ts` → `const API_PREFIX = "/v2"`
- `tsoa.json` → `"basePath": "/v2"`

---

## 8. Tsoa 是什麼？它幫了什麼？

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

## 9. Prisma 是什麼？它幫了什麼？

**Prisma 是一個 ORM（Object-Relational Mapping）工具**，白話說就是：讓你用 TypeScript 操作資料庫，不用自己寫 SQL。

**前端類比：**
`HttpClient` 讓你不用自己處理 `fetch` 的底層細節，直接呼叫 `http.get<Post[]>('/api/posts')` 就能拿到型別安全的資料。
Prisma 做的事情一樣：讓你不用自己寫 SQL，直接呼叫 `prisma.post.findMany()` 就能拿到型別安全的資料。

---

### 沒有 Prisma vs 有 Prisma

**沒有 Prisma（手寫 SQL）：**

```typescript
const result = await db.query('SELECT * FROM "Post" WHERE id = $1', [id]);
const post = result.rows[0]; // 型別是 any，IDE 不知道 post 長什麼樣
```

**有 Prisma（現在的做法）：**

```typescript
const post = await prisma.post.findUnique({ where: { id } });
// post 的型別自動是 Post | null，有完整 autocomplete，型別安全
```

---

### Prisma 幫你做了四件事

#### 1. 定義資料庫結構 — `prisma/schema.prisma`

Schema 是整個 Prisma 的核心，「告訴 Prisma 資料庫長什麼樣子」：

```prisma
model Post {
  id        String   @id @default(uuid())   // 主鍵，PostgreSQL INSERT 時自動產生 UUID
  title     String                          // 必填文字欄位（NOT NULL）
  content   String
  author    String
  createdAt DateTime @default(now())        // 建立時間，INSERT 時自動填入
  updatedAt DateTime @updatedAt             // 更新時間，Prisma 每次 UPDATE 自動維護
}
```

Schema 是 **唯一的事實來源（Single Source of Truth）**：
- 資料庫結構從這裡定義
- TypeScript 型別也從這裡產生
- 不需要另外維護一份 SQL DDL

#### 2. 自動產生 TypeScript 型別 — `@prisma/client`

執行 `prisma generate`（migrate 後會自動執行）後，Prisma 根據 schema 產生對應的 TypeScript 型別，存在 `node_modules/@prisma/client`。

這就是為什麼 `postsService.ts` 可以直接 import `PrismaClient` 並得到完整的型別推導，不需要自己手寫 interface。

#### 3. 管理資料庫變更 — Migration

要修改資料庫結構（例如新增一個欄位）時，**不能直接去改 PostgreSQL**，要走 migration 流程：

```
1. 修改 prisma/schema.prisma（例如在 Post 加一個 tags 欄位）
2. 執行：npx prisma migrate dev --name add_tags_to_post
3. Prisma 自動比對新舊 schema，產生對應的 SQL 檔案
4. Prisma 自動把 SQL 套用到 PostgreSQL
```

產生的 SQL 會存在 `prisma/migrations/` 資料夾，例如：

```sql
-- prisma/migrations/20260413134045_init/migration.sql
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    ...
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
```

這個資料夾是 **資料庫變更的歷史記錄**，不要手動修改，要 commit 進 git。

#### 4. 執行查詢 — Prisma Client

實際在程式執行時，Prisma Client 把你的 TypeScript 呼叫翻譯成 SQL 送給 PostgreSQL：

| TypeScript（你寫的） | 翻譯成的 SQL（Prisma 幫你寫） |
|---|---|
| `prisma.post.findMany()` | `SELECT * FROM "Post"` |
| `prisma.post.findUnique({ where: { id } })` | `SELECT * FROM "Post" WHERE id = $1` |
| `prisma.post.create({ data: dto })` | `INSERT INTO "Post" (...) VALUES (...)` |
| `prisma.post.update({ where: { id }, data: dto })` | `UPDATE "Post" SET ... WHERE id = $1` |
| `prisma.post.delete({ where: { id } })` | `DELETE FROM "Post" WHERE id = $1` |

開發時你可以在終端機看到每條實際執行的 SQL（`src/lib/prisma.ts` 的 `log: ["query"]` 設定）。

---

### Prisma Client 為什麼要做成單例？ — `src/lib/prisma.ts`

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ["query", "error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Node.js 開發時，每次存檔 hot-reload 都會重新 import 這個檔案。
如果直接 `new PrismaClient()`，每次 reload 就會建立一個新的資料庫連線，最終超過 PostgreSQL 的連線數上限。
把 instance 存在 `globalThis` 上，reload 後就能複用同一個連線。

---

### 常用 Prisma 指令

| 指令 | 做什麼 | 什麼時候用 |
|------|--------|-----------|
| `npx prisma migrate dev --name <描述>` | 比對 schema 差異，產生 SQL migration 檔並套用到 DB | 改了 `schema.prisma` 之後 |
| `npx prisma generate` | 重新產生 `@prisma/client` TypeScript 型別 | migrate 後會自動執行，通常不需手動 |
| `npx prisma studio` | 開啟瀏覽器視覺化資料庫管理介面 | 想直接查看或修改資料時 |
| `npx prisma db push` | 直接把 schema 同步到 DB（不產生 migration 檔） | 快速實驗用，正式環境不推薦 |

---

## 10. API 文件工具：Swagger UI vs ReDoc

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

## 11. HTTP 狀態碼對照表

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

## 12. 開發指令說明

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

## 13. 接下來可以做什麼

按照難度排序：

1. **接資料庫** ← 已完成
   - PostgreSQL 跑在 Docker（port 5432），詳見 [DOCKER_POSTGRES.md](DOCKER_POSTGRES.md)
   - Prisma migration 已執行，`Post`、`Tag`、`Banner` 三張資料表已建立
   - 所有 Service 已全面換成 Prisma DB 版本

2. **升級 Auth 為真正的 JWT 驗證** ← middleware 架構已建好
   - 安裝 `jsonwebtoken`
   - 修改 `src/middleware/auth.ts`，換成 `jwt.verify()`
   - 新增登入 API（`POST /api/public/auth/login`），成功後回傳 JWT token

3. **新增其他資源**
   - 仿照 posts / tags / banner，詳見 [new-resource.md](new-resource.md)

4. **環境設定** ← 已完成
   - `.env` 已建立，`DATABASE_URL`、`PORT` 皆從環境變數讀取

---

> 有任何問題都可以問，這份文件會隨著專案成長持續更新。
