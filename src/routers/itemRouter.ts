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

    const { items: data, count } = await itemService.findNew(
      (page - 1) * itemService.limit
    );
    const maxPage = Math.ceil(count / itemService.limit);
    const items: ItemType[] = [];

    for (let i = 0; i < data.length; i++) {
      items.push({
        id: data[i].id,
        title: data[i].title,
        description: data[i].description,
        price: data[i].price,
        createdAt: data[i].createdAt.getTime(),
        sellor: {
          id: data[i].sellor.id,
          username: data[i].sellor.username,
        },
      });
    }

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

    const json: ItemType = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      createdAt: item.createdAt.getTime(),
      sellor: {
        id: item.sellor.id,
        username: item.sellor.username,
      },
    };

    res.json(json);
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

  const json: ItemType = {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    sellor: {
      id: item.sellor.id,
      username: item.sellor.username,
    },
    createdAt: item.createdAt.getTime(),
  };

  res.json(json);
});

export default itemRouter;
