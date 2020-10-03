import Router from "express";
import { body } from "express-validator";
import { User } from "src/entities/User";
import { Cart } from "../entities/Cart";
import { authOnly } from "../middleware/authOnly";
import { cartCheck } from "../middleware/cartMutation";
import { handleValidation } from "../middleware/handleValidation";
import { parseCart } from "../middleware/parseCart";
import { parseUser } from "../middleware/parseUser";

const checkoutRouter = Router();

checkoutRouter.use(authOnly);

checkoutRouter.get("/", parseCart, cartCheck, async (req, res) => {
  const { cart, cartCheck } = res.locals as { cart: Cart; cartCheck: string };

  res.json({
    cartCheck,
    cart,
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
