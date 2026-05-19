import { useMemo, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { clearSession, getCurrentUser, getStoredToken, getStoredUser, loginNgo, loginVolunteer } from "../services/authService";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  async function refreshUser() {
    if (!getStoredToken()) return null;

    const currentUser = await getCurrentUser();
    if (currentUser) {
      localStorage.setItem("maai_user", JSON.stringify(currentUser));
      setUser(currentUser);
    }
    return currentUser;
  }

  async function login(credentials) {
    setLoading(true);
    try {
      const session = await loginVolunteer(credentials);
      setToken(session.token);
      setUser(session.user);
      return session;
    } finally {
      setLoading(false);
    }
  }

  async function loginNgoAccount(credentials) {
    setLoading(true);
    try {
      const session = await loginNgo(credentials);
      setToken(session.token);
      setUser(session.user);
      return session;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      loginNgoAccount,
      logout,
      refreshUser,
      loading,
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
