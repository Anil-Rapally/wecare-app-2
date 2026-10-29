import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandReportFileData1791289524000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // No operation required.
    // Report files are now stored in local storage.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No operation required.
  }
}