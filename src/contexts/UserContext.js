import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/axios";
import { useSupabaseAuth } from "./SupabaseAuthContext";

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          const { data } = await api.get("/user/profile");
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (!isLoading) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
