import path from "path";
import cors from "cors";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import express from "express";
import session from "express-session";
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
  REDIS_HOST,
  SESSION_SECRET,
} from "./constants";
import { User } from "./entities/User";
import userRouter from "./routers/userRouter";
import { Item } from "./entities/Item";
import itemRouter from "./routers/itemRouter";
import { Photo } from "./entities/Photo";

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
    entities: [User, Item, Photo],
  });
  conn.runMigrations();

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis({ host: REDIS_HOST });

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

  app.listen(PORT, () => {
    console.log("Listening");
  });
};

main().catch((err) => console.error(err));
