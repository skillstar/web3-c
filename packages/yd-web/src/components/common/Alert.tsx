'use client'  

import { useEffect } from 'react';  

export type AlertType = 'info' | 'success' | 'warning' | 'error';  

export interface AlertProps {  
  type: AlertType;  
  message: string;  
  show: boolean;  
  onClose: () => void;  
  autoClose?: boolean;  
  duration?: number;  
}  

const icons = {  
  error: (  
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">  
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />  
    </svg>  
  ),  
  success: (  
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">  
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />  
    </svg>  
  ),  
  warning: (  
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">  
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />  
    </svg>  
  ),  
  info: (  
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">  
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />  
    </svg>  
  )  
};  

export default function Alert({   
  type,   
  message,   
  show,   
  onClose,   
  autoClose = true,   
  duration = 3000   
}: AlertProps) {  
  useEffect(() => {  
    if (show && autoClose) {  
      const timer = setTimeout(() => {  
        onClose();  
      }, duration);  
      
      return () => clearTimeout(timer);  
    }  
  }, [show, autoClose, duration, onClose]);  

  if (!show) return null;  

  return (  
    <div className="fixed top-4 right-4 z-50 w-96 shadow-lg animate-fade-in">  
      <div className={`alert ${  
        type === 'error' ? 'alert-error' :   
        type === 'success' ? 'alert-success' :  
        type === 'warning' ? 'alert-warning' :  
        'alert-info'  
      } shadow-lg`}>  
        <div className="flex items-center justify-between w-full">  
          <div className="flex items-center gap-2">  
            {icons[type]}  
            <span>{message}</span>  
          </div>  
          <button   
            onClick={onClose}   
            className="btn btn-ghost btn-sm"  
          >  
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">  
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />  
            </svg>  
          </button>  
        </div>  
      </div>  
    </div>  
  );  
}