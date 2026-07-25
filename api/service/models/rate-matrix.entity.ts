import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("rate_matrix")
export class RateMatrix extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fromZoneId: string;

  @Column()
  toZoneId: string;

  @Column()
  serviceTypeId: string;

  @Column({ type: "integer" })
  priceCents: number;
}
