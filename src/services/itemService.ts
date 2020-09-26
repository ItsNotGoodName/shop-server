import { getRepository } from "typeorm";
import { Item } from "../entities/Item";
import { User } from "../entities/User";

class ItemService {
  limit: number;
  constructor() {
    this.limit = 10;
  }

  async create(
    user: User,
    {
      title,
      description,
      price,
    }: { title: string; description: string; price: number }
  ) {
    return Item.create({
      title,
      description,
      price: price,
      sellor: user,
    }).save();
  }

  async findNew(
    skip?: number,
    limit = this.limit
  ): Promise<{ items: Item[]; count: number }> {
    const [items, count] = await getRepository(Item)
      .createQueryBuilder("item")
      .leftJoinAndSelect("item.sellor", "item.sellor")
      .orderBy("item.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { items, count };
  }

  async findById(id: number) {
    return Item.findOne(id, { relations: ["sellor"] });
  }
}

export default new ItemService();
