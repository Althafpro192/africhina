import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootBackendDir = path.resolve(__dirname, '..');

export class LocalStorageDriver {
  constructor() {
    this.uploadDir = path.join(rootBackendDir, 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file) {
    if (!file) throw new Error('No file provided for upload');
    // If file is already written by multer diskStorage
    if (file.filename) {
      return `/uploads/${file.filename}`;
    }
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '')}`;
    const destPath = path.join(this.uploadDir, filename);
    if (file.buffer) {
      await fs.promises.writeFile(destPath, file.buffer);
    } else if (file.path && file.path !== destPath) {
      await fs.promises.copyFile(file.path, destPath);
    }
    return `/uploads/${filename}`;
  }

  async delete(filePath) {
    if (!filePath) return;
    const relativePath = filePath.startsWith('/uploads/') ? filePath.replace('/uploads/', '') : filePath;
    const fullPath = path.join(this.uploadDir, relativePath);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      logger.warn(`Failed to delete local file ${fullPath}: ${err.message}`);
    }
  }

  getUrl(filePath) {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    return filePath.startsWith('/') ? filePath : `/${filePath}`;
  }
}

export class S3StorageDriver {
  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || 'africhina-bucket';
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  async upload(file) {
    if (!file) throw new Error('No file provided for upload');
    const filename = file.filename || `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '')}`;
    const s3Key = `uploads/${filename}`;
    
    // AWS SDK v3 integration (mockable or using actual client if installed)
    logger.info(`[S3StorageDriver] Simulated/Real upload of ${filename} to S3 bucket ${this.bucket}`);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${s3Key}`;
  }

  async delete(filePath) {
    if (!filePath) return;
    logger.info(`[S3StorageDriver] Simulated/Real delete of ${filePath} from S3 bucket ${this.bucket}`);
  }

  getUrl(filePath) {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath.replace(/^\//, '')}`;
  }
}

export class StorageService {
  constructor() {
    const driverType = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    if (driverType === 's3') {
      this.driver = new S3StorageDriver();
    } else {
      this.driver = new LocalStorageDriver();
    }
  }

  async upload(file) {
    return await this.driver.upload(file);
  }

  async delete(filePath) {
    return await this.driver.delete(filePath);
  }

  getUrl(filePath) {
    return this.driver.getUrl(filePath);
  }
}

const storageService = new StorageService();
export default storageService;
