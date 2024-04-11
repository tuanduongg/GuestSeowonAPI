/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  unitID: string;

  @Column()
  unitName: string;

  @OneToMany(() => Product, (Product) => Product.unit)
  products: Product[];
}
