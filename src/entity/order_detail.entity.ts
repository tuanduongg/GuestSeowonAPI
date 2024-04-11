/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderDetail {
  
  @PrimaryGeneratedColumn('uuid')
  orderDetailID: string;

  @Column()
  orderID: string;

  @Column()
  productID: string;

  @Column()
  price: string;

  @Column()
  quantity: number;

  @Column()
  unit: string;

  // @ManyToOne(() => Order, (order) => order.orderDetail)
  // @JoinColumn({ name: 'orderID', referencedColumnName: 'orderID' })
  // order: Order;
  @ManyToOne(() => Order, (order) => order.orderDetail)
  @JoinColumn({ name: 'orderID', referencedColumnName: 'orderID' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderDetail)
  @JoinColumn({ name: 'productID', referencedColumnName: 'productID' })
  product: Product;
}
