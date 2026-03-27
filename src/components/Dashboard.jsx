import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { 
  Package, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "motion/react";

const Dashboard = () => {
  const [barang, setBarang] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qBarang = query(collection(db, "barang"));
    const unsubscribeBarang = onSnapshot(qBarang, (snapshot) => {
      setBarang(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qPeminjaman = query(collection(db, "peminjaman"));
    const unsubscribePeminjaman = onSnapshot(qPeminjaman, (snapshot) => {
      setPeminjaman(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeBarang();
      unsubscribePeminjaman();
    };
  }, []);

  const totalBarang = barang.reduce((acc, curr) => acc + curr.jumlah, 0);
  const barangRusak = barang.filter(b => b.kondisi === "rusak").length;
  const barangDipinjam = peminjaman.filter(p => p.status === "dipinjam").reduce((acc, curr) => acc + curr.jumlah, 0);
  const barangBaik = barang.filter(b => b.kondisi === "baik").length;

  const stats = [
    { label: "Total Barang", value: totalBarang, icon: Package, color: "bg-blue-500" },
    { label: "Barang Dipinjam", value: barangDipinjam, icon: ClipboardList, color: "bg-orange-500" },
    { label: "Barang Rusak", value: barangRusak, icon: AlertTriangle, color: "bg-red-500" },
    { label: "Kondisi Baik", value: barangBaik, icon: CheckCircle2, color: "bg-green-500" },
  ];

  const chartData = [
    { name: "Baik", value: barangBaik, color: "#10B981" },
    { name: "Rusak", value: barangRusak, color: "#EF4444" },
    { name: "Perlu Perbaikan", value: barang.filter(b => b.kondisi === "perlu-perbaikan").length, color: "#F59E0B" },
  ];

  const recentPeminjaman = [...peminjaman]
    .sort((a, b) => {
      const timeA = a.tanggalPinjam?.toMillis() || 0;
      const timeB = b.tanggalPinjam?.toMillis() || 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  if (loading) return <div className="flex items-center justify-center h-64">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#E5E5E5] shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Kondisi Barang</h3>
            <div className="flex items-center gap-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-gray-500 font-medium">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-[#E5E5E5] shadow-sm"
        >
          <h3 className="text-lg font-bold mb-6">Peminjaman Terbaru</h3>
          <div className="space-y-6">
            {recentPeminjaman.length > 0 ? (
              recentPeminjaman.map((p) => (
                <div key={p.id} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    p.status === "dipinjam" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                  }`}>
                    {p.status === "dipinjam" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{p.namaPeminjam}</p>
                    <p className="text-xs text-gray-500">Meminjam {p.jumlah} barang</p>
                  </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-medium uppercase">
                        {p.tanggalPinjam?.toDate().toLocaleDateString() || "Memproses..."}
                      </p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.status === "dipinjam" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8 italic">Belum ada aktivitas peminjaman.</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-[#1A1A1A] border border-[#E5E5E5] rounded-xl hover:bg-gray-50 transition-colors">
            Lihat Semua Aktivitas
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
