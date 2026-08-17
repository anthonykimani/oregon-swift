import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("courier_locations")
export class CourierLocation extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  courierId: string;

  @Column({ type: "double precision" })
  lat: number;

  @Column({ type: "double precision" })
  lng: number;

  @Column({ type: "double precision", nullable: true })
  accuracy: number;

  @Column({ type: "double precision", nullable: true })
  speed: number;

  @Column({ type: "timestamp" })
  recordedAt: Date;
}
