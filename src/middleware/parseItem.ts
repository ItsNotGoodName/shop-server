import { RequestHandler } from "express";
import itemService from "../services/itemService";

export const parseItem: RequestHandler = async (req, res, next) => {
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
