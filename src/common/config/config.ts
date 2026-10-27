import type { DataSourceOptions } from 'typeorm';
import { UsersEntity } from '../../user/entity/users.entity';
import { UsersLogin1791350158931 } from '../../database/migrations/1791350158931-UsersLogin';
import { ExpandReportFileData1791289524000 } from '../../database/migrations/1791289524000-ExpandReportFileData';
import { AddIsArchivedToReport1792746951905 } from '../../database/migrations/1792746951905-AddIsArchivedToReport';

import { MoveReportFilesToLocalStorage1792841706147 } from '../../database/migrations/1792841706147-MoveReportFilesToLocalStorage';
import { RemoveFileDataFromReport1792996510396 } from '../../database/migrations/1792996510396-RemoveFileDataFromReport';
import { ChangeReportCollectionRelationship1791780243903 } from 'src/database/migrations/1791780243903-ChangeReportCollectionRelationship';
import { AddNotesToReport1791372932013 } from 'src/database/migrations/1791372932013-AddNotesToReport';


import { Report } from 'src/user/entity/reports.entity';
import { Collection } from 'src/user/entity/collection.entity';

export function validateEnvironment(environment: Record<string, unknown>): Record<string, unknown> {
  const result = {
    PORT: '3000',
    CORS_ORIGIN: 'http://localhost:5173',
    JWT_ISSUER: 'wecare-api',
    JWT_AUDIENCE: 'wecare-app',
    SMTP_SECURE: 'false',
    ...environment,
  } as Record<string, unknown>;
  for (const key of [
    'JWT_SECRET',
    'OTP_HMAC_SECRET',
    'JWT_ISSUER',
    'JWT_AUDIENCE',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM',
  ]) {
    if (typeof result[key] !== 'string' || !result[key].trim()) {
      throw new Error(`Set ${key} in .env before starting the API.`);
    }
  }
  for (const key of ['JWT_SECRET', 'OTP_HMAC_SECRET']) {
    if (!/^[a-f0-9]{64}$/i.test(result[key] as string)) {
      throw new Error(`${key} must be 64 random hexadecimal characters.`);
    }
  }
  if (result.JWT_SECRET === result.OTP_HMAC_SECRET) {
    throw new Error('JWT_SECRET and OTP_HMAC_SECRET must be different.');
  }
  for (const key of ['PORT', 'SMTP_PORT']) {
    const value = Number(result[key]);
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      throw new Error(`${key} must be an integer between 1 and 65535.`);
    }
  }
  if (!['true', 'false'].includes(result.SMTP_SECURE as string)) {
    throw new Error('SMTP_SECURE must be true or false.');
  }
  const origin = new URL(result.CORS_ORIGIN as string);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== result.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN must be one HTTP(S) origin without a trailing slash.');
  }
  return result;
}

export function databaseOptions(): DataSourceOptions {
  for (const key of ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE']) {
    if (!process.env[key]) throw new Error(`Set ${key} in .env.`);
  }
  const port = Number(process.env.DB_PORT ?? '3306');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid DB_PORT.');
  return {
    type: 'mysql',
    host: process.env.DB_HOST,
    port,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    entities: [UsersEntity, Report, Collection,],
    migrations: [
     UsersLogin1791350158931,
      ExpandReportFileData1791289524000,
      AddIsArchivedToReport1792746951905,
      MoveReportFilesToLocalStorage1792841706147,
      RemoveFileDataFromReport1792996510396,
      AddNotesToReport1791372932013,
      ChangeReportCollectionRelationship1791780243903,
    ],
    migrationsTableName: 'migrations',
    synchronize: false,
    migrationsRun: false,
    logging: false,
    extra: { connectionLimit: 10 },
  };
}
