/* eslint-disable prettier/prettier */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid')
    USER_ID: string;
  
    @Column({ unique: true })
    USERNAME: string;
  
    @Column()
    PASSWORD: string;
  
    //admin,security,user
    @Column({ default: false }) 
    ROLE: string;
  
    @Column({ nullable: true })
    EMAIL: string;
  
    @CreateDateColumn({ type: 'datetime' })
    CREATE_AT: Date;

    @Column({ type: 'datetime',nullable: true  })
    UPDATE_AT: Date;
  
    @DeleteDateColumn({ type: 'datetime', nullable: true })
    DELETE_AT: Date;
  
    @Column({ nullable: true })
    CREATE_BY: string;

    @Column({ nullable: true })
    UPDATE_BY: string;
  
    @Column({ nullable: true })
    DELETE_BY: string;
  //   @OneToMany(() => Image, (image) => image.product)
  // images: Image[];

  }
  