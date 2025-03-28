import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

type LoginContextType = {
  currentUser: string | null;
  login: (name: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error("useLogin deve ser usado dentro de um LoginProvider");
  }
  return context;
};

export const LoginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useEffect(() => {
    // Load user from localStorage on initial render
    const savedUser = localStorage.getItem("current_user");
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);
  
  const login = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem("current_user", name);
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("current_user");
  };
  
  return (
    <LoginContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      isLoggedIn: currentUser !== null 
    }}>
      {children}
    </LoginContext.Provider>
  );
};
