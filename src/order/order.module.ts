import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from 'src/entity/order.entity';
import { OrderDetail } from 'src/entity/order_detail.entity';
import { Status } from 'src/entity/status.entity';
import { Product } from 'src/entity/product.entity';
import { ProductModule } from 'src/product/product.module';
import { Department } from 'src/entity/department.entity';
import { StatusModule } from 'src/status/status.module';
import { DepartmentModule } from 'src/department/department.module';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, Status, Product, Department,ListAPI,Permisstion]),
    StatusModule,
    ProductModule,
    DepartmentModule,
    UserModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
