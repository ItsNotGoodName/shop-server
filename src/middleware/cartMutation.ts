import { RequestHandler } from "express";
import { CART_CHECK_PREFIX } from "../constants";
import { redisConn } from "../redisConn";
import { v4 } from "uuid";

const updateCartCheck = async (userId: number) => {
  const cartSession = v4();
  const key = CART_CHECK_PREFIX + userId;
  await redisConn.set(key, cartSession);
  return cartSession;
};

// Must come after authOnly middleware
export const cartChange: RequestHandler = async (req, res, next) => {
  res.locals!.cartCheck = updateCartCheck(req.session!.userId);
  next();
};

// Must come after authOnly middleware
export const cartCheck: RequestHandler = async (req, res, next) => {
  const key = CART_CHECK_PREFIX + req.session!.userId;
  const value = await redisConn.get(key);

  if (value === null) {
    res.locals!.cartCheck = await updateCartCheck(req.session!.userId);
  } else {
    res.locals!.cartCheck = value;
  }

  next();
};
