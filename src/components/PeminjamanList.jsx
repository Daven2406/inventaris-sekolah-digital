import { useEffect, useState } from "react";
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Search, RotateCcw, Trash2, ClipboardList, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";

const PeminjamanList = ({ onAdd }) => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [barang, setBarang] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const qPeminjaman = query(collection(db, "peminjaman"));
    const unsubscribePeminjaman = onSnapshot(qPeminjaman, (snapshot) => {
      setPeminjaman(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qBarang = query(collection(db, "barang"));
    const unsubscribeBarang = onSnapshot(qBarang, (snapshot) => {
      setBarang(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribePeminjaman();
      unsubscribeBarang();
    };
  }, []);

  const handleReturn = async (p) => {
    try {
      // Update status peminjaman
      await updateDoc(doc(db, "peminjaman", p.id), {
        status: "dikembalikan",
        tanggalKembali: new Date(),
      });

      // Update stok barang
      const b = barang.find(item => item.id === p.barangId);
      if (b) {
        await updateDoc(doc(db, "barang", b.id), {
          jumlah: b.jumlah + p.jumlah,
        });
      }
    } catch (error) {
      console.error("Error returning barang:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "peminjaman", id));
    } catch (error) {
      console.error("Error deleting peminjaman:", error);
    }
  };

  const filteredPeminjaman = peminjaman.filter(p => 
    p.namaPeminjam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBarangNama = (id) => barang.find(b => b.id === id)?.nama || "Barang Tidak Ditemukan";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama peminjam..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 text-sm whitespace-nowrap"
        >
          <Plus size={20} />
          Catat Peminjaman
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-[#E5E5E5]">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Peminjam</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <AnimatePresence mode="popLayout">
                {filteredPeminjaman.map((p) => (
                  <motion.tr
                    key={p.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                          <User size={16} />
                        </div>
                        <span className="text-sm font-bold">{p.namaPeminjam}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{getBarangNama(p.barangId)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold">{p.jumlah}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">{p.tanggalPinjam?.toDate().toLocaleDateString() || "Memproses..."}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          {p.tanggalPinjam?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        p.status === "dipinjam" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === "dipinjam" && (
                          <button
                            onClick={() => handleReturn(p)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Kembalikan"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p.id)}
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
          {filteredPeminjaman.length === 0 && !loading && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <ClipboardList size={32} />
              </div>
              <p className="text-gray-500 font-medium">Belum ada data peminjaman.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeminjamanList;
