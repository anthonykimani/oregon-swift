import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhaseAFollowups1789445134715 implements MigrationInterface {
    name = 'AddPhaseAFollowups1789445134715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "courier_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courierId" character varying NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "accuracy" double precision, "speed" double precision, "recordedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_5ee250d71d05f094edb8a2ecea5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_dbefeeb2b9955a52a51f70e9f3" ON "courier_locations" ("courierId") `);
        await queryRunner.query(`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "pickupLat" double precision`);
        await queryRunner.query(`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "pickupLng" double precision`);
        await queryRunner.query(`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "dropoffLat" double precision`);
        await queryRunner.query(`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "dropoffLng" double precision`);
        await queryRunner.query(`ALTER TABLE "courier_profiles" ADD COLUMN IF NOT EXISTS "availabilityStatus" character varying(20) NOT NULL DEFAULT 'offline'`);
        await queryRunner.query(`ALTER TABLE "courier_profiles" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courier_profiles" DROP COLUMN IF EXISTS "lastSeenAt"`);
        await queryRunner.query(`ALTER TABLE "courier_profiles" DROP COLUMN IF EXISTS "availabilityStatus"`);
        await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "dropoffLng"`);
        await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "dropoffLat"`);
        await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "pickupLng"`);
        await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "pickupLat"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_dbefeeb2b9955a52a51f70e9f3"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "courier_locations"`);
    }

}
