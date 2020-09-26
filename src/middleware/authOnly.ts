import { RequestHandler } from "express";
import { ResErrors } from "src/types";

export const authOnly: RequestHandler = (req, res, next) => {
  if (!req.session?.userId) {
    return res.json({
      errors: [{ field: "login", msg: "Not logged in" }] as ResErrors,
    });
  }
  next();
  return;
};
