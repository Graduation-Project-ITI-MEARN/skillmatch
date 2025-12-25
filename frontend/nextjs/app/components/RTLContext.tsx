// frontend/nextjs/components/RTLContext.tsx
"use client"; // This component uses React Context, so it must be a client component

import { createContext, useContext, ReactNode } from "react";

// 1. Create the Context
interface RTLContextType {
   isRTL: boolean;
}
const RTLContext = createContext<RTLContextType | undefined>(undefined);

// 2. Create a Provider Component
interface RTLProviderProps {
   children: ReactNode;
   isRTL: boolean; // This prop will come from the server-side determined `dir`
}
// REMOVED React.FC here
export const RTLProvider = ({ children, isRTL }: RTLProviderProps) => {
   return (
      <RTLContext.Provider value={{ isRTL }}>{children}</RTLContext.Provider>
   );
};

// 3. Create a Custom Hook to consume the Context
export const useRTL = (): boolean => {
   const context = useContext(RTLContext);
   if (context === undefined) {
      throw new Error("useRTL must be used within an RTLProvider");
   }
   return context.isRTL;
};

export default RTLContext;
