import Router from "express";
import { body } from "express-validator";
import { User } from "../entities/User";
import cartService from "../services/cartService";
import { Cart } from "../entities/Cart";
import { authOnly } from "../middleware/authOnly";
import { cartCheck } from "../middleware/cartMutation";
import { handleValidation } from "../middleware/handleValidation";
import { parseCart } from "../middleware/parseCart";
import { parseUser } from "../middleware/parseUser";

const checkoutRouter = Router();

checkoutRouter.use(authOnly);

checkoutRouter.get("/", parseUser, cartCheck, async (req, res) => {
  const { cartCheck, user } = res.locals as {
    cartCheck: string;
    user: User;
  };
  const cart = (await cartService.getCart(user.id)) as Cart;

  if (cart.cartItems.length == 0) {
    res.json({
      errors: [
        {
          field: "cart",
          msg: "Cart is empty",
        },
      ],
    });
    return;
  }

  const remainingBalance = user.balance - cart.total;

  res.json({
    cartCheck,
    cart,
    remainingBalance,
    canAfford: remainingBalance >= 0,
  });
});

checkoutRouter.post(
  "/",
  body("cartCheck").notEmpty().withMessage("Required"),
  handleValidation,
  parseCart,
  parseUser,
  cartCheck,
  async (req, res) => {
    const { cartCheck: reqCartCheck } = req.body! as {
      cartCheck?: string;
    };
    const { cart, user, cartCheck: savedCartCheck } = res.locals as {
      cart: Cart;
      user: User;
      cartCheck: string;
    };

    if (cart.cartItems.length == 0) {
      res.json({
        errors: [
          {
            field: "cart",
            msg: "Cart is empty",
          },
        ],
      });
      return;
    }

    if (reqCartCheck !== savedCartCheck) {
      res.json({
        errors: [
          {
            field: "cartCheck",
            msg: "Invalid cartCheck",
          },
        ],
      });
      return;
    }

    res.json({
      success: true,
    });
  }
);

export default checkoutRouter;
