import { RequestHandler } from "express";
import userService from "../services/userService";

export const parseUser: RequestHandler = async (req, res, next) => {
  const user = await userService.findById(req.session!.userId);
  if (!user) {
    res.json({
      errors: [{ field: "login", msg: "Not logged in" }],
    });
    return;
  }

  res.locals.user = user;

  next();
};
