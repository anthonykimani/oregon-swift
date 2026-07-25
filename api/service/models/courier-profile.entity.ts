import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("courier_profiles")
export class CourierProfile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ length: 100, nullable: true })
  vehicleType: string;

  @Column("simple-array", { nullable: true })
  zones: string[];

  @Column("simple-array", { nullable: true })
  certifications: string[];

  @Column({ default: true })
  active: boolean;
}
