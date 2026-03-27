import { useEffect, useState } from "react";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";

const BarangList = ({ onEdit, onAdd }) => {
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const qBarang = query(collection(db, "barang"));
    const unsubscribeBarang = onSnapshot(qBarang, (snapshot) => {
      setBarang(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qKategori = query(collection(db, "kategori"));
    const unsubscribeKategori = onSnapshot(qKategori, (snapshot) => {
      setKategori(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeBarang();
      unsubscribeKategori();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "barang", id));
    } catch (error) {
      console.error("Error deleting barang:", error);
    }
  };

  const filteredBarang = barang.filter(b => {
    const matchesSearch = b.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === "all" || b.kategoriId === filterKategori;
    return matchesSearch && matchesKategori;
  });

  const getKategoriNama = (id) => kategori.find(k => k.id === id)?.nama || "Tanpa Kategori";

  const getKondisiColor = (kondisi) => {
    switch (kondisi) {
      case "baik": return "bg-green-100 text-green-600";
      case "rusak": return "bg-red-100 text-red-600";
      case "perlu-perbaikan": return "bg-orange-100 text-orange-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau kode barang..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl outline-none focus:ring-2 focus:ring-[#1A1A1A] transition-all text-sm"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {kategori.map(k => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 text-sm whitespace-nowrap"
        >
          <Plus size={20} />
          Tambah Barang
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-[#E5E5E5]">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kondisi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <AnimatePresence mode="popLayout">
                {filteredBarang.map((b) => (
                  <motion.tr
                    key={b.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{b.nama}</p>
                          <p className="text-xs text-gray-400 font-mono">{b.kode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600">{getKategoriNama(b.kategoriId)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold">{b.jumlah}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getKondisiColor(b.kondisi)}`}>
                        {b.kondisi.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{b.lokasi}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(b)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredBarang.length === 0 && !loading && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Search size={32} />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada barang yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarangList;
