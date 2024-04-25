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
  
  @Column({ nullable: true })
  departmentID: string;

  @Column()
  level: number;

  @OneToMany(() => Order, (order) => order.status)
  orders: Order[];
}
// start level == 1
//lay ra bản ghi , có status , userID = userID và order của bản thân
//chi tinh thi sao?
// người duyệt cuối -> mrs.tinh
