/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';
import { License } from './license.entity';

@Entity()
export class DeviceLicense {
  @Column({ primary: true, generated: 'uuid' })
  DEVICE_LICENSE_ID: string;

  @Column()
  DEVICE_ID: string;
  @Column()
  LICENSE_ID: string;
}
