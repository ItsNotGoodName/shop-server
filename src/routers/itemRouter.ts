import Router from "express";
import { body, param, query } from "express-validator";
import { authOnly } from "../middleware/authOnly";
import { handleValidation } from "../middleware/handleValidation";
import itemService from "../services/itemService";
import userService from "../services/userService";

const itemRouter = Router();

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

    res.json({ item });
  }
);

itemRouter.post(
  "/sell",
  authOnly,
  body("title").notEmpty().isString().isLength({ min: 3, max: 127 }),
  body("description").notEmpty().isString().isLength({ max: 1023 }),
  body("price")
    .notEmpty()
    .isDecimal({ decimal_digits: "2" })
    .custom((val: number) => val > 0)
    .withMessage("Can't be less than or equal to 0"),

  handleValidation,
  async (req, res) => {
    const {
      title,
      description,
      price,
    }: { title: string; description: string; price: number } = req.body;

    const user = await userService.me(req.session!.userId);
    if (!user) {
      res.json({ success: false });
      return;
    }

    const id = await itemService.create(user, {
      title,
      description,
      price,
    });

    res.json({
      id,
    });
  }
);

export default itemRouter;
