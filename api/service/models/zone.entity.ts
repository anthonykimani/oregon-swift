import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("zones")
export class Zone extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ type: "json", nullable: true })
  boundaries: number[][][];

  @Column({ default: true })
  active: boolean;

  @Column({ length: 10, default: "radial" })
  zoneType: string;

  @Column({ type: "float", nullable: true })
  centerLat: number;

  @Column({ type: "float", nullable: true })
  centerLng: number;

  @Column({ type: "int", nullable: true })
  radiusMiles: number;

  @Column({ length: 7, nullable: true })
  color: string;
}
