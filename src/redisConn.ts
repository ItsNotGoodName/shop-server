import Redis from "ioredis";
import { REDIS_HOST } from "./constants";

export const redisConn = new Redis({ host: REDIS_HOST });
