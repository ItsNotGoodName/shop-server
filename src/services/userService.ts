import argon2 from "argon2";
import validator from "validator";
import { User } from "../entities/User";
import cartService from "./cartService";

export type RegisterType = {
  username: string;
  email: string;
  password: string;
};

class UserService {
  publicSelect: (keyof User)[];
  privateSelect: (keyof User)[];
  constructor() {
    this.publicSelect = ["id", "username", "email", "createdAt"];
    this.privateSelect = ["id", "username", "balance", "email", "createdAt"];
  }

  async register(
    registerData: RegisterType
  ): Promise<{ user: User; success: boolean }> {
    const foundUser = await this.findUserByUsername(registerData.username);

    if (foundUser) {
      return { user: foundUser, success: false };
    }
    const cart = await cartService.create();
    const user = await User.create({
      username: registerData.username,
      email: registerData.email,
      password: await argon2.hash(registerData.password),
      cart,
    }).save();

    return {
      user,
      success: true,
    };
  }

  login({
    user,
    password,
  }: {
    user: User;
    password: string;
  }): Promise<boolean> {
    return argon2.verify(user.password, password);
  }

  me(id: number): Promise<User | undefined> {
    return User.findOne(id, { select: this.privateSelect });
  }

  findById(id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  findByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    if (validator.isEmail(usernameOrEmail)) {
      return this.findUserByEmail(usernameOrEmail);
    } else {
      return this.findUserByUsername(usernameOrEmail);
    }
  }

  findUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ email: email });
  }

  findUserByUsername(username: string): Promise<User | undefined> {
    return User.findOne({ username: username });
  }
}

export default new UserService();
