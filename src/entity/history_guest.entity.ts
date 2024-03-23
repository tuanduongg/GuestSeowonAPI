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
export class HistoryGuest {
  @PrimaryGeneratedColumn('uuid')
  HISTORY_ID: string;

  @Column()
  TYPE: string;
  
  @Column()
  VALUE: string;

  @Column({ type: 'datetime' })
  TIME: Date;

  @Column()
  USER: string;

  @ManyToOne(() => Guest, (guest) => guest.histories)
  @JoinColumn({ name: 'GUEST_ID', referencedColumnName: 'GUEST_ID' })
  guest: Guest;
}
