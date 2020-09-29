import { CartItem } from "../entities/CartItems";
import { Item } from "../entities/Item";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";

class CartService {
  create(): Promise<Cart> {
    return Cart.create().save();
  }

  async getCart(userId: number): Promise<Cart> {
    const user = await User.findOne(userId, { relations: ["cart"] });
    return user!.cart;
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
