import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { initTelegram } from './lib/telegram';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider } from './components/ui/BreachToast';
import HomeFeed from './pages/HomeFeed';
import NewsDetails from './pages/NewsDetails';
import WorkshopList from './pages/WorkshopList';
import WorkshopDetails from './pages/WorkshopDetails';
import CollectionsList from './pages/CollectionsList';
import CollectionDetails from './pages/CollectionDetails';
import ServersList from './pages/ServersList';
import ServerDetails from './pages/ServerDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminPatchNotes from './pages/admin/AdminPatchNotes';
import AdminSources from './pages/admin/AdminSources';
import AdminServers from './pages/admin/AdminServers';

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg0 pb-24">
        <TopBar onSearch={() => setSearchOpen(true)} />
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/news/:id" element={<NewsDetails />} />
            <Route path="/workshop" element={<WorkshopList />} />
            <Route path="/workshop/:id" element={<WorkshopDetails />} />
            <Route path="/collections" element={<CollectionsList />} />
            <Route path="/collections/:id" element={<CollectionDetails />} />
            <Route path="/servers" element={<ServersList />} />
            <Route path="/servers/:id" element={<ServerDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/patchnotes" element={<AdminPatchNotes />} />
            <Route path="/admin/sources" element={<AdminSources />} />
            <Route path="/admin/servers" element={<AdminServers />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
