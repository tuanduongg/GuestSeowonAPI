/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Device } from './device.entity';
import { DeviceLicense } from './device_license.entity';

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
  @Column()
  LICENSE_NOTE: string;
  @Column()
  LICENSE_PRICE: string;
}
