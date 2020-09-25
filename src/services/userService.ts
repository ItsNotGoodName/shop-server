import argon2 from "argon2";
import { getRepository } from "typeorm";
import { User } from "../entities/User";

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
  async create(
    registerData: registerParams
  ): Promise<{ user: User; success: boolean }> {
    const user = await this.findUser(registerData);

    if (user) {
      return { user, success: false };
    }

    return {
      user: await User.create({
        username: registerData.username,
        email: registerData.email,
        password: await argon2.hash(registerData.password),
      }).save(),
      success: true,
    };
  }

  async login({ user, password }: loginParams): Promise<boolean> {
    return argon2.verify(user.password, password);
  }

  async findById(id: number) {
    return User.findOne(id);
  }

  async findUser(data: emailOrUsernameParams): Promise<undefined | User> {
    let qb = getRepository(User).createQueryBuilder("user");

    if (data.username) {
      qb = qb.orWhere("user.username = :username", {
        username: data.username,
      });
    }
    if (data.email) {
      qb = qb.orWhere("user.email = :email", {
        email: data.email,
      });
    }
    return qb.getOne();
  }
}

export default new UserService();
