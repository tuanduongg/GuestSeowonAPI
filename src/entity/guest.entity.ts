/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { STATUS_ENUM } from '../enum/status.enum';
import { GuestInfo } from './guest_info.entity';
import { GuestDate } from './guest_date.entity';

@Entity()
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  GUEST_ID: string;

  @Column()
  TIME_IN: string;

  @Column()
  TIME_OUT: string;

  @Column()
  COMPANY: string;

  @Column({ nullable: true })
  CAR_NUMBER: string;

  @Column({ nullable: true })
  PERSON_SEOWON: string;

  @Column({ nullable: true })
  DEPARTMENT: string;

  @Column({ nullable: true })
  REASON: string;

  @Column({ default: STATUS_ENUM.NEW })
  STATUS: string;

  //admin,security,user

  @CreateDateColumn({ type: 'datetime', name: 'CREATE_AT' })
  CREATE_AT: Date;

  @Column({ type: 'datetime', nullable: true })
  UPDATE_AT: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  DELETE_AT: Date;

  @Column({ nullable: true })
  CREATE_BY: string;

  @Column({ nullable: true })
  UPDATE_BY: string;

  @Column({ nullable: true })
  DELETE_BY: string;

  @OneToMany(() => GuestInfo, (guest_info) => guest_info.guest, {
    cascade: ['insert', 'update'],
  })
  guest_info: GuestInfo[];

  @OneToMany(() => GuestDate, (guest_date) => guest_date.guest, {
    cascade: ['insert', 'update'],
  })
  guest_date: GuestDate[];
}
