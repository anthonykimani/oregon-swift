import { User } from "../../models/user.entity";

export interface SanitizedUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  role: string;
}

export function sanitizeUser(user: User | null): SanitizedUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    role: user.role,
  };
}

export function sanitizeUsers(users: User[]): SanitizedUser[] {
  return users.map((user) => sanitizeUser(user)!);
}
