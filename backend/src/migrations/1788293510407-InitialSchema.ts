import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788293510407 implements MigrationInterface {
    name = 'InitialSchema1788293510407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reservation_type_enum" AS ENUM('VOL', 'HOTEL', 'AUTRE')`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_statut_enum" AS ENUM('CONFIRMEE', 'EN_ATTENTE', 'ANNULEE')`);
        await queryRunner.query(`CREATE TABLE "reservation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "voyage_id" uuid NOT NULL, "type" "public"."reservation_type_enum" NOT NULL, "fournisseur" character varying NOT NULL, "reference" character varying NOT NULL, "statut" "public"."reservation_statut_enum" NOT NULL DEFAULT 'EN_ATTENTE', "date_debut" TIMESTAMP NOT NULL, "date_fin" TIMESTAMP, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."voyage_statut_enum" AS ENUM('A_VENIR', 'EN_COURS', 'PASSE', 'ANNULE')`);
        await queryRunner.query(`CREATE TABLE "voyage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "destination" character varying NOT NULL, "date_debut" date NOT NULL, "date_fin" date NOT NULL, "statut" "public"."voyage_statut_enum" NOT NULL DEFAULT 'A_VENIR', "archived_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b1c94a580f8750873bc11952032" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."document_type_enum" AS ENUM('PASSEPORT', 'VISA', 'BILLET', 'VOUCHER', 'AUTRE')`);
        await queryRunner.query(`CREATE TABLE "document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "voyage_id" uuid NOT NULL, "type" "public"."document_type_enum" NOT NULL, "nom_fichier" character varying NOT NULL, "url_s3" character varying NOT NULL, "date_ajout" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_5fe3879f1352108a793e64715f7" FOREIGN KEY ("voyage_id") REFERENCES "voyage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_52faa74943fae0026178fbaaef9" FOREIGN KEY ("voyage_id") REFERENCES "voyage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_52faa74943fae0026178fbaaef9"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_5fe3879f1352108a793e64715f7"`);
        await queryRunner.query(`DROP TABLE "document"`);
        await queryRunner.query(`DROP TYPE "public"."document_type_enum"`);
        await queryRunner.query(`DROP TABLE "voyage"`);
        await queryRunner.query(`DROP TYPE "public"."voyage_statut_enum"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_statut_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_type_enum"`);
    }

}
