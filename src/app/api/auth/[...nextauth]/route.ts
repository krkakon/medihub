import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password } = credentials;

        // 1. Fallback for demo logins (works without DB connection)
        if (password === "demo1234") {
          if (email === "m.sarker@ideshi.org") {
            return {
              id: "demo-buyer-id",
              name: "Manos Sarker",
              email: "m.sarker@ideshi.org",
              role: "BUYER",
              institutionName: "ideSHi",
              designation: "Sr. Research Officer"
            };
          }
          if (email === "sales@genetica.com.bd") {
            return {
              id: "demo-seller-id",
              name: "Genetica Sales",
              email: "sales@genetica.com.bd",
              role: "SELLER",
              institutionName: "Genetica Ltd.",
              designation: "Sales Director"
            };
          }
        }

        // 2. Real Database lookup (when DATABASE_URL is active)
        try {
          const user = await db.user.findUnique({
            where: { email }
          });

          if (user && verifyPassword(password, user.passwordHash)) {
            return {
              id: user.id,
              name: user.institutionName ? `${user.designation} at ${user.institutionName}` : user.email,
              email: user.email,
              role: user.role,
              institutionName: user.institutionName,
              designation: user.designation
            };
          }
        } catch (error) {
          console.warn("Database lookup failed, falling back to mock authentication details.");
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.institutionName = (user as any).institutionName;
        token.designation = (user as any).designation;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).institutionName = token.institutionName;
        (session.user as any).designation = token.designation;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/buyer/login"
  },
  secret: process.env.NEXTAUTH_SECRET || "medihub-secret-key-12345678"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
