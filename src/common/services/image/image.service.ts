import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import * as download from 'image-downloader';

@Injectable()
export class ImageService {
  async saveImage(dir: string, photo: string): Promise<string> {
    const data = photo.includes(',') ? photo.split(',')[1] : photo;
    const filename = `${Date.now()}-${randomUUID()}.jpg`;
    const targetDir = path.join('img', dir);
    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, Buffer.from(data, 'base64'));
    return `img/${dir}/${filename}`;
  }

  async saveImageBinary(dir: string, img: Buffer | string): Promise<string> {
    const filename = `${Date.now()}-${randomUUID()}.jpg`;
    const targetDir = path.join('img', dir);
    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, img, 'binary');
    return `img/${dir}/${filename}`;
  }

  async downloadImage(dir: string, url: string): Promise<string> {
    const filename = `${Date.now()}-${randomUUID()}.jpg`;
    const targetDir = path.join(path.resolve('./'), 'img', dir);
    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, filename);
    await download.image({
      url,
      dest: filePath,
    });
    return `img/${dir}/${filename}`;
  }

  async removeImage(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
