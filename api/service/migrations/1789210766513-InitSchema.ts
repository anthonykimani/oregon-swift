import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1789210766513 implements MigrationInterface {
    name = 'InitSchema1789210766513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'courier', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(256), "password" text NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "firstname" character varying(100) NOT NULL, "middlename" character varying(100), "lastname" character varying(100) NOT NULL, "username" character varying(100) NOT NULL, "phoneNumber" character varying(20), "phoneNumberConfirmed" boolean NOT NULL DEFAULT false, "emailConfirmed" boolean NOT NULL DEFAULT false, "registered" boolean NOT NULL DEFAULT false, "created" TIMESTAMP NOT NULL, "lastUpdated" TIMESTAMP NOT NULL, "updateType" character varying(100), "disabled" boolean NOT NULL DEFAULT false, "disableReason" character varying(100), "lastDisabled" TIMESTAMP, "accessFailedCount" integer NOT NULL DEFAULT '0', "lockoutEndDateUtc" TIMESTAMP, "lockoutEnabled" boolean NOT NULL DEFAULT false, "deleted" boolean NOT NULL DEFAULT false, "deleteReason" character varying(100), "deleteDate" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE TABLE "customer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "companyName" character varying(256), "billingAddress" text, "billingCycle" character varying(20) NOT NULL DEFAULT 'per_delivery', CONSTRAINT "PK_ece08ee55cbe707d9f870907727" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courier_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "vehicleType" character varying(100), "zones" text, "certifications" text, "active" boolean NOT NULL DEFAULT true, "availabilityStatus" character varying(20) NOT NULL DEFAULT 'offline', "lastSeenAt" TIMESTAMP, CONSTRAINT "PK_7d4e5633c6f48b745d3c3271e9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slaHours" integer NOT NULL DEFAULT '0', "basePriceCents" integer NOT NULL DEFAULT '0', "requiresSignature" boolean NOT NULL DEFAULT false, "requiresPhoto" boolean NOT NULL DEFAULT true, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_1dc93417a097cdee3491f39d7cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "zones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "state" character varying(50), "boundaries" json, "active" boolean NOT NULL DEFAULT true, "zoneType" character varying(10) NOT NULL DEFAULT 'radial', "centerLat" double precision, "centerLng" double precision, "radiusMiles" integer, "color" character varying(7), CONSTRAINT "PK_880484a43ca311707b05895bd4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rate_matrix" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromZoneId" character varying NOT NULL, "toZoneId" character varying NOT NULL, "serviceTypeId" character varying NOT NULL, "priceCents" integer NOT NULL, CONSTRAINT "PK_d2ada2d3742c78fb7c85f6c29a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackingNumber" character varying(20) NOT NULL, "customerId" character varying NOT NULL, "courierId" character varying, "serviceTypeId" character varying NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'pending', "priority" character varying(20), "pickupZoneId" character varying, "pickupAddress" text, "pickupLat" double precision, "pickupLng" double precision, "pickupContactName" character varying(100), "pickupContactPhone" character varying(20), "pickupWindowStart" character varying, "pickupWindowEnd" character varying, "dropoffZoneId" character varying, "dropoffAddress" text, "dropoffLat" double precision, "dropoffLng" double precision, "dropoffContactName" character varying(100), "dropoffContactPhone" character varying(20), "dropoffWindowStart" character varying, "dropoffWindowEnd" character varying, "scheduledDate" character varying, "packageDesc" text, "packagePieces" integer NOT NULL DEFAULT '1', "packageWeight" character varying(50), "packageSizeClass" character varying(50), "packageFragile" boolean NOT NULL DEFAULT false, "priceCents" integer, "needsQuote" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_a6ef225c5c5f0974e503bfb731f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tracking_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deliveryId" character varying NOT NULL, "status" character varying(30) NOT NULL, "actorId" character varying NOT NULL, "note" text, "locationText" text, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_cc22ae68e05d9ba5a6575a6f429" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "proof_of_delivery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deliveryId" character varying NOT NULL, "recipientName" character varying(200), "signatureUrl" text, "photoUrl" text, "capturedBy" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_8fc2509dfe6dc0b9eafc522620c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" character varying NOT NULL, "number" character varying(50) NOT NULL, "periodStart" TIMESTAMP, "periodEnd" TIMESTAMP, "status" character varying(20) NOT NULL DEFAULT 'draft', "subtotalCents" integer NOT NULL DEFAULT '0', "taxCents" integer NOT NULL DEFAULT '0', "totalCents" integer NOT NULL DEFAULT '0', "dueDate" TIMESTAMP, "issuedAt" TIMESTAMP, "paidAt" TIMESTAMP, "paymentRequestedAt" TIMESTAMP, "confirmedBy" character varying, "disputedBy" character varying, "disputeReason" text, "adminNote" text, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" character varying NOT NULL, "deliveryId" character varying NOT NULL, "amountCents" integer NOT NULL, CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" character varying NOT NULL, "action" character varying(30) NOT NULL, "actorId" character varying(100), "actorRole" character varying(20), "note" text, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_9f1d16fc78b33e676940a32e8b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "type" character varying(50) NOT NULL, "payload" text, "read" boolean NOT NULL DEFAULT false, "readAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadKey" character varying(300) NOT NULL, "deliveryId" uuid, "customerId" uuid, "courierId" uuid, "adminId" uuid, "subject" character varying(300), "createdById" uuid NOT NULL, "createdByIdRole" character varying(20) NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "lastMessageAt" TIMESTAMP, "lastMessagePreview" text, "customerReadAt" TIMESTAMP, "courierReadAt" TIMESTAMP, "adminReadAt" TIMESTAMP, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" character varying NOT NULL, "senderId" character varying NOT NULL, "senderRole" character varying(20) NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courier_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courierId" character varying NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "accuracy" double precision, "speed" double precision, "recordedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_5ee250d71d05f094edb8a2ecea5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dbefeeb2b9955a52a51f70e9f3" ON "courier_locations" ("courierId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_dbefeeb2b9955a52a51f70e9f3"`);
        await queryRunner.query(`DROP TABLE "courier_locations"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "payment_events"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "proof_of_delivery"`);
        await queryRunner.query(`DROP TABLE "tracking_events"`);
        await queryRunner.query(`DROP TABLE "deliveries"`);
        await queryRunner.query(`DROP TABLE "rate_matrix"`);
        await queryRunner.query(`DROP TABLE "zones"`);
        await queryRunner.query(`DROP TABLE "service_types"`);
        await queryRunner.query(`DROP TABLE "courier_profiles"`);
        await queryRunner.query(`DROP TABLE "customer_profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
