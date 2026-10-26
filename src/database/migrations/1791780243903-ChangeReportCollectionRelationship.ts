import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeReportCollectionRelationship1791780243903
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the join table.
    await queryRunner.query(`
      CREATE TABLE \`report_collections\` (
        \`report_id\` int NOT NULL,
        \`collection_id\` int NOT NULL,
        PRIMARY KEY (\`report_id\`, \`collection_id\`),
        INDEX \`IDX_report_collections_collection_id\` (\`collection_id\`),
        CONSTRAINT \`FK_report_collections_report\`
          FOREIGN KEY (\`report_id\`)
          REFERENCES \`report\` (\`id\`)
          ON DELETE CASCADE,
        CONSTRAINT \`FK_report_collections_collection\`
          FOREIGN KEY (\`collection_id\`)
          REFERENCES \`collection\` (\`id\`)
          ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // 2. Copy existing collection assignments.
    await queryRunner.query(`
      INSERT INTO \`report_collections\` (\`report_id\`, \`collection_id\`)
      SELECT \`id\`, \`collection_id\`
      FROM \`report\`
      WHERE \`collection_id\` IS NOT NULL
    `);

    // 3. Remove the old foreign key.
    await queryRunner.query(`
      ALTER TABLE \`report\`
      DROP FOREIGN KEY \`FK_10293e4d32d96736b6c63ab1d8e\`
    `);

    // 4. Remove the old index.
    await queryRunner.query(`
      ALTER TABLE \`report\`
      DROP INDEX \`FK_10293e4d32d96736b6c63ab1d8e\`
    `);

    // 5. Remove the old relationship column.
    await queryRunner.query(`
      ALTER TABLE \`report\`
      DROP COLUMN \`collection_id\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the old relationship column.
    await queryRunner.query(`
      ALTER TABLE \`report\`
      ADD COLUMN \`collection_id\` int NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`report\`
      ADD INDEX \`FK_10293e4d32d96736b6c63ab1d8e\` (\`collection_id\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`report\`
      ADD CONSTRAINT \`FK_10293e4d32d96736b6c63ab1d8e\`
      FOREIGN KEY (\`collection_id\`)
      REFERENCES \`collection\` (\`id\`)
    `);

    // Restore one collection assignment per report.
    // The old relationship supported only one collection per report.
    await queryRunner.query(`
      UPDATE \`report\` r
      INNER JOIN (
        SELECT \`report_id\`, MIN(\`collection_id\`) AS \`collection_id\`
        FROM \`report_collections\`
        GROUP BY \`report_id\`
      ) rc ON rc.\`report_id\` = r.\`id\`
      SET r.\`collection_id\` = rc.\`collection_id\`
    `);

    await queryRunner.query(`
      DROP TABLE \`report_collections\`
    `);
  }
}