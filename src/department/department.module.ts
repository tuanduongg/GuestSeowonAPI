import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentService } from './deparment.service';
import { Department } from 'src/entity/department.entity';
import { DepartmentController } from './department.controller';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department,ListAPI,Permisstion]), UserModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
