import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import path from "path";
import { createConnection } from "typeorm";
import {
  COOKIE_AGE,
  COOKIE_NAME,
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_TYPE,
  DB_USERNAME,
  ORIGIN,
  PORT,
  PRODUCTION,
  SESSION_SECRET,
} from "./constants";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItems";
import { Item } from "./entities/Item";
import { Photo } from "./entities/Photo";
import { User } from "./entities/User";
import { redisConn } from "./redisConn";
import cartRouter from "./routers/cartRouter";
import checkoutRouter from "./routers/checkoutRouter";
import itemRouter from "./routers/itemRouter";
import userRouter from "./routers/userRouter";

const main = async () => {
  const conn = await createConnection({
    type: DB_TYPE as any,
    database: DB_DATABASE,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    synchronize: true,
    entities: [User, Item, Cart, CartItem, Photo],
  });
  conn.runMigrations();

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = redisConn;

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: COOKIE_AGE,
        httpOnly: true,
        sameSite: "lax", // csrf protection
        secure: PRODUCTION, // cookie only works in https
      },
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(express.json());

  app.use(
    cors({
      origin: ORIGIN,
      credentials: true,
    })
  );

  app.use("/user", userRouter);
  app.use("/item", itemRouter);
  app.use("/cart", cartRouter);
  app.use("/checkout", checkoutRouter);

  app.listen(PORT, () => {
    console.log("Listening");
  });
};

main().catch((err) => console.error(err));
