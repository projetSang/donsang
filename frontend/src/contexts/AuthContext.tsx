import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "../lib/utils";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  userType: "patient" | "hospital" | "admin" | null;
  login: (userData: any, token?: string) => void;
  logout: () => void;
  updateUser: (newUserData: any) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"patient" | "hospital" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    
    if (isAuth && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setUserType(parsedUser.user_type || (parsedUser.hospital_id ? "patient" : "hospital"));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: any, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    const type = userData.user_type || (userData.hospital_id ? "patient" : "hospital");
    setUserType(type);
    
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
    if (token) localStorage.setItem("token", token);
    
    // Redirect based on user type
    if (type === "admin") navigate("/admin");
    else if (type === "patient") {
      const patientSlug = slugify(userData.full_name || userData.name || "patient");
      navigate(`/Donsang/Mon-dossier/${patientSlug}`);
    } else {
      const hospitalSlug = slugify(userData.name || "hospital");
      navigate(`/Donsang/${hospitalSlug}`);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserType(null);
    localStorage.clear();
    navigate("/");
  };

  const updateUser = (newUserData: any) => {
    setUser(newUserData);
    localStorage.setItem("userData", JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, userType, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
