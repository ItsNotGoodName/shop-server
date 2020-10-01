import Router, { RequestHandler } from "express";
import { authOnly } from "../middleware/authOnly";
import cartService from "../services/cartService";
import { body } from "express-validator";
import itemService from "../services/itemService";
import { handleValidation } from "../middleware/handleValidation";
import { Item } from "src/entities/Item";

const cartRouter = Router();

const itemIdValidate = body("itemId")
  .notEmpty()
  .withMessage("Required")
  .isInt()
  .withMessage("Not Valid");
const quantityValidate = body("quantity")
  .notEmpty()
  .withMessage("Required")
  .isInt({ gt: -1, lt: 100 })
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

const cartNotFoundError = {
  errors: [
    {
      field: "user",
      msg: "Cart does not exists for user",
    },
  ],
};

cartRouter.use(authOnly);

cartRouter.get("/", async (req, res) => {
  res.json({
    cart: await cartService.getCart(req.session!.userId),
  });
});

cartRouter.post(
  "/",
  itemIdValidate,
  quantityValidate,
  handleValidation,
  parseItem,
  async (req, res) => {
    const { quantity }: { quantity: number } = req.body;
    const item = res.locals.item as Item;

    const cart = await cartService.findByUserId(req.session!.userId);

    if (!cart) {
      return res.json(cartNotFoundError);
    }
    await cartService.setCartItem(cart, { item, quantity });

    res.json({
      cart: await cartService.getCart(req.session!.userId),
    });
    return;
  }
);

export default cartRouter;
