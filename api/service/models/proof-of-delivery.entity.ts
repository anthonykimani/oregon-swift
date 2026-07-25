import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("proof_of_delivery")
export class ProofOfDelivery extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  deliveryId: string;

  @Column({ length: 200, nullable: true })
  recipientName: string;

  @Column({ type: "text", nullable: true })
  signatureUrl: string;

  @Column({ type: "text", nullable: true })
  photoUrl: string;

  @Column()
  capturedBy: string;

  @Column({ type: "timestamp" })
  createdAt: Date;
}
