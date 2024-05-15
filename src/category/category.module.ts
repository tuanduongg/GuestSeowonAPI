import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from 'src/entity/category.entity';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category,ListAPI,Permisstion]),UserModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
