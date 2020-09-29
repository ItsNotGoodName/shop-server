import argon2 from "argon2";
import { User } from "../entities/User";
import cartService from "./cartService";

export type registerParams = {
  username: string;
  email: string;
  password: string;
};

export type loginParams = {
  user: User;
  password: string;
};

export type emailOrUsernameParams = {
  username?: string;
  email?: string;
};

class UserService {
  safeSelect: (keyof User)[];
  constructor() {
    this.safeSelect = ["id", "username", "email", "createdAt"];
  }

  async register(
    registerData: registerParams
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

  login({ user, password }: loginParams): Promise<boolean> {
    return argon2.verify(user.password, password);
  }

  me(id: number): Promise<User | undefined> {
    return User.findOne(id, { select: this.safeSelect });
  }

  findById(id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  findUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ email: email });
  }

  findUserByUsername(username: string): Promise<User | undefined> {
    return User.findOne({ username: username });
  }
}

export default new UserService();
