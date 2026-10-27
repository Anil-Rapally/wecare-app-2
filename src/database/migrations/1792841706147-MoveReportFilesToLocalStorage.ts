import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveReportFilesToLocalStorage1792841706147
  implements MigrationInterface
{
  name = 'MoveReportFilesToLocalStorage1792841706147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report\`
      ADD COLUMN \`file_path\` varchar(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report\`
      DROP COLUMN \`file_path\`
    `);
  }
}