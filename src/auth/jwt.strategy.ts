// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { JwtPayload } from './jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly authService: AuthService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'your_secret_key_here', // Replace with your secret key
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.authService.validateUserByPayload(payload);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }