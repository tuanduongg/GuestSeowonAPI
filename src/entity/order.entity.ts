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
import { OrderDetail } from './order_detail.entity';
import { Status } from './status.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  orderID: string;

  @Column({ unique: true })
  code: string;

  @Column()
  userID: string;

  @Column({ nullable: true })
  departmentID: string;

  @Column({ nullable: true })
  total: string;

  @Column()
  reciever: string;

  @Column()
  address: string;
  @Column()
  note: string;

  @Column({ nullable: true })
  statusID: string;

  @Column({ default: null })
  cancel_at: Date;

  @Column({ default: null })
  cancel_by: string;

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

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetail: OrderDetail[];

  @ManyToOne(() => Status, (status) => status.orders)
  @JoinColumn({ name: 'statusID', referencedColumnName: 'statusID' })
  status: Status;
}
