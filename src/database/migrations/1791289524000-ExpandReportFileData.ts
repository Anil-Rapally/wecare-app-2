import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandReportFileData1791289524000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `report` MODIFY COLUMN `file_data` LONGBLOB NOT NULL',
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Cannot safely downgrade report.file_data: LONGBLOB may contain files too large for its previous column type.',
    );
  }
}
