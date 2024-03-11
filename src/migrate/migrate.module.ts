import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { MigrateController } from './migrate.controller';
import { MigrateService } from './migrate.service';
import { ListAPI } from 'src/entity/listapi.entity';
import { Permisstion } from 'src/entity/permission.entity';
import { Role } from 'src/entity/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ListAPI, Permisstion, Role])],
  controllers: [MigrateController],
  providers: [MigrateService],
  exports: [MigrateService],
})
export class MigrateModule {}
