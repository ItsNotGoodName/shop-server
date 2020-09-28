import Router from "express";
import { param, query } from "express-validator";
import { authOnly } from "../middleware/authOnly";
import { handleValidation } from "../middleware/handleValidation";
import itemService from "../services/itemService";
import userService from "../services/userService";

const itemRouter = Router();

type ItemType = {
  id: number;
  title: string;
  description: string;
  price: number;
  createdAt: number;
  photos: [{ url: string }];
  sellor: { id: number; username: string };
};

itemRouter.get(
  "/new",
  query("page").optional().isInt({ gt: 0 }),
  handleValidation,
  async (req, res) => {
    let page: number;
    if (typeof req.query.page === "string") {
      page = parseInt(req.query.page);
    } else {
      page = 1;
    }

    const { items, count } = await itemService.findNew(
      (page - 1) * itemService.limit
    );
    const maxPage = Math.ceil(count / itemService.limit);
    res.json({ items, maxPage });
  }
);

itemRouter.get(
  "/id/:id",
  authOnly,
  param("id")
    .notEmpty()
    .withMessage("Id not specified")
    .isNumeric()
    .withMessage("Not valid id"),
  handleValidation,
  async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await itemService.findById(id);

    if (!item) {
      res.json({ errors: [{ field: "id", msg: "Item does not exists" }] });
      return;
    }

    res.json(item);
  }
);

// itemRouter.delete("/id/:id", (req, res) => {});

itemRouter.post("/create", authOnly, async (req, res) => {
  const user = await userService.findById(req.session!.userId);
  if (!user) {
    res.json({ success: false });
    return;
  }

  const item = await itemService.create(user, {
    title: "Test Item",
    description: "Test Description",
    price: 20.33,
  });

  res.json(await itemService.findById(item.id));
});

export default itemRouter;
