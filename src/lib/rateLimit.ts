import { format } from "date-fns";
import Usage from "@/models/Usage";
import { connectDB } from "@/lib/db";

const LIMIT = 10;

export async function checkRateLimit(userId: string) {
  await connectDB();

  const date = format(new Date(), "yyyy-MM-dd");
  let usage = await Usage.findOne({ userId, date });

  if (!usage) {
    usage = await Usage.create({ userId, date, count: 1 });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (usage.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  usage.count += 1;
  await usage.save();

  return { allowed: true, remaining: LIMIT - usage.count };
}
