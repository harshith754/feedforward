export const UserRole = {
  MANAGER: "manager",
  DEVELOPER: "developer",
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type User = {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  rating?: number | null;
  manager?: User | null;
};
