import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/cn';
import React from 'react';

const variants = {
  primary: 'bg-acc0 text-bg0 shadow-soft hover:shadow-lift',
  ghost: 'bg-transparent text-text0 border border-stroke',
  subtle: 'bg-bg2 text-text0 border border-stroke',
  danger: 'bg-danger text-bg0'
};

type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
>;

export type BreachButtonProps = HTMLMotionProps<'button'> &
  NativeButtonProps & {
  variant?: keyof typeof variants;
  loading?: boolean;
};

export function BreachButton({
  variant = 'primary',
  loading,
  className,
  disabled,
  children,
  ...props
}: BreachButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        variant === 'primary' && 'shadow-[0_0_24px_var(--acc-2)]',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg0 border-t-transparent" /> : null}
      {children}
    </motion.button>
  );
}
