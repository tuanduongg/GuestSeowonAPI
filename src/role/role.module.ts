import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entity/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permisstion, ListAPI]),UserModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
