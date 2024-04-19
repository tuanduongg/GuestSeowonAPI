import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from 'src/entity/image.entity';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image]),UserModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
