import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../lib/cn';

export function BreachDrawer({
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 rounded-t-2xl border border-stroke bg-bg1 p-5 shadow-lift',
              className
            )}
          >
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-muted" />
            {title ? <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title> : null}
            <div className="mt-3">{children}</div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
