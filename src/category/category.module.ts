import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from 'src/entity/category.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]),UserModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
