import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Tags,
  School
} from "lucide-react";
import { useAuth } from "./AuthContext";

const Layout = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "petugas"] },
    { id: "barang", label: "Data Barang", icon: Package, roles: ["admin", "petugas"] },
    { id: "peminjaman", label: "Peminjaman", icon: ClipboardList, roles: ["admin", "petugas"] },
    { id: "kategori", label: "Kategori", icon: Tags, roles: ["admin"] },
    { id: "users", label: "Manajemen User", icon: Users, roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const handleTabChange = (id) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : 80,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`bg-white border-r border-[#E5E5E5] flex flex-col z-40 fixed lg:relative h-full transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
                  <School size={24} />
                </div>
                <span className="font-bold text-lg tracking-tight">Inventaris</span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white mx-auto"
              >
                <School size={20} />
              </motion.div>
            )}
          </AnimatePresence>
          {isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
            >
              <Menu size={20} />
            </button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mx-auto mb-4 hidden lg:block"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-[#1A1A1A] text-white shadow-lg shadow-black/10" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#1A1A1A]"
              }`}
            >
              <item.icon size={22} className="shrink-0" />
              {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E5E5E5]">
          <div className={`flex items-center gap-3 p-3 ${isSidebarOpen ? "" : "lg:justify-center"}`}>
            {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{profile?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] h-16 flex items-center px-4 lg:px-8 z-10 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg lg:text-xl font-bold capitalize truncate">
              {activeTab.replace("-", " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs lg:text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
