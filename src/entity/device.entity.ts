/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ImageDevice } from './image_device.entity';
import { Category } from './category.entity';
import { License } from './license.entity';
import { DeviceLicense } from './device_license.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  DEVICE_ID: number;

  @Column({ nullable: true, default: null })
  DEVICE_CODE: string;

  @Column()
  NAME: string;

  @Column({ nullable: true })
  MODEL: string;

  @Column({ nullable: true })
  MANUFACTURER: string;

  @Column({ nullable: true })
  SERIAL_NUMBER: string;

  @Column({ nullable: true })
  MAC_ADDRESS: string;

  @Column({ nullable: true })
  PRICE: string;

  @Column({ nullable: true })
  STATUS: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  INFO: string;

  @Column({ type: 'datetime', nullable: true })
  BUY_DATE: Date;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  NOTE: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true, default: '' })
  LOCATION: string;

  @Column({ type: 'datetime', nullable: true })
  EXPIRATION_DATE: Date; //thời gian hết hạn bảo hành

  @Column({ nullable: true })
  USER_CODE: string;

  @Column({ nullable: true })
  USER_FULLNAME: string;

  @Column({ nullable: true })
  USER_DEPARTMENT: string;

  @Column({ nullable: true })
  IP_ADDRESS: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
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

  @OneToMany(() => ImageDevice, (image) => image.device, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: ImageDevice[];

  @Column({ nullable: true })
  categoryID: string;

  @ManyToOne(() => Category, (category) => category.devices)
  @JoinColumn({ name: 'categoryID', referencedColumnName: 'categoryID' })
  category: Category;
}
