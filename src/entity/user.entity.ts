/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Department } from './department.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  USER_ID: string;

  @Column({ unique: true })
  USERNAME: string;

  @Column()
  PASSWORD: string;

  @Column({ nullable: true })
  EMAIL: string;

  @CreateDateColumn({ type: 'datetime' })
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

  @Column({ nullable: true, default: true })
  ACTIVE: boolean;

  @Column({ nullable: true, type: 'text' })
  TOKEN: string;

  @Column({ nullable: true, default: false })
  IS_ACCEPTER_ORDER: boolean; //người duyệt order cuối cùng

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'ROLE_ID', referencedColumnName: 'ROLE_ID' })
  role: Role;

  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'departmentID', referencedColumnName: 'departID' })
  department: Department;
}
