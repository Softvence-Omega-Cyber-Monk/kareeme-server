import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) {
      throw new InternalServerErrorException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(
              new InternalServerErrorException('Cloudinary upload failed'),
            );
          }

          if (!result) {
            return reject(
              new InternalServerErrorException('No upload result found'),
            );
          }

          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }
}