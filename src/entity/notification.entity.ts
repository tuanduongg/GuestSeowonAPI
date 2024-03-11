/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  NOTIFI_ID: string;

  @Column({ nullable: true })
  USERNAME: string;

  @Column({ nullable: true })
  ENDPOINT: string;

  @Column({ nullable: true })
  EXPIRATION_TIME: string;

  @Column({ nullable: true })
  P256DH: string;

  @Column({ nullable: true })
  AUTH: string;

  @CreateDateColumn({ type: 'datetime' })
  CREATE_AT: Date;
}
