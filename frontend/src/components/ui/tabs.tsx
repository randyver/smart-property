'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

// Create context for tabs
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

// Tabs component
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = ({ 
  defaultValue, 
  className, 
  onValueChange, 
  children, 
  ...props 
}: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div 
        className={cn("w-full", className)} 
        data-state={value} 
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList component
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = ({ className, children, ...props }: TabsListProps) => {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 bg-gray-100 p-1 rounded-md",
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

// TabsTrigger component
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = ({ 
  className, 
  value,
  children, 
  ...props 
}: TabsTriggerProps) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-sm font-medium transition-all",
        "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isActive
          ? "bg-white text-blue-600 shadow-sm"
          : "text-gray-600 hover:text-gray-800 hover:bg-gray-200",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

// TabsContent component
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = ({ 
  className, 
  value, 
  children, 
  ...props 
}: TabsContentProps) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const isActive = context.value === value;

  if (!isActive) return null;
  
  return (
    <div
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";