/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';

@Entity()
export class GuestDate {
  @PrimaryGeneratedColumn('uuid')
  DATE_ID: string;

  @Column()
  DATE: string;

  @ManyToOne(() => Guest, (guest) => guest.guest_date)
  @JoinColumn({ name: 'GUEST_ID', referencedColumnName: 'GUEST_ID' })
  guest: Guest;
}
