import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("conversations")
export class Conversation extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 300 })
  threadKey: string;

  @Column({ type: "uuid", nullable: true })
  deliveryId: string | null;

  @Column({ type: "uuid", nullable: true })
  customerId: string | null;

  @Column({ type: "uuid", nullable: true })
  courierId: string | null;

  @Column({ type: "uuid", nullable: true })
  adminId: string | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  subject: string | null;

  @Column({ type: "uuid" })
  createdById: string;

  @Column({ type: "varchar", length: 20 })
  createdByIdRole: string;

  @Column({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "timestamp" })
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: "text", nullable: true })
  lastMessagePreview: string | null;

  @Column({ type: "timestamp", nullable: true })
  customerReadAt: Date | null;

  @Column({ type: "timestamp", nullable: true })
  courierReadAt: Date | null;

  @Column({ type: "timestamp", nullable: true })
  adminReadAt: Date | null;
}