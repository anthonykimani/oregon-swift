import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserRole } from "../enums/UserRole";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 256, nullable: true })
  @Index({ unique: true })
  email: string;

  @Column({ type: "text" })
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ length: 100, nullable: false })
  firstname: string;

  @Column({ length: 100, nullable: true })
  middlename: string;

  @Column({ length: 100, nullable: false })
  lastname: string;

  @Column({ length: 100, nullable: false })
  @Index({ unique: true })
  username: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  phoneNumberConfirmed: boolean;

  @Column({ default: false })
  emailConfirmed: boolean;

  @Column({ default: false })
  registered: boolean;

  @Column({ type: "timestamp", nullable: false })
  created: Date;

  @Column({ type: "timestamp", nullable: false })
  lastUpdated: Date;

  @Column({ length: 100, nullable: true })
  updateType: string;

  @Column({ default: false })
  disabled: boolean;

  @Column({ length: 100, nullable: true })
  disableReason: string;

  @Column({ type: "timestamp", nullable: true })
  lastDisabled: Date;

  @Column({ type: "integer", default: 0 })
  accessFailedCount: number;

  @Column({ type: "timestamp", nullable: true })
  lockoutEndDateUtc: Date;

  @Column({ default: false })
  lockoutEnabled: boolean;

  @Column({ default: false })
  deleted: boolean;

  @Column({ length: 100, nullable: true })
  deleteReason: string;

  @Column({ type: "timestamp", nullable: true })
  deleteDate: Date;
}
