import { ConfigService } from '@nestjs/config';
import {
  LocalDisk,
  type StorageModuleOptions,
} from '@nestjs/storage';
import { join } from 'node:path';

export function createStorageOptions(
  config: ConfigService,
): StorageModuleOptions {
  const appUrl =
    config.get<string>('APP_URL') ?? 'http://localhost:3000';

  const uploadRoot =
    config.get<string>('UPLOAD_ROOT') ?? 'uploads';

  const signingKey = config.getOrThrow<string>(
    'STORAGE_SIGNING_KEY',
  );

  return {
    default: 'reports',

    disks: {
      reports: new LocalDisk({
        root: join(process.cwd(), uploadRoot, 'reports'),
        signedUrls: {
          baseUrl: `${appUrl}/files/reports`,
          keys: [signingKey],
        },
      }),

      profilePhotos: new LocalDisk({
        root: join(process.cwd(), uploadRoot, 'photos'),
      }),
    },
  };
}