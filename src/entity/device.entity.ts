/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ImageDevice } from './image_device.entity';
import { Category } from './category.entity';

@Entity()
export class Device {
    @PrimaryGeneratedColumn('uuid')
    DEVICE_ID: number;

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

    @Column({ type: 'text', nullable: true })
    INFO: string;

    @Column({ nullable: true })
    BUY_DATE: string;

    @Column({ type: 'text', nullable: true })
    NOTE: string;

    @Column({ nullable: true })
    EXPIRATION_DATE: string; //thời gian hết hạn bảo hành

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


    @OneToMany(() => ImageDevice, (image) => image.IMAGE_ID)
    images: ImageDevice[];

    @Column({ nullable: true })
    categoryID: string;

    @ManyToOne(() => Category, (category) => category.devices)
    @JoinColumn({ name: 'categoryID', referencedColumnName: 'categoryID' })
    category: Category;
}
