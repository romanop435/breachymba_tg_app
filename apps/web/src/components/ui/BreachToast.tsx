import React, { createContext, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export type ToastTone = 'default' | 'success' | 'error';

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      push: (message: string, tone: ToastTone = 'default') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, tone }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[260px] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={cn(
                'pointer-events-auto rounded-xl border border-stroke bg-bg1/90 px-3 py-2 text-sm shadow-lift backdrop-blur',
                toast.tone === 'success' && 'border-ok/40 text-ok',
                toast.tone === 'error' && 'border-danger/40 text-danger'
              )}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
}
