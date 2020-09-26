import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Item } from "./Item";
import ColumnNumericTransformer from "../utils/ColumnNumericTransforme";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column("numeric", {
    scale: 2,
    default: 0,
    transformer: ColumnNumericTransformer,
  })
  balance: number;

  @OneToMany(() => Item, (item) => item.sellor)
  items: Item[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
