/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity()
export class License {
  @Column({ primary: true, generated: 'uuid' })
  LICENSE_ID: string;
  
  @Column()
  LICENSE_NAME: string;
  
  @Column()
  LICENSE_START_DATE: string;
  
  @Column()
  LICENSE_END_DATE: string;

  @Column()
  LICENSE_TYPE: string; // VĨNH VIỄN - CÓ HẠN


  @ManyToOne(() => Device, (Device) => Device.licenses)
  @JoinColumn({ name: 'deviceID', referencedColumnName: 'DEVICE_ID'})
  device: Device;
}
