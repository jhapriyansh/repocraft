import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function getUserByProviderId(providerId: string) {
  await connectDB();
  return User.findOne({ providerId });
}
