import request from 'supertest';
import express from 'express';
import pinRoutes from '../routes/pinRoutes';
import { pinService } from '../services/pinService';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use('/api', pinRoutes);

describe('Pin API Endpoints', () => {
  const testDataPath = path.join(process.cwd(), 'data', 'memories.json');
  const originalDataPath = (pinService as any).dataFilePath;

  beforeEach(async () => {
    // Use a test data file for each test
    (pinService as any).dataFilePath = testDataPath;
    // Clear test data file
    try {
      await fs.writeFile(testDataPath, '[]', 'utf-8');
    } catch {
      // File doesn't exist, that's fine
    }
  });

  afterAll(async () => {
    // Restore original data path
    (pinService as any).dataFilePath = originalDataPath;
    // Clean up test file
    try {
      await fs.unlink(testDataPath);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  describe('POST /api/pins', () => {
    it('should create a new pin with valid data', async () => {
      const pinData = {
        lat: 40.7128,
        lng: -74.0060,
        story: 'This is a test story about New York City!'
      };

      const response = await request(app)
        .post('/api/pins')
        .send(pinData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        lat: pinData.lat,
        lng: pinData.lng,
        story: pinData.story
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.timestamp).toBeDefined();
    });

    it('should reject pin with invalid latitude', async () => {
      const pinData = {
        lat: 91, // Invalid latitude
        lng: -74.0060,
        story: 'This should fail'
      };

      const response = await request(app)
        .post('/api/pins')
        .send(pinData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('lat');
    });

    it('should reject pin with story too long', async () => {
      const pinData = {
        lat: 40.7128,
        lng: -74.0060,
        story: 'a'.repeat(201) // Too long
      };

      const response = await request(app)
        .post('/api/pins')
        .send(pinData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('story');
    });
  });

  describe('GET /api/pins', () => {
    it('should return empty array when no pins exist', async () => {
      const response = await request(app)
        .get('/api/pins')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all pins after creating some', async () => {
      // Create a pin first
      const pinData = {
        lat: 40.7128,
        lng: -74.0060,
        story: 'First pin story'
      };

      await request(app)
        .post('/api/pins')
        .send(pinData);

      // Get all pins
      const response = await request(app)
        .get('/api/pins')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].story).toBe('First pin story');
    });
  });
});
