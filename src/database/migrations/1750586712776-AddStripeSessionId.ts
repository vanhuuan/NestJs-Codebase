import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeSessionId1750586712776 implements MigrationInterface {
    name = 'AddStripeSessionId1750586712776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "stripeSessionId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_3c155a2f6e4cab3472717315987" UNIQUE ("stripeSessionId")`);
        await queryRunner.query(`CREATE INDEX "idx_stripe_session_id" ON "subscriptions" ("stripeSessionId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_stripe_session_id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_3c155a2f6e4cab3472717315987"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "stripeSessionId"`);
    }

}
