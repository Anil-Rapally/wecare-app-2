import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsArchivedToReport1792746951905
  implements MigrationInterface
{
  name = 'AddIsArchivedToReport1792746951905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report\`
      ADD COLUMN \`is_archived\` tinyint NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report\`
      DROP COLUMN \`is_archived\`
    `);
  }
}
