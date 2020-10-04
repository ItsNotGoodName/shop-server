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
      .orderBy("cartItems.createdAt", "ASC")
      .leftJoin("cartItems.item", "item")
      .addSelect(itemService.itemSelect)
      .setParameter("userId", userId)
      .getOne();
  }

  getIndexOfItem(cart: Cart, { item }: { item: Item }): number {
    for (let i = 0; i < cart.cartItems.length; i++) {
      if (cart.cartItems[i].item.id == item.id) {
        return i;
      }
    }
    return -1;
  }

  calculateTotal(cart: Cart) {
    let total = 0;
    const { cartItems } = cart;
    for (let i = 0; i < cartItems.length; i++) {
      total += cartItems[i].quantity * cartItems[i].item.price;
    }
    return Cart.update({ id: cart.id }, { total });
  }

  async findByUserId(userId: number) {
    return Cart.createQueryBuilder("cart")
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('"cartId"')
          .from(User, "user")
          .where("user.id = :userId")
          .getQuery();
        return "cart.id = " + sub;
      })
      .leftJoinAndSelect("cart.cartItems", "cartItems")
      .leftJoinAndSelect("cartItems.item", "item")
      .setParameter("userId", userId)
      .getOne();
  }

  async findById(id: number) {
    return Cart.createQueryBuilder("cart")
      .where({ id })
      .leftJoinAndSelect("cart.cartItems", "cartItems")
      .leftJoinAndSelect("cartItems.item", "item")
      .getOne();
  }

  async setCartItem(
    cart: Cart,
    { item, quantity = 1 }: { item: Item; quantity?: number }
  ) {
    const index = this.getIndexOfItem(cart, { item });

    // delete if exists
    if (quantity == 0) {
      // it exists
      if (index != -1) {
        await CartItem.delete({ cart, item });
      }
    } else {
      // Create new cartItem
      if (index == -1) {
        await CartItem.create({ item, quantity, cart }).save();
      }
      // Update cartItem
      else {
        cart.cartItems[index].quantity = quantity;
        await cart.cartItems[index].save();
      }
    }
    await this.calculateTotal((await this.findById(cart.id)) as Cart);
    return;
  }

  async emptyCart(cart: Cart) {
    const clear = await CartItem.delete({ cart });
    await this.calculateTotal((await this.findById(cart.id)) as Cart);
    return clear;
  }
}

export default new CartService();
