import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Users, Trash2, Shield, ShieldCheck, Mail, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";

const UserManagement = () => {
  const { profile: currentUserProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const qUsers = query(collection(db, "users"));
    const unsubscribe = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleRole = async (u) => {
    if (u.uid === currentUserProfile?.uid) {
      setError("Anda tidak dapat mengubah peran Anda sendiri.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newRole = u.role === "admin" ? "petugas" : "admin";
    try {
      await updateDoc(doc(db, "users", u.uid), {
        role: newRole,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDelete = async (u) => {
    if (u.role === "admin") {
      setError("Admin tidak dapat dihapus untuk menjaga keamanan sistem.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, "users", u.uid));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Manajemen Pengguna</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-[#E5E5E5] w-fit">
          <Users size={16} />
          <span>Total {users.length} Pengguna</span>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-[#E5E5E5]">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Peran</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <AnimatePresence mode="popLayout">
                {users.map((u) => {
                  const isSelf = u.uid === currentUserProfile?.uid;
                  const isAdmin = u.role === "admin";

                  return (
                    <motion.tr
                      key={u.uid}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <User size={20} />
                          </div>
                          <span className="text-sm font-bold">
                            {u.name} {isSelf && <span className="text-[10px] text-gray-400 font-normal ml-1">(Anda)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                          u.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          {u.role === "admin" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {u.createdAt?.toDate().toLocaleDateString() || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleRole(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ubah Peran"
                            >
                              <Shield size={16} />
                            </button>
                          )}
                          {!isAdmin && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Users size={32} />
              </div>
              <p className="text-gray-500 font-medium">Belum ada pengguna terdaftar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
