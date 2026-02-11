import React from 'react';
import { cn } from '../../lib/cn';

export function BreachCard({
  children,
  className,
  hazard
}: {
  children: React.ReactNode;
  className?: string;
  hazard?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-stroke bg-bg1 p-4 card-lift',
        'shadow-soft',
        className
      )}
    >
      {hazard ? (
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-acc0/80 via-acc1/70 to-transparent" />
      ) : null}
      {children}
    </div>
  );
}
