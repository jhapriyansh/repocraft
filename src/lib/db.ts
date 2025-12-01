import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  await mongoose.connect(uri);
  isConnected = true;
}
