import { useContext } from "react";
import { UserContext, type UserContextValue } from "../context/userContext";

/** Reads the user context, failing loudly outside the provider. */
export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside a UserProvider");
  return ctx;
};
