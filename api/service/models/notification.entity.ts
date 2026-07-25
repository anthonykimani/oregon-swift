import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("notifications")
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ length: 50 })
  type: string;

  @Column("simple-json", { nullable: true })
  payload: Record<string, any>;

  @Column({ default: false })
  read: boolean;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date;

  @Column({ type: "timestamp" })
  createdAt: Date;
}
