/* eslint-disable prettier/prettier */
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceLicense } from './device_license.entity';

@Entity()
export class License {
  @PrimaryGeneratedColumn('uuid')
  LICENSE_ID: string;

  @Column()
  LICENSE_NAME: string;

  @OneToMany(() => DeviceLicense, (ref) => ref.lincense, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  deviceLicense: DeviceLicense[];
}
