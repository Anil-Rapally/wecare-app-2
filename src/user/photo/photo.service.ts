import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { I18nService } from 'nestjs-i18n';

export const max_photo_bytes = 2 * 1024 * 1024;

@Injectable()
export class PhotoService {
  constructor(
    private readonly i18n: I18nService,
  ) { }
  async check_photo(buffer: Buffer): Promise<Buffer> {
    if (!buffer?.length || buffer.length > max_photo_bytes) {
      throw new BadRequestException(this.i18n.t('validation.upload_photo_size'));
    }
    try {
      const image = sharp(buffer, { limitInputPixels: 16_000_000, failOn: 'error' });
      const metadata = await image.metadata();
      if (
        !metadata.format ||
        !['jpeg', 'png', 'webp'].includes(metadata.format) ||
        (metadata.pages ?? 1) > 1
      )
        throw new BadRequestException(this.i18n.t('validation.unsupported_image'));
      // Decode actual bytes, correct orientation, resize, and drop EXIF metadata.
      return await image
        .rotate()
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException(this.i18n.t('validation.upload_photo_format'));
    }
  }
}
