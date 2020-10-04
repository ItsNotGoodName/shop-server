import Router from "express";
import { authOnly } from "../middleware/authOnly";
import cartService from "../services/cartService";
import { body } from "express-validator";
import { handleValidation } from "../middleware/handleValidation";
import { Item } from "../entities/Item";
import { parseItem } from "../middleware/parseItem";
import { parseCart } from "../middleware/parseCart";
import { Cart } from "../entities/Cart";
import { cartChange } from "../middleware/cartMutation";

const cartRouter = Router();

cartRouter.use(authOnly);

cartRouter.get("/", async (req, res) => {
  res.json({
    cart: await cartService.getCart(req.session!.userId),
  });
});

cartRouter.post(
  "/",
  body("itemId")
    .notEmpty()
    .withMessage("Required")
    .isInt()
    .withMessage("Not Valid"),
  body("quantity")
    .notEmpty()
    .withMessage("Required")
    .isInt({ gt: -1, lt: 100 })
    .withMessage("Not Valid"),
  handleValidation,
  parseItem,
  parseCart,
  cartChange,
  async (req, res) => {
    const { quantity }: { quantity: number } = req.body;
    const { item, cart } = res.locals as { item: Item; cart: Cart };

    await cartService.setCartItem(cart, { item, quantity });

    res.json({
      cart: await cartService.getCart(req.session!.userId),
    });
  }
);

cartRouter.delete("/", parseCart, cartChange, async (req, res) => {
  const clear = await cartService.emptyCart(res.locals.cart);
  res.json({
    success: true,
    affected: clear.affected,
  });
});

export default cartRouter;
