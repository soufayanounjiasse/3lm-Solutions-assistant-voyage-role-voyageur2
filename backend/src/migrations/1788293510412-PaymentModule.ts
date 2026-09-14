import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentModule1788293510412 implements MigrationInterface {
  name = 'PaymentModule1788293510412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."esim_order_payment_method_enum" ADD VALUE 'WALLET'`);
    await queryRunner.query(`CREATE TYPE "public"."payment_transaction_method_enum" AS ENUM('CARD', 'MOBILE', 'WALLET')`);
    await queryRunner.query(`CREATE TYPE "public"."payment_transaction_status_enum" AS ENUM('PAID', 'FAILED')`);
    await queryRunner.query(`CREATE TABLE "travel_wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "balance" numeric(10,2) NOT NULL DEFAULT '0', "currency" character varying(3) NOT NULL DEFAULT 'EUR', "preferred_method" "public"."payment_transaction_method_enum" NOT NULL DEFAULT 'CARD', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_travel_wallet_user_id" UNIQUE ("user_id"), CONSTRAINT "PK_travel_wallet" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "payment_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "service_type" character varying NOT NULL, "service_id" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'EUR', "method" "public"."payment_transaction_method_enum" NOT NULL, "status" "public"."payment_transaction_status_enum" NOT NULL DEFAULT 'PAID', "provider" character varying, "provider_payment_id" character varying, "receipt_number" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_payment_transaction_receipt_number" UNIQUE ("receipt_number"), CONSTRAINT "PK_payment_transaction" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "travel_wallet" ADD CONSTRAINT "FK_travel_wallet_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "payment_transaction" ADD CONSTRAINT "FK_payment_transaction_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment_transaction" DROP CONSTRAINT "FK_payment_transaction_user"`);
    await queryRunner.query(`ALTER TABLE "travel_wallet" DROP CONSTRAINT "FK_travel_wallet_user"`);
    await queryRunner.query(`DROP TABLE "payment_transaction"`);
    await queryRunner.query(`DROP TABLE "travel_wallet"`);
    await queryRunner.query(`DROP TYPE "public"."payment_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_transaction_method_enum"`);
  }
}