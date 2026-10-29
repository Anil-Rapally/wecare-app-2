import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportShares1793267368195
  implements MigrationInterface
{
  name = 'CreateReportShares1793267368195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`report_share\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`report_id\` int NULL,
        \`collection_id\` int NULL,
        \`permission\` varchar(20) NOT NULL DEFAULT 'VIEW_ONLY',
        \`expires_at\` datetime NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_REPORT_SHARE_REPORT_ID\` (\`report_id\`),
        INDEX \`IDX_REPORT_SHARE_COLLECTION_ID\` (\`collection_id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`report_share\`
      ADD CONSTRAINT \`FK_REPORT_SHARE_REPORT\`
      FOREIGN KEY (\`report_id\`)
      REFERENCES \`report\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`report_share\`
      ADD CONSTRAINT \`FK_REPORT_SHARE_COLLECTION\`
      FOREIGN KEY (\`collection_id\`)
      REFERENCES \`collection\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`report_share\`
      DROP FOREIGN KEY \`FK_REPORT_SHARE_COLLECTION\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`report_share\`
      DROP FOREIGN KEY \`FK_REPORT_SHARE_REPORT\`
    `);

    await queryRunner.query(`
      DROP TABLE \`report_share\`
    `);
  }
}