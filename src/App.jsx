import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HabitationsPage from "./pages/HabitationsPage.jsx";
import HabitationDetailPage from "./pages/HabitationDetailPage.jsx";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden font-body-md">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <TopBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habitations" element={<HabitationsPage />} />
          <Route path="/habitations/:id" element={<HabitationDetailPage />} />
        </Routes>
      </div>
    </div>
  );
}
