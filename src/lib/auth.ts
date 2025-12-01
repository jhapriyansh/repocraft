import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        await connectDB();
        const providerId = (profile as any).id?.toString();
        token.providerId = providerId;
        token.accessToken = account.access_token;

        await User.findOneAndUpdate(
          { providerId },
          {
            providerId,
            email: (profile as any).email,
            name: (profile as any).name ?? (profile as any).login,
            avatar: (profile as any).avatar_url
          },
          { upsert: true }
        );
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).providerId = token.providerId;
      return session;
    }
  }
};
