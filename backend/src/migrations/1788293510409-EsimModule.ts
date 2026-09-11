import { MigrationInterface, QueryRunner } from 'typeorm';

export class EsimModule1788293510409 implements MigrationInterface {
  name = 'EsimModule1788293510409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."esim_order_status_enum" AS ENUM('CONFIRMED', 'ACTIVATED')`);
    await queryRunner.query(`CREATE TABLE "esim_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "plan_id" character varying NOT NULL, "country" character varying NOT NULL, "provider" character varying NOT NULL, "data_mb" integer NOT NULL, "duration_days" integer NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'EUR', "status" "public"."esim_order_status_enum" NOT NULL DEFAULT 'CONFIRMED', "activation_code" character varying NOT NULL, "qr_code_data_url" text NOT NULL, "data_used_mb" integer NOT NULL DEFAULT 0, "usage_updated_at" TIMESTAMP NOT NULL, "activated_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_esim_order" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "esim_order" ADD CONSTRAINT "FK_esim_order_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "esim_order" DROP CONSTRAINT "FK_esim_order_user"`);
    await queryRunner.query(`DROP TABLE "esim_order"`);
    await queryRunner.query(`DROP TYPE "public"."esim_order_status_enum"`);
  }
}
