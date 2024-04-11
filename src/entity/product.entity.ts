/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Image } from './image.entity';
import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { OrderDetail } from './order_detail.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  productID: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  price: string;

  @Column({ default: 0 })
  inventory: number;

  @Column({ type: 'nvarchar', nullable: true })
  description: string;

  @Column({ nullable: true })
  categoryID: string;

  @Column({ nullable: true })
  unitID: string;

  @Column()
  isShow: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  delete_at: Date;

  @Column({ nullable: true })
  deleted_by: string;

  @OneToMany(() => Image, (image) => image.product)
  images: Image[];

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryID', referencedColumnName: 'categoryID' })
  category: Category;

  @ManyToOne(() => Unit, (unit) => unit.products)
  @JoinColumn({ name: 'unitID', referencedColumnName: 'unitID' })
  unit: Unit;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
  orderDetail: OrderDetail[];
}
