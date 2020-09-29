import { BaseEntity, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "./CartItems";
@Entity()
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { eager: true })
  cartItems: CartItem[];
}
