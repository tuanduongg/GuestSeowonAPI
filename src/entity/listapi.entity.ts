/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ListAPI {
  @PrimaryGeneratedColumn('uuid')
  LISTAPI_ID: string;

  @Column()
  LISTAPI_NAME: string;

  @Column()
  SCREEN: string;

  @Column({ nullable: true })
  TYPE: string;
}
