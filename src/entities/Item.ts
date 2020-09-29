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
import { User } from "./User";
import ColumnNumericTransformer from "../utils/ColumnNumericTransforme";
import { Photo } from "./Photo";
@Entity()
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("numeric", { scale: 2, transformer: ColumnNumericTransformer })
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
