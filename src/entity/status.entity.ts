/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class Status {
  @PrimaryGeneratedColumn('uuid')
  statusID: string;

  @Column()
  statusName: string;

  @Column({ nullable: true })
  userID: string;

  @Column()
  level: number;

  @OneToMany(() => Order, (order) => order.status)
  orders: Order[];
}
