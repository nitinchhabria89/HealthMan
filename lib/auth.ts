import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import type { Role } from "./types";

type AppUser = {
  email: string;
  name: string;
  passHash: string;
  role: Role;
};

function getUsers(): AppUser[] {
  return [
    {
      email: process.env.EMAIL_NITIN || "",
      name: "Nitin",
      passHash: process.env.PASS_NITIN || "",
      role: "owner",
    },
    {
      email: process.env.EMAIL_SPOUSE || "",
      name: "Spouse",
      passHash: process.env.PASS_SPOUSE || "",
      role: "owner",
    },
    {
      email: process.env.EMAIL_DOCTOR || "",
      name: "Doctor",
      passHash: process.env.PASS_DOCTOR || "",
      role: "readonly",
    },
  ];
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = getUsers().find(
          (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
        );
        if (!user || !user.passHash) return null;

        const valid = await bcrypt.compare(password, user.passHash);
        if (!valid) return null;

        return {
          id: user.email,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

// Doctor is read-only and views Nitin's data only.
export function getDataOwnerEmail(sessionUser: { email: string; role: Role }): string {
  if (sessionUser.role === "readonly") {
    return process.env.EMAIL_NITIN || sessionUser.email;
  }
  return sessionUser.email;
}
