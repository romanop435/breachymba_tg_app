import { BreachButton } from './BreachButton';

export function BreachEmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-stroke bg-bg1 p-6 text-center">
      <div className="text-lg font-semibold">{title}</div>
      {description ? <div className="text-sm text-text1">{description}</div> : null}
      {actionLabel && onAction ? (
        <BreachButton className="mt-2" onClick={onAction}>
          {actionLabel}
        </BreachButton>
      ) : null}
    </div>
  );
}

export function BreachErrorState({
  title,
  description,
  onRetry
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-danger/40 bg-bg1 p-6 text-center">
      <div className="text-lg font-semibold text-danger">{title}</div>
      {description ? <div className="text-sm text-text1">{description}</div> : null}
      {onRetry ? (
        <BreachButton variant="subtle" className="mt-2" onClick={onRetry}>
          Retry
        </BreachButton>
      ) : null}
    </div>
  );
}
