import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesToUsers1742126649004 implements MigrationInterface {
    name = 'AddRolesToUsers1742126649004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" text NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    }

}
