import { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class UserOtp1789976898684 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'Otps',
                columns: [
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '300',
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: 'otp_hash',
                        type: 'varchar',
                        length: '64',
                        isNullable: false,
                    },
                    {
                        name: 'user_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: true,
                    },
                    {
                        name: 'resend_count',
                        type: 'int',
                        unsigned: true,
                        isNullable: false,
                        default: '0',
                    },
                    {
                        name: 'daily_count_reset_at',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'daily_resend_count',
                        type: 'int',
                        unsigned: true,
                        default: '0',
                        isNullable: false,
                    },
                    {
                        name: 'next_resend_at',
                        type: 'datetime',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'expires_at',
                        type: 'datetime',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ['user_id'],
                        referencedTableName: 'User',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    }),
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('Otps');
    }
}

