import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AppError } from "../lib/errors";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  async googleLogin(credential: string): Promise<string> {
    let email: string;
    let name: string;

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) throw new Error();
      email = payload.email;
      name = payload.name ?? "";
    } catch {
      throw new AppError(401, "Invalid Google credential");
    }

    if (email !== process.env.ADMIN_EMAIL) {
      throw new AppError(403, "Access denied");
    }

    return jwt.sign({ sub: email, name }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }
}
