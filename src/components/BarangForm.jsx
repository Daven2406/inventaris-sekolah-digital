import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { X, Save, Package, Hash, Tags, MapPin, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

const BarangForm = ({ barang, onClose }) => {
  const [kategori, setKategori] = useState([]);
  const [formData, setFormData] = useState({
    kode: barang?.kode || "",
    nama: barang?.nama || "",
    kategoriId: barang?.kategoriId || "",
    jumlah: barang?.jumlah || 0,
    kondisi: barang?.kondisi || "baik",
    lokasi: barang?.lokasi || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qKategori = query(collection(db, "kategori"));
    const unsubscribe = onSnapshot(qKategori, (snapshot) => {
      setKategori(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (barang) {
        await updateDoc(doc(db, "barang", barang.id), {
          ...formData,
        });
      } else {
        await addDoc(collection(db, "barang"), {
          ...formData,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving barang:", error);
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
              <Package size={22} />
            </div>
            <h2 className="text-lg lg:text-xl font-bold">{barang ? "Edit Barang" : "Tambah Barang Baru"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Hash size={14} /> Kode Barang
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                placeholder="SKU-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Tags size={14} /> Kategori
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
                value={formData.kategoriId}
                onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}
              >
                <option value="">Pilih Kategori</option>
                {kategori.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Barang</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Proyektor Epson"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah Stok</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={14} /> Kondisi
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
                value={formData.kondisi}
                onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
              >
                <option value="baik">Baik</option>
                <option value="rusak">Rusak</option>
                <option value="perlu-perbaikan">Perlu Perbaikan</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={14} /> Lokasi Penyimpanan
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              placeholder="Contoh: Lab Komputer 1"
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
              {loading ? "Menyimpan..." : "Simpan Barang"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BarangForm;
