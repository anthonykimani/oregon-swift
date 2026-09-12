import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Profile } from "next-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface GoogleProfile extends Profile {
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_URL}/auth/signin`, {
          method: "POST",
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (data.status === 200 && data.data?.token) {
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            firstname: data.data.user.firstname,
            lastname: data.data.user.lastname,
            username: data.data.user.username,
            role: data.data.user.role,
            accessToken: data.data.token,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Persist our custom user fields (including role) for credentials
      // sign-ins; the Google branch below overwrites them from the API.
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.accessToken = (u.accessToken as string) ?? token.accessToken;
        token.user = {
          id: String(u.id ?? token.sub ?? ""),
          email: String(u.email ?? ""),
          firstname: String(u.firstname ?? ""),
          lastname: String(u.lastname ?? ""),
          username: String(u.username ?? ""),
          role: String(u.role ?? "customer"),
        };
      }

      if (account?.provider === "google") {
        const gp = profile as GoogleProfile;

        const res = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          body: JSON.stringify({
            email: gp?.email,
            firstname: gp?.given_name,
            lastname: gp?.family_name,
            username: gp?.email?.split("@")[0],
            avatar: gp?.picture,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (data.data?.token) {
          token.accessToken = data.data.token;
          token.user = data.data.user;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
};
