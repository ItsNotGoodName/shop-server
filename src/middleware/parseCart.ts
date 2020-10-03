import { RequestHandler } from "express";
import cartService from "../services/cartService";

export const parseCart: RequestHandler = async (req, res, next) => {
  const cart = await cartService.findByUserId(req.session!.userId);

  if (!cart) {
    res.json({
      errors: [
        {
          field: "user",
          msg: "Cart does not exists for user",
        },
      ],
    });
    return;
  }

  res.locals.cart = cart;

  next();
};
