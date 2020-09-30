import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MONEY_COLUMN_OPTION } from "../constants";
import { Cart } from "./Cart";
import { Item } from "./Item";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column("numeric", MONEY_COLUMN_OPTION)
  balance: number;

  @OneToMany(() => Item, (item) => item.sellor)
  items: Item[];

  @Column()
  cartId: number;

  @OneToOne(() => Cart)
  @JoinColumn()
  cart: Cart;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
