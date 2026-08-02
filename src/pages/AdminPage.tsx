import React from "react";
import AdminDashboard from "../components/AdminDashboard";

interface AdminPageProps {
  displayToast: (msg: string) => void;
  refreshMenu: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function AdminPage({ displayToast, refreshMenu, isDarkMode, onToggleTheme }: AdminPageProps) {
  return (
    <AdminDashboard onShowToast={displayToast} onMenuUpdated={refreshMenu} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
  );
}
