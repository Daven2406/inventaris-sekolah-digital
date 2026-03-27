import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { X, Save, ClipboardList, User, Package, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";

const PeminjamanForm = ({ onClose }) => {
  const { profile } = useAuth();
  const [barang, setBarang] = useState([]);
  const [formData, setFormData] = useState({
    barangId: "",
    namaPeminjam: "",
    jumlah: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const qBarang = query(collection(db, "barang"), where("jumlah", ">", 0));
    const unsubscribe = onSnapshot(qBarang, (snapshot) => {
      setBarang(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const selectedBarang = barang.find(b => b.id === formData.barangId);
    if (!selectedBarang) {
      setError("Pilih barang terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (formData.jumlah > selectedBarang.jumlah) {
      setError(`Stok tidak mencukupi. Maksimal: ${selectedBarang.jumlah}`);
      setLoading(false);
      return;
    }

    try {
      // 1. Catat peminjaman
      await addDoc(collection(db, "peminjaman"), {
        ...formData,
        tanggalPinjam: serverTimestamp(),
        status: "dipinjam",
        petugasId: profile?.uid || "unknown",
      });

      // 2. Kurangi stok barang
      await updateDoc(doc(db, "barang", selectedBarang.id), {
        jumlah: selectedBarang.jumlah - formData.jumlah,
      });

      onClose();
    } catch (error) {
      console.error("Error saving peminjaman:", error);
      setError("Gagal mencatat peminjaman. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 lg:p-8 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
              <ClipboardList size={22} />
            </div>
            <h2 className="text-lg lg:text-xl font-bold">Catat Peminjaman</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <User size={14} /> Nama Peminjam
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
              value={formData.namaPeminjam}
              onChange={(e) => setFormData({ ...formData, namaPeminjam: e.target.value })}
              placeholder="Nama Siswa atau Guru"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Package size={14} /> Pilih Barang
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
              value={formData.barangId}
              onChange={(e) => setFormData({ ...formData, barangId: e.target.value })}
            >
              <option value="">Pilih Barang yang Tersedia</option>
              {barang.map(b => (
                <option key={b.id} value={b.id}>{b.nama} (Stok: {b.jumlah})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah Pinjam</label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
              value={formData.jumlah}
              onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) })}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Mencatat..." : "Catat Peminjaman"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PeminjamanForm;
