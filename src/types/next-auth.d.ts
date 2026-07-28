import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      username: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user?: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      username: string;
      role: string;
    };
  }
}
