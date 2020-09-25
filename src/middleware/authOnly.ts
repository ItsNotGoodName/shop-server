import { RequestHandler } from "express";

export const authOnly: RequestHandler = (req, res, next) => {
  console.log(req.session?.id);
  if (!req.session?.userId) {
    return res.json({ errors: [{ field: "login", msg: "Not logged in" }] });
  }
  next();
};
