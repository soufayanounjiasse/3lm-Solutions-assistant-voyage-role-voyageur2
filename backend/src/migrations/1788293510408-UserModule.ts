import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserModule1788293510408 implements MigrationInterface {
  name = 'UserModule1788293510408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_langue_enum" AS ENUM('FR', 'EN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_statut_enum" AS ENUM('ACTIF', 'SUSPENDU')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_identity_provider_enum" AS ENUM('GOOGLE', 'APPLE', 'FACEBOOK')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_preference_type_voyage_enum" AS ENUM('AFFAIRES', 'TOURISME', 'FAMILLE', 'ETUDIANT')`,
    );

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying,
        "telephone" character varying,
        "password_hash" character varying,
        "prenom" character varying NOT NULL,
        "nom" character varying NOT NULL,
        "photo_url" character varying,
        "langue" "public"."user_langue_enum" NOT NULL DEFAULT 'FR',
        "statut" "public"."user_statut_enum" NOT NULL DEFAULT 'ACTIF',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_user_contact" CHECK ("email" IS NOT NULL OR "telephone" IS NOT NULL)
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_email" ON "user" ("email") WHERE "email" IS NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_telephone" ON "user" ("telephone") WHERE "telephone" IS NOT NULL`);
    await queryRunner.query(`
      INSERT INTO "user" ("id", "email", "prenom", "nom")
      SELECT DISTINCT "user_id", 'legacy-' || "user_id" || '@invalid.local', 'Utilisateur', 'Importe'
      FROM "voyage"
      WHERE "user_id" IS NOT NULL
      ON CONFLICT ("id") DO NOTHING
    `);

    await queryRunner.query(`
      CREATE TABLE "user_identity" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "provider" "public"."user_identity_provider_enum" NOT NULL,
        "provider_user_id" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_identity_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_identity_provider" UNIQUE ("provider", "provider_user_id"),
        CONSTRAINT "FK_user_identity_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_preference" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "budget_min" numeric(12,2),
        "budget_max" numeric(12,2),
        "centres_interet" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "type_voyage" "public"."user_preference_type_voyage_enum",
        CONSTRAINT "PK_user_preference_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_preference_user" UNIQUE ("user_id"),
        CONSTRAINT "CHK_user_preference_budget" CHECK ("budget_min" IS NULL OR "budget_max" IS NULL OR "budget_min" <= "budget_max"),
        CONSTRAINT "FK_user_preference_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "password_reset_token" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "used_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_token_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_password_reset_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "FK_password_reset_token_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_password_reset_token_user" ON "password_reset_token" ("user_id")`);

    await queryRunner.query(
      `ALTER TABLE "voyage" ADD CONSTRAINT "FK_voyage_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "voyage" DROP CONSTRAINT "FK_voyage_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_token_user"`);
    await queryRunner.query(`DROP TABLE "password_reset_token"`);
    await queryRunner.query(`DROP TABLE "user_preference"`);
    await queryRunner.query(`DROP TABLE "user_identity"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_telephone"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_email"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_preference_type_voyage_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_identity_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_statut_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_langue_enum"`);
  }
}