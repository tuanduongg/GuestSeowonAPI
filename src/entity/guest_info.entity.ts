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
export class GuestInfo {
  @PrimaryGeneratedColumn('uuid')
  NAME_ID: string;

  @Column()
  FULL_NAME: string;

  @ManyToOne(() => Guest, (guest) => guest.guest_info)
  @JoinColumn({ name: 'GUEST_ID', referencedColumnName: 'GUEST_ID' })
  guest: Guest;
}
