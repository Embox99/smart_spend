import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@shared/types";

export interface UserContextValue {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextValue | null>(null);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Stable identities — consumers depend on these inside effects.
  const updateUser = useCallback((userData: User) => setUser(userData), []);
  const clearUser = useCallback(() => setUser(null), []);

  const value = useMemo<UserContextValue>(
    () => ({ user, updateUser, clearUser }),
    [user, updateUser, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
