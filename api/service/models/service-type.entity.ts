import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("service_types")
export class ServiceType extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 0 })
  slaHours: number;

  @Column({ type: "integer", default: 0 })
  basePriceCents: number;

  @Column({ default: false })
  requiresSignature: boolean;

  @Column({ default: true })
  requiresPhoto: boolean;

  @Column({ default: true })
  active: boolean;
}
