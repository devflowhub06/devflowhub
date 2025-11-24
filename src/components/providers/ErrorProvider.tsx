'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorContextType {
  errors: ErrorState[];
  addError: (error: ErrorState) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

interface ErrorState {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  details?: string;
  stack?: string;
  component?: string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: React.ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<ErrorState[]>([]);

  const addError = (error: ErrorState) => {
    setErrors(prev => [...prev, error]);
    
    // Show toast notification
    toast.error(error.message, {
      description: error.details,
      duration: 5000,
      action: {
        label: 'Details',
        onClick: () => {
          // You could open a modal with full error details
          console.error('Full error details:', error);
        },
      },
    });

    // Auto-remove error after 10 seconds
    setTimeout(() => {
      removeError(error.id);
    }, 10000);
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  // Global error handler for unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error: ErrorState = {
        id: `global-${Date.now()}`,
        message: event.message || 'An unexpected error occurred',
        type: 'error',
        timestamp: new Date(),
        details: `File: ${event.filename}, Line: ${event.lineno}`,
        stack: event.error?.stack,
      };
      
      addError(error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ErrorState = {
        id: `promise-${Date.now()}`,
        message: 'Unhandled promise rejection',
        type: 'error',
        timestamp: new Date(),
        details: event.reason?.toString(),
        stack: event.reason?.stack,
      };
      
      addError(error);
    };

    // Listen for global errors
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Listen for custom error events
    const handleCustomError = (event: CustomEvent) => {
      const { message, error, errorInfo } = event.detail;
      
      const errorState: ErrorState = {
        id: `custom-${Date.now()}`,
        message: message || 'Custom error occurred',
        type: 'error',
        timestamp: new Date(),
        details: errorInfo,
        stack: error?.stack,
      };
      
      addError(errorState);
    };

    window.addEventListener('show-error', handleCustomError as EventListener);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('show-error', handleCustomError as EventListener);
    };
  }, []);

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      {/* Error Notification Panel */}
      <ErrorNotificationPanel errors={errors} removeError={removeError} />
    </ErrorContext.Provider>
  );
}

// Error notification panel component
function ErrorNotificationPanel({ 
  errors, 
  removeError 
}: { 
  errors: ErrorState[]; 
  removeError: (id: string) => void; 
}) {
  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map(error => (
        <div
          key={error.id}
          className={`
            p-4 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right-full
            ${error.type === 'error' ? 'bg-red-50 border-red-500' : ''}
            ${error.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : ''}
            ${error.type === 'info' ? 'bg-blue-50 border-blue-500' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                error.type === 'error' ? 'text-red-500' : 
                error.type === 'warning' ? 'text-yellow-500' : 
                'text-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {error.message}
                </p>
                {error.details && (
                  <p className="text-xs text-gray-600 mt-1">
                    {error.details}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {error.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeError(error.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to create error states
export function createError(
  message: string,
  type: ErrorState['type'] = 'error',
  details?: string,
  component?: string
): ErrorState {
  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    message,
    type,
    timestamp: new Date(),
    details,
    component,
  };
}

// Hook for handling async operations
export function useAsyncError() {
  const { addError } = useError();

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string,
    component?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      const errorState = createError(
        errorMessage || (error instanceof Error ? error.message : 'Async operation failed'),
        'error',
        error instanceof Error ? error.stack : undefined,
        component
      );
      
      addError(errorState);
      return null;
    }
  };

  return { handleAsyncError };
}
