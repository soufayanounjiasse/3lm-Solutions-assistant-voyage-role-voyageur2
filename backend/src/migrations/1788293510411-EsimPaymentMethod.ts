import { MigrationInterface, QueryRunner } from 'typeorm';

export class EsimPaymentMethod1788293510411 implements MigrationInterface {
  name = 'EsimPaymentMethod1788293510411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."esim_order_payment_method_enum" AS ENUM('CARD', 'MOBILE')`);
    await queryRunner.query(`ALTER TABLE "esim_order" ADD "payment_method" "public"."esim_order_payment_method_enum" NOT NULL DEFAULT 'CARD'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "esim_order" DROP COLUMN "payment_method"`);
    await queryRunner.query(`DROP TYPE "public"."esim_order_payment_method_enum"`);
  }
}