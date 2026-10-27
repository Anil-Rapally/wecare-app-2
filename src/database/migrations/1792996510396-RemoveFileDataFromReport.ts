import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFileDataFromReport1792996510396 implements MigrationInterface {
    name = 'RemoveFileDataFromReport1792996510396'

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report\`
      DROP COLUMN \`file_data\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report\`
      ADD COLUMN \`file_data\` longblob NULL
    `);
  }

}
