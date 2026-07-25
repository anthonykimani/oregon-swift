import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("tracking_events")
export class TrackingEvent extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  deliveryId: string;

  @Column({ length: 30 })
  status: string;

  @Column()
  actorId: string;

  @Column({ type: "text", nullable: true })
  note: string;

  @Column({ type: "text", nullable: true })
  locationText: string;

  @Column({ type: "timestamp" })
  createdAt: Date;
}
