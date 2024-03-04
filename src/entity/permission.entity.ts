/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
