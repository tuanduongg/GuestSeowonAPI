/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity()
export class ImageDevice {
  @Column({ primary: true, generated: 'uuid' })
  IMAGE_ID: string;

  @Column()
  URL: string;

  @Column({ nullable: true })
  TITLE: string;

  @Column({ default: true })
  IS_SHOW: boolean;

  @ManyToOne(() => Device, (ref) => ref.images)
  @JoinColumn({ name: 'DEVICE_ID', referencedColumnName: 'DEVICE_ID'})
  device: Device;
}
