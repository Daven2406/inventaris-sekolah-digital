import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter,
  Calendar,
  User,
  Package,
  CheckCircle
} from "lucide-react";
import { motion } from "motion/react";

const AktivitasList = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [barang, setBarang] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  useEffect(() => {
    // Fetch barang for mapping names
    const qBarang = query(collection(db, "barang"));
    const unsubscribeBarang = onSnapshot(qBarang, (snapshot) => {
      const barangMap = {};
      snapshot.docs.forEach(doc => {
        barangMap[doc.id] = doc.data().nama;
      });
      setBarang(barangMap);
    });

    // Fetch all activities
    const qPeminjaman = query(collection(db, "peminjaman"), orderBy("tanggalPinjam", "desc"));
    const unsubscribePeminjaman = onSnapshot(qPeminjaman, (snapshot) => {
      setPeminjaman(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeBarang();
      unsubscribePeminjaman();
    };
  }, []);

  const filteredAktivitas = peminjaman.filter(p => {
    const matchesSearch = p.namaPeminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (barang[p.barangId] || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "semua" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="flex items-center justify-center h-64">Memuat Aktivitas...</div>;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama peminjam atau barang..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus:outline-none focus:border-[#1A1A1A] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter size={18} className="text-gray-400 mr-2 shrink-0" />
          {["semua", "dipinjam", "dikembalikan"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                filterStatus === status 
                  ? "bg-[#1A1A1A] text-white shadow-lg shadow-black/10" 
                  : "bg-white text-gray-500 border border-[#E5E5E5] hover:border-[#1A1A1A]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="grid gap-4">
        {filteredAktivitas.length > 0 ? (
          filteredAktivitas.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    p.status === "dipinjam" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                  }`}>
                    {p.status === "dipinjam" ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{p.namaPeminjam}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.status === "dipinjam" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Package size={14} />
                        <span>{p.jumlah}x {barang[p.barangId] || "Barang tidak ditemukan"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{p.tanggalPinjam?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {p.status === "dikembalikan" && (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium">
                          <CheckCircle size={14} className="hidden" />
                          <span>Kembali: {p.tanggalKembali?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                   <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                     <User size={12} />
                     <span>Petugas ID: {p.petugasId?.slice(0, 8)}...</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white py-20 rounded-3xl border border-dashed border-[#E5E5E5] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Tidak ada aktivitas ditemukan</h3>
            <p className="text-gray-500 max-w-xs mt-1">Coba ubah kata kunci pencarian atau filter status Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AktivitasList;
