import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEsimExternalOrderId1788999999999 implements MigrationInterface {
  name = 'AddEsimExternalOrderId1788999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "esim_order" ADD COLUMN "external_order_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "esim_order" DROP COLUMN "external_order_id"`);
  }
}