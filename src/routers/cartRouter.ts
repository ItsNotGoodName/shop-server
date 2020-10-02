import Router from "express";
import { authOnly } from "../middleware/authOnly";
import cartService from "../services/cartService";
import { body } from "express-validator";
import { handleValidation } from "../middleware/handleValidation";
import { Item } from "src/entities/Item";
import { parseItem } from "../middleware/parseItem";

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
  async (req, res) => {
    const { quantity }: { quantity: number } = req.body;
    const item = res.locals.item as Item;

    const cart = await cartService.findByUserId(req.session!.userId);

    if (!cart) {
      return res.json({
        errors: [
          {
            field: "user",
            msg: "Cart does not exists for user",
          },
        ],
      });
    }
    await cartService.setCartItem(cart, { item, quantity });

    res.json({
      cart: await cartService.getCart(req.session!.userId),
    });
    return;
  }
);

export default cartRouter;
