import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, ClipboardList } from 'lucide-react'
import { fetchSnapshots, createSnapshot, updateSnapshot, deleteSnapshot } from '../api'
import type { PortfolioSnapshot, EntryType } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)

const emptyForm: PortfolioSnapshot = {
  date: new Date().toISOString().split('T')[0],
  entryType: 'TOTAL_INVESTED',
  value: 0,
  monthlyContribution: 0,
  fixedIncomePercentage: 20,
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

export default function HistoryEntry() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PortfolioSnapshot>({ ...emptyForm })
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    fetchSnapshots()
      .then(setSnapshots)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (snapshot: PortfolioSnapshot) => {
    setEditingId(snapshot.id ?? null)
    setForm({ ...snapshot })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateSnapshot(editingId, form)
      } else {
        await createSnapshot(form)
      }
      setShowModal(false)
      setForm({ ...emptyForm })
      setEditingId(null)
      load()
    } catch (error) {
      console.error('Failed to save entry:', error)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteSnapshot(id)
    setConfirmDeleteId(null)
    load()
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl bg-white/[0.05]" />
            <Skeleton className="h-8 w-48 bg-white/[0.05]" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl bg-white/[0.05]" />
        </div>
        <Skeleton className="h-96 rounded-2xl bg-white/[0.05]" />
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <ClipboardList className="text-indigo-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio History</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(16,185,129,0.25)' }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Add Entry
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={item}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Value</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Contrib.</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors duration-200">
                  <td className="px-5 py-3.5 text-sm text-slate-300">
                    {new Date(s.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.entryType === 'TOTAL_INVESTED' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      s.entryType === 'PORTFOLIO_VALUE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      s.entryType === 'NET_WORTH' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {s.entryType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right font-mono text-white font-medium">
                    {fmt(s.value)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right font-mono text-slate-300">
                    {s.monthlyContribution ? fmt(s.monthlyContribution) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-white/[0.06] transition-all duration-200"
                      >
                        <Pencil size={14} />
                      </button>
                      {confirmDeleteId === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => s.id && handleDelete(s.id)}
                            className="px-2.5 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            Confirm
                          </motion.button>
                          <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 text-xs bg-white/[0.06] text-slate-400 border border-white/[0.08] rounded-lg hover:bg-white/[0.1] transition-colors"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(s.id ?? null)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.06] transition-all duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No history entries yet. Add your first portfolio snapshot.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl border border-white/[0.12] p-6 w-full max-w-md mx-4 shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  {editingId ? 'Edit Entry' : 'New Entry'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Entry Type</label>
                  <Select
                    value={form.entryType}
                    onValueChange={(v) => setForm({ ...form, entryType: v as EntryType })}
                  >
                    <SelectTrigger className="w-full rounded-xl bg-white/[0.05] border-white/[0.08] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/[0.12]">
                      <SelectItem value="TOTAL_INVESTED" className="text-white hover:bg-white/[0.1]">Total Invested</SelectItem>
                      <SelectItem value="PORTFOLIO_VALUE" className="text-white hover:bg-white/[0.1]">Portfolio Value</SelectItem>
                      <SelectItem value="NET_WORTH" className="text-white hover:bg-white/[0.1]">Net Worth</SelectItem>
                      <SelectItem value="LIQUID_ASSETS" className="text-white hover:bg-white/[0.1]">Liquid Assets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Value (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.value || ''}
                    onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Monthly Contribution (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.monthlyContribution || ''}
                    onChange={(e) => setForm({ ...form, monthlyContribution: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(16,185,129,0.25)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20"
                >
                  {editingId ? 'Update Entry' : 'Save Entry'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
