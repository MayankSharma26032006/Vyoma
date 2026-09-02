import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HabitationsPage from "./pages/HabitationsPage.jsx";
import HabitationDetailPage from "./pages/HabitationDetailPage.jsx";
import PriorityPage from "./pages/PriorityPage.jsx";
import SitesPage from "./pages/SitesPage.jsx";
import CapacityPage from "./pages/CapacityPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import LogoutPage from "./pages/LogoutPage.jsx";
import { SelectionProvider } from "./context/SelectionContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
    <SelectionProvider>
    <div className="flex h-screen overflow-hidden font-body-md">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/villages" element={<HabitationsPage />} />
          <Route path="/villages/:id" element={<HabitationDetailPage />} />
          <Route path="/priority" element={<PriorityPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/capacity" element={<CapacityPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </div>
    </div>
    </SelectionProvider>
    </QueryClientProvider>
  );
}
