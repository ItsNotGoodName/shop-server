import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MONEY_COLUMN_OPTION } from "../constants";
import { Item } from "./Item";
import { User } from "./User";
@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("numeric", { ...MONEY_COLUMN_OPTION, nullable: false })
  paid: number;

  @Column({ nullable: false })
  quantity: number;

  // 0 : UNKNOWN, 1 : DELIVERED, ...
  @Column({ default: 0 })
  status: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, { eager: true })
  @JoinColumn()
  item: Item;

  @Column({ type: "date", default: null })
  deliveryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
