import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("invoice_items")
export class InvoiceItem extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  invoiceId: string;

  @Column()
  deliveryId: string;

  @Column({ type: "integer" })
  amountCents: number;
}
