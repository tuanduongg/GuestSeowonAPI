/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Device } from './device.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  categoryID: string;

  @Column()
  categoryName: string;

  @Column({ nullable: true })
  categoryType: string;

  @OneToMany(() => Product, (Product) => Product.category)
  products: Product[];
  @OneToMany(() => Device, (ref) => ref.category)
  devices: Device[];
}
