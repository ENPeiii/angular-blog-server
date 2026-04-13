import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";
import { RegisterRoutes } from "./routes";
import { authMiddleware } from "./middleware/auth";
import * as fs from "fs";
import * as path from "path";

export const app: Application = express();

app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 讓 /swagger.json 可以透過 HTTP 存取（ReDoc 需要一個公開的 spec URL）
app.use(express.static(path.join(__dirname, "../public")));

// Swagger UI — 互動式測試介面
const swaggerPath = path.join(__dirname, "../public/swagger.json");
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ReDoc — 美觀的閱讀型 API 文件
app.get(
  "/redoc",
  redoc({
    title: "Angular Blog API",
    specUrl: "/swagger.json",
    redocOptions: {
      theme: {
        colors: { primary: { main: "#dd4b39" } },
        typography: { fontSize: "15px", fontFamily: "Inter, sans-serif" },
      },
    },
  })
);

// 後台路由保護：所有 /api/admin/* 都需要通過 auth 驗證
app.use("/api/admin", authMiddleware);

// Tsoa generated routes
RegisterRoutes(app);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;
