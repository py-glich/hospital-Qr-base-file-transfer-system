import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management_db';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if local mongo isn't running so fallback can work smoothly
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`[MongoDB Notice] Could not connect to MongoDB server at ${MONGODB_URI} (${error.message}). Running with robust in-memory database sync.`);
    isConnected = false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
