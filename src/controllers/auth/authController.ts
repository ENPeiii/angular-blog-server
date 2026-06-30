import { Body, Controller, Post, Route, Tags } from "tsoa";
import { AuthService } from "../../services/authService";
import { GoogleLoginDto, AuthResponse } from "../../models/auth";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  private authService = new AuthService();

  /**
   * 使用 Google ID Token 登入後台，成功後回傳 JWT
   */
  @Post("/google")
  public async googleLogin(@Body() body: GoogleLoginDto): Promise<AuthResponse> {
    const token = await this.authService.googleLogin(body.credential);
    return { token };
  }
}
