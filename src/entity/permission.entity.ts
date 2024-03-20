/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permisstion {
  @PrimaryGeneratedColumn('uuid')
  PREMISSTION_ID: string;

  @Column()
  SCREEN: string;
  @Column({ nullable: true })
  ROLE: string;

  @Column()
  IS_READ: boolean;
  @Column({ nullable: true })
  IS_CREATE: boolean;
  @Column({ nullable: true })
  IS_UPDATE: boolean;
  @Column({ nullable: true })
  IS_DELETE: boolean;
  @Column({ nullable: true })
  IS_IMPORT: boolean;
  @Column({ nullable: true })
  IS_EXPORT: boolean;
  @Column({ nullable: true })
  IS_ACCEPT: boolean;

  @ManyToOne(() => Role, (role) => role.permisstions)
  @JoinColumn({ name: 'ROLE', referencedColumnName: 'ROLE_ID' })
  role: Role;
}
