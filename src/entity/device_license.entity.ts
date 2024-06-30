/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from 'typeorm';
import { Device } from './device.entity';
import { License } from './license.entity';

@Entity()
export class DeviceLicense {

  @PrimaryGeneratedColumn('uuid')
  DEVICE_LICENSE_ID: string;

  @Column({ nullable: true })
  LICENSE_KEY: string;

  @Column({ nullable: true })
  LICENSE_START_DATE: string;

  @Column({ nullable: true })
  LICENSE_END_DATE: string;

  @Column({ nullable: true })
  LICENSE_TYPE: string; // VĨNH VIỄN(FOREVER) - CÓ HẠN(LIMIT)
  
  @Column({ nullable: true })
  LICENSE_NOTE: string;
  
  @Column({ nullable: true })
  LICENSE_PRICE: string;

  @ManyToOne(() => Device, (ref) => ref.deviceLicense)
  @JoinColumn({ name: 'DEVICE_ID', referencedColumnName: 'DEVICE_ID' })
  device: Device;

  @ManyToOne(() => License, (ref) => ref.deviceLicense)
  @JoinColumn({ name: 'LICENSE_ID', referencedColumnName: 'LICENSE_ID' })
  lincense: License;
}
