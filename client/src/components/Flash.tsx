import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type FlashType = 'success' | 'error' | 'info';

interface FlashState {
  message: string;
  type: FlashType;
}

interface FlashContextType {
  flash: (message: string, type: FlashType) => void;
  clear: () => void;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

export function FlashProvider({ children }: { children: ReactNode }) {
  const [flashState, setFlashState] = useState<FlashState | null>(null);

  const flash = useCallback((message: string, type: FlashType) => {
    setFlashState({ message, type });
  }, []);

  const clear = useCallback(() => {
    setFlashState(null);
  }, []);

  useEffect(() => {
    if (flashState) {
      const timer = setTimeout(() => {
        clear();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [flashState, clear]);

  return (
    <FlashContext.Provider value={{ flash, clear }}>
      {children}
      {flashState && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-down">
          <div className={`px-6 py-4 rounded-lg shadow-lg text-white font-medium flex items-center justify-between min-w-[300px] ${
            flashState.type === 'success' ? 'bg-green-600' :
            flashState.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            <span>{flashState.message}</span>
            <button onClick={clear} className="ml-4 hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>
      )}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error('useFlash must be used within a FlashProvider');
  }
  return context;
}
