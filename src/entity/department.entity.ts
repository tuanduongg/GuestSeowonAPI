/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity()
export class Department {
  @PrimaryGeneratedColumn('uuid')
  departID: number;

  @Column()
  departName: string;
  
  @Column({nullable: true })
  departCode: string;

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  @OneToMany(() => Order, (order) => order.department)
  orders: Order[];
}
