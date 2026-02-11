import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { tg } from '../lib/telegram';
import { loginWithTelegram } from '../lib/auth';
import { BreachButton } from '../components/ui/BreachButton';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState } from '../components/ui/BreachStates';
import { useToast } from '../components/ui/BreachToast';

export default function Profile() {
  const toast = useToast();
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<any>('/me'),
    retry: false
  });

  const tgUser = tg?.initDataUnsafe?.user;

  const handleLogin = async () => {
    try {
      await loginWithTelegram();
      toast.push('Telegram verified', 'success');
      meQuery.refetch();
    } catch (err) {
      toast.push('Telegram verification failed', 'error');
    }
  };

  const handleDiscordConnect = () => {
    apiFetch<{ url: string }>('/auth/discord/url').then((res) => {
      if (res.url) window.location.href = res.url;
    });
  };

  const handleDiscordDisconnect = async () => {
    await apiFetch('/auth/discord/disconnect', { method: 'POST' });
    toast.push('Discord disconnected', 'success');
    meQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <BreachCard className="space-y-2">
        <div className="text-lg font-semibold">Telegram</div>
        <div className="text-sm text-text1">
          {tgUser ? `@${tgUser.username || tgUser.first_name}` : 'Open in Telegram to load user.'}
        </div>
        <BreachButton variant="subtle" onClick={handleLogin}>
          Verify Telegram
        </BreachButton>
      </BreachCard>

      <BreachCard className="space-y-2">
        <div className="text-lg font-semibold">Account</div>
        {meQuery.isLoading ? (
          <BreachSkeleton className="h-16" />
        ) : meQuery.isError ? (
          <BreachErrorState title="Not authenticated" description="Verify Telegram to unlock profile." />
        ) : (
          <div className="space-y-1 text-sm text-text1">
            <div>User: {meQuery.data?.user?.username || 'Unknown'}</div>
            <div>Discord: {meQuery.data?.user?.discordUsername || 'Not linked'}</div>
            <div>Role: {meQuery.data?.isAdmin ? 'Admin' : 'User'}</div>
            {meQuery.data?.user?.discordId ? (
              <BreachButton variant="ghost" onClick={handleDiscordDisconnect}>
                Disconnect Discord
              </BreachButton>
            ) : (
              <BreachButton variant="primary" onClick={handleDiscordConnect}>
                Connect Discord
              </BreachButton>
            )}
          </div>
        )}
      </BreachCard>
    </div>
  );
}
