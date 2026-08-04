import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("payment_events")
export class PaymentEvent extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  invoiceId: string;

  @Column({ length: 30 })
  action: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  actorId: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  actorRole: string | null;

  @Column({ type: "text", nullable: true })
  note: string | null;

  @Column({ type: "timestamp" })
  createdAt: Date;
}
