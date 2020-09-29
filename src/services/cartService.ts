import { CartItem } from "../entities/CartItems";
import { Item } from "../entities/Item";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { selectFields } from "express-validator/src/select-fields";
import itemService from "./itemService";
import { QueryBuilder } from "typeorm";

class CartService {
  create(): Promise<Cart> {
    return Cart.create().save();
  }

  async getCart(userId: number): Promise<Cart> {
    const user = await User.findOne(userId, { relations: ["cart"] });
    return user!.cart;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    const cartItems = await CartItem.createQueryBuilder("cartitem")
      .select(["cartitem.quantity", "cartitem.item"])
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select("user.id")
          .from(User, "user")
          .where("user.id = :userId")
          .getQuery();
        return '"cartId" = ' + sub;
      })
      .setParameter("userId", userId)
      .leftJoin("cartitem.item", "item")
      .addSelect(itemService.itemSelect)
      .getMany();
    return cartItems;
  }

  getIndexOfItemInCart(cart: Cart, { item }: { item: Item }): number {
    for (let i = 0; i < cart.cartItems.length; i++) {
      if (cart.cartItems[i].itemId == item.id) {
        return i;
      }
    }
    return -1;
  }

  async setCartItem(
    cart: Cart,
    { item, quantity = 1 }: { item: Item; quantity?: number }
  ) {
    const index = this.getIndexOfItemInCart(cart, { item });

    if (index == -1) {
      const cartItem = await CartItem.create({ item, quantity, cart }).save();
      cart.cartItems.push(cartItem);
      await cart.save();
      return;
    }
    cart.cartItems[index].quantity = quantity;
    await cart.cartItems[index].save();
    return;
  }

  async deleteCartItem(cart: Cart, { item }: { item: Item }) {
    return await CartItem.delete({ cart, item });
  }
}

export default new CartService();
