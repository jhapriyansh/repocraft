import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByProviderId } from "@/lib/getUserByProviderId";
import { connectDB } from "@/lib/db";
import Usage from "@/models/Usage";
import { format } from "date-fns";

const LIMIT = 10;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await getUserByProviderId(
    (session as any).providerId as string
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const date = format(new Date(), "yyyy-MM-dd");
  const usage = await Usage.findOne({ userId: user._id.toString(), date });

  const used = usage?.count ?? 0;
  const remaining = Math.max(0, LIMIT - used);

  return NextResponse.json({ used, remaining, limit: LIMIT });
}
