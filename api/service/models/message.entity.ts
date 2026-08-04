import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("messages")
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  conversationId: string;

  @Column()
  senderId: string;

  @Column({ length: 20 })
  senderRole: string;

  @Column({ type: "text" })
  body: string;

  @Column({ type: "timestamp" })
  createdAt: Date;
}