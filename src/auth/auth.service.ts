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
    console.log('user', user);
    console.log(
      '(await bcrypt.compare(pass, user.PASSWORD))',
      await bcrypt.compare(pass, user.PASSWORD),
    );
    if (user && (await bcrypt.compare(pass, user.PASSWORD))) {
      const payload = {
        username: user.USERNAME,
        id: user.USER_ID,
        role: user.role,
        email: user.EMAIL,
      };
      return {
        user: payload,
        accessToken: await this.jwtService.signAsync(payload),
      };
    }
    return null;
  }
}
