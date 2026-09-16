import { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class UserOtp1789472984498 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'Otps',
                columns: [
                    {
                        name: 'otpId',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'otpHash',
                        type: 'varchar',
                        length: '64',
                        isNullable: false,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'expiresAt',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'lastSentAt',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'sendWindowStartedAt',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'sendCount',
                        type: 'int',
                        unsigned: true,
                        isNullable: false,
                        default: '0',
                    },
                    {
                        name: 'failureWindowStartedAt',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'failedAttempts',
                        type: 'int',
                        unsigned: true,
                        isNullable: false,
                        default: 0,
                    },
                    {
                        name: 'lockedUntil',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        isNullable: false,
                    },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ['userId'],
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
