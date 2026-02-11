import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../lib/cn';

export function BreachModal({
  open,
  onOpenChange,
  title,
  children,
  className
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={cn(
              'fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stroke bg-bg1 p-5 shadow-lift',
              className
            )}
          >
            {title ? <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title> : null}
            <div className="mt-3">{children}</div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
