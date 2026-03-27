import { useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import BarangList from "./components/BarangList";
import BarangForm from "./components/BarangForm";
import PeminjamanList from "./components/PeminjamanList";
import PeminjamanForm from "./components/PeminjamanForm";
import KategoriList from "./components/KategoriList";
import UserManagement from "./components/UserManagement";
import { ShieldCheck, ClipboardList, Package } from "lucide-react";
import { motion } from "motion/react";
import logo from "./assets/logo.png";

const AppContent = () => {
  const { user, loading, login } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isBarangFormOpen, setIsBarangFormOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState(undefined);
  const [isPeminjamanFormOpen, setIsPeminjamanFormOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#1A1A1A] border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Memuat Aplikasi...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex bg-white overflow-hidden">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-1 bg-[#1A1A1A] p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Inventaris Sekolah Digital</h1>
          </div>

          <div className="relative z-10">
            <h2 className="text-6xl font-bold text-white leading-tight tracking-tighter">
              Kelola Sarana <br />
              <span className="text-gray-400 italic">Prasarana Sekolah</span> <br />
              Lebih Efisien.
            </h2>
            <div className="mt-12 flex gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Package size={18} />
                  <span className="text-sm font-medium">Data Barang</span>
                </div>
                <p className="text-white/40 text-xs">CRUD data barang lengkap dengan kategori dan lokasi.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60">
                  <ClipboardList size={18} />
                  <span className="text-sm font-medium">Peminjaman</span>
                </div>
                <p className="text-white/40 text-xs">Pencatatan transaksi peminjaman dan pengembalian.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60">
                  <ShieldCheck size={18} />
                  <span className="text-sm font-medium">Keamanan</span>
                </div>
                <p className="text-white/40 text-xs">Sistem login aman dengan multi-user role.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-white/30 text-xs font-medium uppercase tracking-widest">
            © 2026 Inventaris Sekolah Digital • SMK RPL Project
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-8"
          >
            <div className="text-center">
              <div className="lg:hidden w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-6">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Selamat Datang</h3>
              <p className="text-gray-500 mt-2 font-medium">Silakan login untuk mengelola inventaris sekolah.</p>
            </div>

            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-[#E5E5E5] rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-[#1A1A1A] transition-all duration-300 group shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              <span>Lanjutkan dengan Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Akses Petugas</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 leading-relaxed">
              Dengan masuk ke aplikasi, Anda menyetujui kebijakan privasi dan pengelolaan data sarana prasarana sekolah.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "barang":
        return (
          <BarangList 
            onAdd={() => {
              setEditingBarang(undefined);
              setIsBarangFormOpen(true);
            }} 
            onEdit={(b) => {
              setEditingBarang(b);
              setIsBarangFormOpen(true);
            }} 
          />
        );
      case "peminjaman":
        return <PeminjamanList onAdd={() => setIsPeminjamanFormOpen(true)} />;
      case "kategori":
        return <KategoriList />;
      case "users":
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      
      {isBarangFormOpen && (
        <BarangForm 
          barang={editingBarang} 
          onClose={() => setIsBarangFormOpen(false)} 
        />
      )}

      {isPeminjamanFormOpen && (
        <PeminjamanForm 
          onClose={() => setIsPeminjamanFormOpen(false)} 
        />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
