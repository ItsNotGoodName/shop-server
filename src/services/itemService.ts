import { Item } from "../entities/Item";
import { User } from "../entities/User";

class ItemService {
  limit: number;
  itemSelect: string[];
  userSelect: string[];
  constructor() {
    this.limit = 10;
    this.itemSelect = [
      "item.id",
      "item.title",
      "item.description",
      "item.price",
      "item.createdAt",
    ];
    this.userSelect = ["sellor.id", "sellor.username"];
  }

  async create(
    user: User,
    {
      title,
      description,
      price,
    }: { title: string; description: string; price: number }
  ): Promise<number> {
    const item = await Item.create({
      title,
      description,
      price: price,
      sellor: user,
    }).save();
    return item.id;
  }

  async findNew(
    skip?: number,
    limit = this.limit
  ): Promise<{ items: Item[]; count: number }> {
    const [items, count] = await Item.createQueryBuilder("item")
      .select(this.itemSelect)
      .leftJoin("item.sellor", "sellor")
      .addSelect(this.userSelect)
      .leftJoinAndSelect("item.photos", "item.photos")
      .orderBy("item.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { items, count };
  }

  findById(id: number): Promise<Item | undefined> {
    return Item.createQueryBuilder("item")
      .select(this.itemSelect)
      .where("item.id = :id", { id })
      .leftJoin("item.sellor", "sellor")
      .addSelect(this.userSelect)
      .leftJoinAndSelect("item.photos", "photos")
      .getOne();
  }
}

export default new ItemService();
