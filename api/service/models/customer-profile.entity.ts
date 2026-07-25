import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("customer_profiles")
export class CustomerProfile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ length: 256, nullable: true })
  companyName: string;

  @Column("simple-json", { nullable: true })
  billingAddress: Record<string, any>;

  @Column({ length: 20, default: "per_delivery" })
  billingCycle: string;
}
