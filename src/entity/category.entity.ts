/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  categoryID: string;

  @Column()
  categoryName: string;

  @OneToMany(() => Product, (Product) => Product.category)
  products: Product[];
}
