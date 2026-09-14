import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransportModule1788293510410 implements MigrationInterface {
  name = 'TransportModule1788293510410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."transport_booking_status_enum" AS ENUM('CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED')`);
    await queryRunner.query(`
      CREATE TABLE "transport_driver" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "photo_url" character varying,
        "vehicle_model" character varying NOT NULL,
        "vehicle_color" character varying NOT NULL,
        "vehicle_plate" character varying NOT NULL,
        "rating" numeric(2,1) NOT NULL DEFAULT 5,
        "price_per_km" numeric(10,2) NOT NULL,
        "is_available" boolean NOT NULL DEFAULT true,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transport_driver_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "transport_booking" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "driver_id" uuid NOT NULL,
        "pickup_address" character varying NOT NULL,
        "dropoff_address" character varying NOT NULL,
        "scheduled_at" TIMESTAMP NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "status" "public"."transport_booking_status_enum" NOT NULL DEFAULT 'CONFIRMED',
        "rating" integer,
        "rating_comment" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transport_booking_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transport_booking_driver" FOREIGN KEY ("driver_id") REFERENCES "transport_driver"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_transport_driver_available" ON "transport_driver" ("is_available")`);
    await queryRunner.query(`CREATE INDEX "IDX_transport_booking_user" ON "transport_booking" ("user_id")`);
    await queryRunner.query(`
      INSERT INTO "transport_driver" ("name", "vehicle_model", "vehicle_color", "vehicle_plate", "rating", "price_per_km") VALUES
        ('Amina Diop', 'Toyota Corolla', 'Noir', 'DK-2048-AB', 4.9, 2.50),
        ('Lucas Martin', 'Mercedes Classe E', 'Gris', 'FR-7512-LM', 4.8, 3.20),
        ('Sofia Rossi', 'Tesla Model 3', 'Blanc', 'IT-9087-SR', 4.7, 2.90)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_transport_booking_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_transport_driver_available"`);
    await queryRunner.query(`DROP TABLE "transport_booking"`);
    await queryRunner.query(`DROP TABLE "transport_driver"`);
    await queryRunner.query(`DROP TYPE "public"."transport_booking_status_enum"`);
  }
}