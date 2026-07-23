import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageDriver, S3StorageDriver, StorageService } from '../config/storage.js';

describe('StorageService Abstraction', () => {
  it('LocalStorageDriver uploads file and returns relative path', async () => {
    const driver = new LocalStorageDriver();
    const mockFile = {
      filename: 'test-image.png',
      originalname: 'test-image.png'
    };

    const url = await driver.upload(mockFile);
    assert.equal(url, '/uploads/test-image.png');
    assert.equal(driver.getUrl(url), '/uploads/test-image.png');
  });

  it('S3StorageDriver returns S3 URL', async () => {
    process.env.AWS_S3_BUCKET = 'africhina-bucket';
    process.env.AWS_REGION = 'us-east-1';

    const driver = new S3StorageDriver();
    const mockFile = {
      filename: 'sample-doc.pdf',
      originalname: 'sample-doc.pdf'
    };

    const url = await driver.upload(mockFile);
    assert.ok(url.includes('https://africhina-bucket.s3.us-east-1.amazonaws.com/uploads/sample-doc.pdf'));
  });

  it('StorageService delegates to configured driver', async () => {
    process.env.STORAGE_DRIVER = 'local';
    const storageService = new StorageService();
    
    const mockFile = { filename: 'avatar.jpg', originalname: 'avatar.jpg' };
    const url = await storageService.upload(mockFile);
    assert.equal(url, '/uploads/avatar.jpg');
  });
});
