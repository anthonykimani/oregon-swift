import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "../models/user.entity";
import { CustomerProfile } from "../models/customer-profile.entity";
import { CourierProfile } from "../models/courier-profile.entity";
import { ServiceType } from "../models/service-type.entity";
import { Zone } from "../models/zone.entity";
import { RateMatrix } from "../models/rate-matrix.entity";
import { Delivery } from "../models/delivery.entity";
import { TrackingEvent } from "../models/tracking-event.entity";
import { ProofOfDelivery } from "../models/proof-of-delivery.entity";
import { Invoice } from "../models/invoice.entity";
import { InvoiceItem } from "../models/invoice-item.entity";
import { PaymentEvent } from "../models/payment-event.entity";
import { Notification } from "../models/notification.entity";
import { Conversation } from "../models/conversation.entity";
import { Message } from "../models/message.entity";
import { CourierLocation } from "../models/courier-location.entity";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: Number(process.env.DB_SSL) ? true : false,
};

const AppDataSource = new DataSource({
  type: "postgres",
  host: config.host,
  port: Number(config.port) || 5432,
  username: config.user,
  password: config.password,
  database: config.database,
  ssl: config.ssl
    ? {
        rejectUnauthorized: false,
      }
    : config.ssl,
  entities: [
    User,
    CustomerProfile,
    CourierProfile,
    ServiceType,
    Zone,
    RateMatrix,
    Delivery,
    TrackingEvent,
    ProofOfDelivery,
    Invoice,
    InvoiceItem,
    PaymentEvent,
    Notification,
    Conversation,
    Message,
    CourierLocation,
  ],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  migrationsTableName: "migrations",
  // Schema changes are managed through versioned migrations. Set DB_SYNC=true
  // only for throwaway local databases; never enable it in production.
  synchronize: process.env.DB_SYNC === "true",
  dropSchema: false,
  logging: false,
});

export default AppDataSource;
