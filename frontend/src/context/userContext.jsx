import { createContext, useCallback, useMemo, useState } from "react";

export const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Stable identities — consumers depend on these inside effects.
  const updateUser = useCallback((userData) => setUser(userData), []);
  const clearUser = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, updateUser, clearUser }),
    [user, updateUser, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
