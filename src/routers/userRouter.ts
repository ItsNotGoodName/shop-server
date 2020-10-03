import Router from "express";
import { body } from "express-validator";
import { COOKIE_NAME } from "../constants";
import { authOnly } from "../middleware/authOnly";
import { handleValidation } from "../middleware/handleValidation";
import userService, { RegisterType } from "../services/userService";
import { ResErrors } from "../types";

const userRouter = Router();

type LoginParams = {
  usernameOrEmail: string;
  password: string;
};

userRouter.get("/me", authOnly, async (req, res) => {
  const user = await userService.me(req.session!.userId);
  if (!user) {
    return;
  }
  res.json({
    user,
  });
});

userRouter.post(
  "/register",
  body("username")
    .notEmpty()
    .withMessage("Missing username")
    .isLength({ min: 3, max: 127 })
    .withMessage("Minumum length 3 and maximum length 127"),
  body("email")
    .notEmpty()
    .withMessage("Missing email")
    .isEmail()
    .withMessage("Not valid email")
    .isLength({ max: 127 }),
  body("password")
    .notEmpty()
    .withMessage("Missing password")
    .isLength({ min: 3, max: 127 })
    .withMessage("Minimum Length 3 and maximum length 127"),
  handleValidation,
  async (req, res) => {
    const data: RegisterType = req.body;
    const { user, success } = await userService.register(data);

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
    res.json({
      success: true,
    });
  }
);

userRouter.post(
  "/login",
  body("password").notEmpty().withMessage("Missing password"),
  body("usernameOrEmail").notEmpty().withMessage("Missing username or email"),
  handleValidation,
  async (req, res) => {
    const data: LoginParams = req.body;
    let user = await userService.findByUsernameOrEmail(data.usernameOrEmail);

    if (!user) {
      res.json({
        errors: [
          { field: "usernameOrEmail", msg: "User does not exists" },
        ] as ResErrors,
      });
      return;
    }

    const success = await userService.login({ user, password: data.password });

    if (!success) {
      res.json({
        errors: [{ field: "password", msg: "Incorrect password" }],
      });
      return;
    }

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
