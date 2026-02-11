import { Link } from 'react-router-dom';
import { BreachCard } from '../../components/ui/BreachCard';
import { AdminGuard } from '../../components/admin/AdminGuard';

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="space-y-3">
        <BreachCard>
          <div className="text-lg font-semibold">Admin</div>
          <div className="text-sm text-text1">Manage news, patch notes, sources, and servers.</div>
        </BreachCard>
        <div className="grid gap-3 md:grid-cols-2">
          <Link to="/admin/news">
            <BreachCard className="space-y-1">
              <div className="text-sm font-semibold">News</div>
              <div className="text-xs text-text1">Create, publish, pin.</div>
            </BreachCard>
          </Link>
          <Link to="/admin/patchnotes">
            <BreachCard className="space-y-1">
              <div className="text-sm font-semibold">Patch Notes</div>
              <div className="text-xs text-text1">Markdown updates.</div>
            </BreachCard>
          </Link>
          <Link to="/admin/sources">
            <BreachCard className="space-y-1">
              <div className="text-sm font-semibold">Sources</div>
              <div className="text-xs text-text1">Workshop + Collections.</div>
            </BreachCard>
          </Link>
          <Link to="/admin/servers">
            <BreachCard className="space-y-1">
              <div className="text-sm font-semibold">Servers</div>
              <div className="text-xs text-text1">Monitoring targets.</div>
            </BreachCard>
          </Link>
        </div>
      </div>
    </AdminGuard>
  );
}
