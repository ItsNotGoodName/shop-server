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
import { Item } from "./Item";
import ColumnNumericTransformer from "../utils/ColumnNumericTransforme";
import { Cart } from "./Cart";

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

  @Column("numeric", {
    scale: 2,
    default: 0,
    transformer: ColumnNumericTransformer,
  })
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
