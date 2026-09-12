import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("deliveries")
export class Delivery extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 20 })
  trackingNumber: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  courierId: string;

  @Column()
  serviceTypeId: string;

  @Column({ length: 30, default: "pending" })
  status: string;

  @Column({ length: 20, nullable: true })
  priority: string;

  @Column({ nullable: true })
  pickupZoneId: string;

  @Column({ type: "text", nullable: true })
  pickupAddress: string;

  @Column({ type: "double precision", nullable: true })
  pickupLat: number | null;

  @Column({ type: "double precision", nullable: true })
  pickupLng: number | null;

  @Column({ length: 100, nullable: true })
  pickupContactName: string;

  @Column({ length: 20, nullable: true })
  pickupContactPhone: string;

  @Column({ nullable: true })
  pickupWindowStart: string;

  @Column({ nullable: true })
  pickupWindowEnd: string;

  @Column({ nullable: true })
  dropoffZoneId: string;

  @Column({ type: "text", nullable: true })
  dropoffAddress: string;

  @Column({ type: "double precision", nullable: true })
  dropoffLat: number | null;

  @Column({ type: "double precision", nullable: true })
  dropoffLng: number | null;

  @Column({ length: 100, nullable: true })
  dropoffContactName: string;

  @Column({ length: 20, nullable: true })
  dropoffContactPhone: string;

  @Column({ nullable: true })
  dropoffWindowStart: string;

  @Column({ nullable: true })
  dropoffWindowEnd: string;

  @Column({ nullable: true })
  scheduledDate: string;

  @Column({ type: "text", nullable: true })
  packageDesc: string;

  @Column({ default: 1 })
  packagePieces: number;

  @Column({ length: 50, nullable: true })
  packageWeight: string;

  @Column({ length: 50, nullable: true })
  packageSizeClass: string;

  @Column({ default: false })
  packageFragile: boolean;

  @Column({ type: "integer", nullable: true })
  priceCents: number;

  @Column({ default: false })
  needsQuote: boolean;

  @Column({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "timestamp" })
  updatedAt: Date;
}
