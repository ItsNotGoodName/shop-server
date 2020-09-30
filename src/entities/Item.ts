import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MONEY_COLUMN_OPTION } from "../constants";
import { Photo } from "./Photo";
import { User } from "./User";
@Entity()
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("numeric", MONEY_COLUMN_OPTION)
  price: number;

  @Column()
  sellorId: number;

  @ManyToOne(() => User, (user) => user.items)
  sellor: User;

  @OneToMany(() => Photo, (photo) => photo.item)
  photos: Photo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
