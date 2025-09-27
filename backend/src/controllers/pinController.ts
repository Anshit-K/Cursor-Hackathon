import { Request, Response } from 'express';
import { CreatePinSchema } from '../types/pin';
import { pinService } from '../services/pinService';

export const createPin = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received pin data:', JSON.stringify(req.body, null, 2));
    const validatedData = CreatePinSchema.parse(req.body);
    console.log('Parsed pin data:', validatedData);
    const pin = await pinService.createPin(validatedData);
    
    res.status(201).json({
      success: true,
      data: pin
    });
  } catch (error) {
    console.error('Error creating pin:', error);
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

export const getAllPins = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pins = await pinService.getAllPins();
    
    res.status(200).json({
      success: true,
      data: pins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

