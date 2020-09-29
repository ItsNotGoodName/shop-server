import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./Cart";
import { Item } from "./Item";
@Entity()
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  @Column()
  itemId: number;

  @ManyToOne(() => Item)
  @JoinColumn()
  item: Item;

  @Column()
  cartId: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart: Cart;
}
