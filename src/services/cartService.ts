import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItems";
import { Item } from "../entities/Item";
import { User } from "../entities/User";
import itemService from "./itemService";

class CartService {
  cartSelect: string[];
  constructor() {
    this.cartSelect = ["cart.total"];
  }
  create(): Promise<Cart> {
    return Cart.create().save();
  }

  async getCart(userId: number): Promise<Cart | undefined> {
    return Cart.createQueryBuilder("cart")
      .select(this.cartSelect)
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('"cartId"')
          .from(User, "user")
          .where("user.id = :userId")
          .getQuery();
        return "cart.id = " + sub;
      })
      .leftJoin("cart.cartItems", "cartItems")
      .addSelect("cartItems.quantity")
      .leftJoin("cartItems.item", "item")
      .addSelect(itemService.itemSelect)
      .setParameter("userId", userId)
      .getOne();
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    const cartItems = await CartItem.createQueryBuilder("cartitem")
      .select(["cartitem.quantity"])
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
      .orderBy("cartitem.createdAt", "ASC")
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

  calculateCart(cartItems: CartItem[]) {
    let total = 0;
    for (let i = 0; i < cartItems.length; i++) {
      total += cartItems[i].quantity * cartItems[i].item.price;
    }
    return total;
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
