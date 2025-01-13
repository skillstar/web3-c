'use client'  

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';  
import Alert, { AlertType } from '@/components/common/Alert';  

interface AlertContextType {  
  showAlert: (message: string, type: AlertType) => void;  
}  

const AlertContext = createContext<AlertContextType | undefined>(undefined);  

export function AlertProvider({ children }: { children: ReactNode }) {  
  const [alert, setAlert] = useState({  
    show: false,  
    message: '',  
    type: 'info' as AlertType  
  });  

  const showAlert = useCallback((message: string, type: AlertType) => {  
    setAlert({  
      show: true,  
      message,  
      type  
    });  
  }, []);  

  const handleClose = useCallback(() => {  
    setAlert(prev => ({ ...prev, show: false }));  
  }, []);  

  return (  
    <AlertContext.Provider value={{ showAlert }}>  
      {children}  
      <Alert  
        show={alert.show}  
        message={alert.message}  
        type={alert.type}  
        onClose={handleClose}  
      />  
    </AlertContext.Provider>  
  );  
}  

export function useAlert() {  
  const context = useContext(AlertContext);  
  if (context === undefined) {  
    throw new Error('useAlert must be used within an AlertProvider');  
  }  
  return context;  
}