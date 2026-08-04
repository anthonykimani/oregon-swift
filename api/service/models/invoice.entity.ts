import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("invoices")
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string;

  @Column({ length: 50 })
  number: string;

  @Column({ type: "timestamp", nullable: true })
  periodStart: Date;

  @Column({ type: "timestamp", nullable: true })
  periodEnd: Date;

  @Column({ length: 20, default: "draft" })
  status: string;

  @Column({ type: "integer", default: 0 })
  subtotalCents: number;

  @Column({ type: "integer", default: 0 })
  taxCents: number;

  @Column({ type: "integer", default: 0 })
  totalCents: number;

  @Column({ type: "timestamp", nullable: true })
  dueDate: Date;

  @Column({ type: "timestamp", nullable: true })
  issuedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date;

  @Column({ type: "timestamp", nullable: true })
  paymentRequestedAt: Date;

  @Column({ nullable: true })
  confirmedBy: string;

  @Column({ nullable: true })
  disputedBy: string;

  @Column({ type: "text", nullable: true })
  disputeReason: string;

  @Column({ type: "text", nullable: true })
  adminNote: string;
}
