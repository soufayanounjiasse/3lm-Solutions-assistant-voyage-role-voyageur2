import { MigrationInterface, QueryRunner } from 'typeorm';

export class TravelWallet1788293510413 implements MigrationInterface {
  name = 'TravelWallet1788293510413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "esim_order" ADD COLUMN "voyage_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "esim_order" ADD CONSTRAINT "FK_esim_order_voyage" FOREIGN KEY ("voyage_id") REFERENCES "voyage"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_esim_order_voyage_id" ON "esim_order" ("voyage_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_esim_order_voyage_id"`);
    await queryRunner.query(
      `ALTER TABLE "esim_order" DROP CONSTRAINT "FK_esim_order_voyage"`,
    );
    await queryRunner.query(`ALTER TABLE "esim_order" DROP COLUMN "voyage_id"`);
  }
}
