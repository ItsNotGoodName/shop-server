import Router from "express";
import { body } from "express-validator";
import { COOKIE_NAME } from "../constants";
import { authOnly } from "../middleware/authOnly";
import { handleValidation } from "../middleware/handleValidation";
import userService from "../services/userService";
import { ResErrors } from "../types";

const userRouter = Router();

type RegisterType = {
  username: string;
  email: string;
  password: string;
};
type LoginType = {
  usernameOrEmail: string;
  password: string;
};

userRouter.get("/me", authOnly, async (req, res) => {
  const user = await userService.findById(req.session!.userId);
  if (!user) {
    return;
  }
  res.json({ id: user.id, username: user.username, email: user.email });
});

userRouter.post(
  "/register",
  body("username")
    .notEmpty()
    .withMessage("Missing username")
    .isLength({ min: 3 })
    .withMessage("Minumum length 3"),
  body("email")
    .notEmpty()
    .withMessage("Missing email")
    .isEmail()
    .withMessage("Not valid email"),
  body("password")
    .notEmpty()
    .withMessage("Missing password")
    .isLength({ min: 3 })
    .withMessage("Minimum Length 3"),
  handleValidation,
  async (req, res) => {
    const data: RegisterType = req.body; // :TODO Validata data
    const { user, success } = await userService.create(data);

    if (!success) {
      let errors: ResErrors = [];

      if (user.username === data.username)
        errors.push({ field: "username", msg: "Username is taken" });

      if (user.email === data.email)
        errors.push({ field: "email", msg: "Email is taken" });

      res.json({ errors });
      return;
    }

    req.session!.userId = user.id;
    res.json({ username: user.username, email: user.email });
  }
);

userRouter.post(
  "/login",
  body("password").notEmpty(),
  handleValidation,
  async (req, res) => {
    const data: LoginType = req.body;

    const user = await userService.findUser({ username: data.usernameOrEmail });

    if (!user) {
      res.json({
        errors: [
          { field: "username", msg: "User does not exists" },
        ] as ResErrors,
      });
      return;
    }

    const success = await userService.login({ user, password: data.password });

    req.session!.userId = user.id;

    res.json({
      success,
    });
  }
);

userRouter.post("/logout", (req, res) => {
  req.session!.destroy((err) => {
    if (err) {
      res.json({ success: false });
      return;
    }
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });
});

export default userRouter;
