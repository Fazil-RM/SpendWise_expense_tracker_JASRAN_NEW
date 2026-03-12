import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Alert from "./ui/alert";
import { AnimatePresence } from "framer-motion";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((type: AlertType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 5000);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-80">
        <AnimatePresence>
          {alerts.map((alert) => (
            <div key={alert.id} className="cursor-pointer">
              <Alert
                type={alert.type}
                message={alert.message}
                onClick={() => removeAlert(alert.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
};
