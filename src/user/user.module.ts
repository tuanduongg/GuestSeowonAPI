import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { Permisstion } from 'src/entity/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ListAPI, Permisstion])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
