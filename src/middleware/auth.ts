import { Request, Response, NextFunction } from "express";

/**
 * 後台路由的身份驗證 middleware
 * 目前只檢查 Authorization header 是否存在，
 * 之後換成真正的 JWT 驗證：jwt.verify(token, process.env.JWT_SECRET!)
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  // TODO: 換成 JWT 驗證
  // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  // (req as any).user = decoded;
  next();
}
