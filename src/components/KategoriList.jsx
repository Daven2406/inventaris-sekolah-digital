import { useEffect, useState } from "react";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Trash2, Edit2, Tags, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";

const KategoriList = () => {
  const [kategori, setKategori] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState(null);
  const [formData, setFormData] = useState({ nama: "", deskripsi: "" });
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

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
      if (editingKategori) {
        await updateDoc(doc(db, "kategori", editingKategori.id), formData);
      } else {
        await addDoc(collection(db, "kategori"), formData);
      }
      setFormData({ nama: "", deskripsi: "" });
      setIsFormOpen(false);
      setEditingKategori(null);
    } catch (error) {
      console.error("Error saving kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "kategori", id));
    } catch (error) {
      console.error("Error deleting kategori:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Daftar Kategori</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all text-sm"
        >
          <Plus size={20} />
          Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kategori.map((k) => (
          <motion.div
            key={k.id}
            layout
            className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                <Tags size={20} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingKategori(k);
                    setFormData({ nama: k.nama, deskripsi: k.deskripsi || "" });
                    setIsFormOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-lg">{k.nama}</h3>
              <p className="text-sm text-gray-500 mt-1">{k.deskripsi || "Tidak ada deskripsi."}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingKategori ? "Edit Kategori" : "Tambah Kategori"}</h2>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Elektronik"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi</label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#1A1A1A] outline-none transition-all resize-none h-24"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi singkat kategori..."
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KategoriList;
