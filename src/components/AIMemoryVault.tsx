import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Brain, Plus, Trash2, Bookmark, Check, Sparkles, Lock, Save, RefreshCw, Calculator, MessageSquare, AlertTriangle } from "lucide-react";
import { getUserMemories, saveUserMemory, deleteUserMemory, clearAllUserMemories, syncMemoriesFromFirestore, UserMemory } from "../services/geminiService";

interface AIMemoryVaultProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
}

export const AIMemoryVault: React.FC<AIMemoryVaultProps> = ({
  isOpen,
  onClose,
  userId = "default",
  userName = "Abhijit"
}) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [category, setCategory] = useState("Mentor Memory");
  const [activeFilter, setActiveFilter] = useState("All");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const refreshMemories = async () => {
    setIsSyncing(true);
    if (userId && userId !== "default") {
      await syncMemoriesFromFirestore(userId);
    }
    setMemories(getUserMemories(userId));
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshMemories();
    }
  }, [isOpen, userId]);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    saveUserMemory(newMemoryText, userId, category);
    setNewMemoryText("");
    setSavedSuccess(true);
    setMemories(getUserMemories(userId));
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    deleteUserMemory(id, userId);
    setMemories(getUserMemories(userId));
  };

  const handleClearAll = () => {
    clearAllUserMemories(userId);
    setMemories([]);
    setConfirmClear(false);
  };

  if (!isOpen) return null;

  const categoriesList = ["All", "Mentor Memory", "Math Solver", "Doubt Solver", "Study Preference", "Target & Goal"];

  const filteredMemories = memories.filter(m => {
    if (activeFilter === "All") return true;
    return m.category === activeFilter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[88vh] relative"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-inner">
                <Brain size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-black tracking-tight uppercase">Your AI Memory Bank</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Lock size={10} /> Account Saved
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-indigo-200/80 font-medium mt-0.5">
                  Account Bound to <span className="text-white font-bold">{userName}</span> ({userId !== "default" ? "Cloud Sync Active" : "Local Mode"})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={refreshMemories}
                disabled={isSyncing}
                title="Sync memory from account cloud"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Account Banner */}
          <div className="p-3.5 bg-indigo-50/80 border-b border-indigo-100/60 flex items-center justify-between text-indigo-900 text-xs font-medium px-6">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-indigo-600 shrink-0" />
              <p className="leading-snug text-[11px]">
                <strong>Account Persistence:</strong> Logged out ba new login korleo ei Account-er AI Memories restore hoye jabe.
              </p>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 scrollbar-hide">
            {/* Add Memory Form */}
            <form onSubmit={handleAddMemory} className="space-y-3 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Plus size={12} /> Add New Memory / Rule
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none"
                >
                  <option value="Mentor Memory">Mentor Memory</option>
                  <option value="Math Solver">Math Solver</option>
                  <option value="Doubt Solver">Doubt Solver</option>
                  <option value="Study Preference">Study Preference</option>
                  <option value="Target & Goal">Target & Goal</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  placeholder='e.g., "Ami Biology Unit II beshi porbo", "Math step-by-step bujhiye bolo"...'
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMemoryText.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-indigo-200 shrink-0"
                >
                  <Save size={14} /> Save Rule
                </button>
              </div>

              <AnimatePresence>
                {savedSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-600 text-xs font-bold pt-1"
                  >
                    <Check size={14} /> Saved into Account Memory Vault!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeFilter === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Memories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Stored Memories ({filteredMemories.length})
                </h3>
                {memories.length > 0 && (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Clear All Memories
                  </button>
                )}
              </div>

              {confirmClear && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertTriangle size={16} /> Delete all memories saved for this account?
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Yes, Delete All
                    </button>
                  </div>
                </div>
              )}

              {filteredMemories.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Bookmark className="mx-auto text-slate-300" size={32} />
                  <p className="text-xs font-bold text-slate-500">No memories found for {activeFilter}</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Type a rule above or talk with Mentor / Solvers to automatically store memories for this account!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredMemories.map((mem, idx) => (
                    <motion.div
                      key={`mem-${mem.id}-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md uppercase tracking-wider">
                            {mem.category || "Rule"}
                          </span>
                          <span className="text-[9px] text-slate-300 font-mono">
                            {new Date(mem.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          "{mem.fact}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(mem.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-80 group-hover:opacity-100"
                        title="Delete memory"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Account Memory Protection Enabled
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
