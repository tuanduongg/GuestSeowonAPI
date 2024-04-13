import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from 'src/entity/product.entity';
import { Image } from 'src/entity/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Image])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
