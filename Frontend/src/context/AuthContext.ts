
import { createContext } from "react";

export type User = {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
