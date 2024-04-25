import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.PASSWORD))) {
      const payload = {
        username: user.USERNAME,
        id: user.USER_ID,
        role: user.role,
        department: user?.department,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      await this.userService.saveToken(accessToken, user);
      return {
        user: payload,
        accessToken: accessToken,
      };
    }
    return null;
  }
}
