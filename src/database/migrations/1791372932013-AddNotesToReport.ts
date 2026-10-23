import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesToReport1791372932013 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            'ALTER TABLE `report` ADD COLUMN `notes` VARCHAR(500) NULL'
        )

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `report` DROP COLUMN `notes`'
        );
    }

}
