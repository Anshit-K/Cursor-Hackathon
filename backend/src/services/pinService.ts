import { Pin, CreatePinRequest } from '../types/pin';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

class PinService {
  private readonly dataFilePath = path.join(process.cwd(), 'data', 'memories.json');

  constructor() {
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.dataFilePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  private async readMemoriesFromFile(): Promise<Pin[]> {
    try {
      const data = await fs.readFile(this.dataFilePath, 'utf-8');
      const memories = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return memories.map((memory: any) => ({
        ...memory,
        timestamp: new Date(memory.timestamp)
      }));
    } catch (error) {
      // File doesn't exist or is empty, return empty array
      return [];
    }
  }

  private async writeMemoriesToFile(memories: Pin[]): Promise<void> {
    await this.ensureDataDirectory();
    await fs.writeFile(this.dataFilePath, JSON.stringify(memories, null, 2), 'utf-8');
  }

  async createPin(pinData: CreatePinRequest): Promise<Pin> {
    const pin: Pin = {
      id: uuidv4(),
      lat: pinData.lat,
      lng: pinData.lng,
      story: pinData.story,
      placeName: pinData.placeName,
      imagePath: pinData.imagePath,
      timestamp: new Date()
    };

    const existingMemories = await this.readMemoriesFromFile();
    existingMemories.unshift(pin); // Add to beginning
    await this.writeMemoriesToFile(existingMemories);
    
    return pin;
  }

  async getAllPins(): Promise<Pin[]> {
    const memories = await this.readMemoriesFromFile();
    return memories.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getPinById(id: string): Promise<Pin | null> {
    const memories = await this.readMemoriesFromFile();
    return memories.find(memory => memory.id === id) || null;
  }


  async deletePin(id: string): Promise<boolean> {
    const memories = await this.readMemoriesFromFile();
    const initialLength = memories.length;
    const filteredMemories = memories.filter(memory => memory.id !== id);
    
    if (filteredMemories.length < initialLength) {
      await this.writeMemoriesToFile(filteredMemories);
      return true;
    }
    
    return false;
  }
}

export const pinService = new PinService();
