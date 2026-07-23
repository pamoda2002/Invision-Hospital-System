import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginRequest,
  logoutRequest,
  profileRequest,
} from "../services/authService.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  const refreshUser = async () => {
    try {
      const response = await profileRequest();
      setUser(response.user);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (payload) => {
    setAuthBusy(true);
    try {
      const response = await loginRequest(payload);
      setUser(response.user);
      return response;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setAuthBusy(true);
    try {
      await logoutRequest();
      setUser(null);
    } finally {
      setAuthBusy(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authBusy,
      login,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, authBusy]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
