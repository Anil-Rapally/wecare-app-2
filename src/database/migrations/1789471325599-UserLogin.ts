import { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableUnique } from "typeorm";

export class UserLogin1789471325599 implements MigrationInterface {

      async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsers = await queryRunner.hasTable('users');
    if (hasUsers) {
      throw new Error(
        'Existing users has no migration history. Use new database or review migration history.',
      );
    }
    else {
      await queryRunner.createTable(
        new Table({
          name: 'User',
          columns: [
            {
              name: 'id',
              type: 'varchar',
              length: '36',
              isPrimary: true,
              isNullable: false,
            },
            {
              name: 'email',
              type: 'varchar',
              length: '300',
              isNullable: false,
            },
            {
              name: 'fullName',
              type: 'varchar',
              length: '200',
              isNullable: true,
            },
            {
              name: 'dateOfBirth',
              type: 'date',
              isNullable: true,
            },
            {
              name: 'gender',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            {
              name: 'bloodGroup',
              type: 'varchar',
              length: '3',
              isNullable: true,
            },
            {
              name: 'emergencyContact',
              type: 'varchar',
              length: '25',
              isNullable: true,
            },
            {
              name: 'address',
              type: 'varchar',
              length: '1000',
              isNullable: true,
            },
            {
              name: 'profilePhotoUrl',
              type: 'varchar',
              length: '1000',
              isNullable: true,
            },
            {
              name: 'profilePhoto',
              type: 'mediumblob',
              isNullable: true,
            },
            {
              name: 'isEmailVerified',
              type: 'tinyint',
              isNullable: false,
              default: '0',
            },
            {
              
              name: 'isProfileExists',
              type: 'tinyint',
              isNullable: false,
              default: '0',
            },
          ],
          uniques: [
            new TableUnique({
              name: 'UQ_users_email',
              columnNames: ['email'],
            }),
          ],
        }),
        true,
      );
    }
  }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('User');
    }

}
