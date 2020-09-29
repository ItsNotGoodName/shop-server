import Router, { RequestHandler } from "express";
import { authOnly } from "../middleware/authOnly";
import cartService from "../services/cartService";
import { body } from "express-validator";
import itemService from "../services/itemService";
import { handleValidation } from "../middleware/handleValidation";
import { Item } from "src/entities/Item";

const cartRouter = Router();

const itemIdMid = body("itemId")
  .notEmpty()
  .withMessage("Required")
  .isInt()
  .withMessage("Not Valid");
const quantityMid = body("quantity")
  .notEmpty()
  .withMessage("Required")
  .isInt({ gt: 0, lt: 99 })
  .withMessage("Not Valid");

const parseItem: RequestHandler = async (req, res, next) => {
  const { itemId } = req.body;
  const item = await itemService.findById(itemId);
  if (!item) {
    res.json({
      errors: [
        {
          field: "itemId",
          msg: "Not Found",
        },
      ],
    });
    return;
  }

  res.locals.item = item;

  next();
};

cartRouter.use(authOnly);

cartRouter.get("/", async (req, res) => {
  res.json({
    cart: (await cartService.getCart(req.session!.userId)).cartItems,
  });
});

cartRouter.post(
  "/",
  itemIdMid,
  quantityMid,
  handleValidation,
  parseItem,
  async (req, res) => {
    const { quantity }: { quantity: number } = req.body;
    const item = res.locals.item as Item;

    const cart = await cartService.getCart(req.session!.userId);
    await cartService.setCartItem(cart, { item, quantity });
    res.json({ success: true });
  }
);

cartRouter.delete(
  "/",
  itemIdMid,
  handleValidation,
  parseItem,
  async (req, res) => {
    const item = res.locals.item as Item;

    const cart = await cartService.getCart(req.session!.userId);
    const deleteRes = await cartService.deleteCartItem(cart, { item });
    res.json({ success: !!deleteRes.affected });
  }
);

export default cartRouter;
