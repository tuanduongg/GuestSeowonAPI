/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Permisstion } from './permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  ROLE_ID: string;

  @Column({ unique: true })
  ROLE_NAME: string;

  @CreateDateColumn({ type: 'datetime' })
  CREATE_AT: Date;

  @UpdateDateColumn({ type: 'datetime' })
  UPDATE_AT: Date;

  @Column({ nullable: true })
  CREATE_BY: string;

  @Column({ nullable: true })
  UPDATE_BY: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(() => Permisstion, (permisstion) => permisstion.role)
  permisstions: Permisstion[];

}
