import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from 'src/entity/product.entity';
import { Image } from 'src/entity/image.entity';
import { UserModule } from 'src/user/user.module';
import { ListAPI } from 'src/entity/listapi.entity';
import { Permisstion } from 'src/entity/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Image, ListAPI
    , Permisstion]), UserModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }
