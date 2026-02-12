import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Plus, Pencil, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '../api'
import type { Asset } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS: Record<string, string> = {
  EQUITY: '#10b981',
  BONDS: '#6366f1',
  CRYPTO: '#f59e0b',
  CASH: '#8b5cf6',
  REAL_ESTATE: '#ec4899',
}

const CATEGORIES: Asset['category'][] = ['EQUITY', 'BONDS', 'CRYPTO', 'CASH', 'REAL_ESTATE']

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)

const emptyForm: Asset = {
  name: '',
  isin: null,
  category: 'EQUITY',
  currentValue: 0,
  currency: 'EUR',
  allocationPercentage: 0,
  totalInvested: 0,
  unrealizedGain: 0,
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Portfolio() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Asset>({ ...emptyForm })
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    fetchAssets()
      .then(setAssets)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (asset: Asset) => {
    setEditingId(asset.id ?? null)
    setForm({ ...asset })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      unrealizedGain: form.currentValue - form.totalInvested,
    }
    if (editingId) {
      await updateAsset(editingId, payload)
    } else {
      await createAsset(payload)
    }
    setShowModal(false)
    setForm({ ...emptyForm })
    setEditingId(null)
    load()
  }

  const handleDelete = async (id: number) => {
    await deleteAsset(id)
    setConfirmDeleteId(null)
    load()
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-white/[0.05]" />
          <Skeleton className="h-10 w-32 rounded-lg bg-white/[0.05]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-white/[0.05]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl bg-white/[0.05]" />
          <Skeleton className="h-96 rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    )
  }

  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0)
  const totalInvested = assets.reduce((sum, a) => sum + (a.totalInvested ?? 0), 0)
  const totalGain = totalValue - totalInvested
  const totalGainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0'

  // Group by category for pie chart
  const categoryMap = new Map<string, number>()
  assets.forEach((a) => {
    categoryMap.set(a.category, (categoryMap.get(a.category) ?? 0) + a.currentValue)
  })

  const pieData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white rounded-lg text-sm font-medium transition-all duration-200"
        >
          <Plus size={16} />
          Add Asset
        </motion.button>
      </div>

      {/* Summary row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={staggerItem} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-5">
          <span className="text-sm text-gray-400">Total Value</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalValue)}</p>
        </motion.div>
        <motion.div variants={staggerItem} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-5">
          <span className="text-sm text-gray-400">Total Invested</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{fmt(totalInvested)}</p>
        </motion.div>
        <motion.div variants={staggerItem} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-5">
          <span className="text-sm text-gray-400">Unrealized P&L</span>
          <p className={`text-2xl font-bold mt-1 ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{fmt(totalGain)} ({totalGainPct}%)
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-6">
          <h2 className="text-lg font-semibold text-white tracking-tight mb-4">Asset Allocation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,15,30,0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                formatter={(value) => [fmt(Number(value)), undefined]}
              />
              <Legend
                formatter={(value) => <span className="text-sm text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Asset List */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-6">
          <h2 className="text-lg font-semibold text-white tracking-tight mb-4">Holdings</h2>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                  <p className="text-xs text-gray-500">
                    {asset.isin ?? 'N/A'} &middot;{' '}
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: COLORS[asset.category] ?? '#6b7280' }}
                    />
                    {asset.category}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium text-white">{fmt(asset.currentValue)}</p>
                    <p
                      className={`text-xs flex items-center justify-end gap-1 ${
                        (asset.unrealizedGain ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {(asset.unrealizedGain ?? 0) >= 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {(asset.unrealizedGain ?? 0) >= 0 ? '+' : ''}
                      {fmt(asset.unrealizedGain ?? 0)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => openEdit(asset)}
                      className="hover:bg-white/[0.08] rounded-lg p-1.5 transition-all duration-150 text-gray-500 hover:text-indigo-400"
                    >
                      <Pencil size={13} />
                    </button>
                    {confirmDeleteId === asset.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => asset.id && handleDelete(asset.id)}
                          className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-300 border border-red-500/20 rounded hover:bg-red-500/30 transition-all duration-150"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 text-[10px] bg-white/[0.06] text-slate-300 border border-white/[0.08] rounded hover:bg-white/[0.10] transition-all duration-150"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(asset.id ?? null)}
                        className="hover:bg-white/[0.08] rounded-lg p-1.5 transition-all duration-150 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl border border-white/[0.12] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  {editingId ? 'Edit Asset' : 'New Asset'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">ISIN</label>
                    <input
                      type="text"
                      value={form.isin ?? ''}
                      onChange={(e) => setForm({ ...form, isin: e.target.value || null })}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 font-medium mb-1">Category</label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v as Asset['category'] })}
                    >
                      <SelectTrigger className="w-full rounded-xl bg-white/[0.05] border-white/[0.08] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/[0.12]">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="text-white hover:bg-white/[0.1]">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.currentValue || ''}
                      onChange={(e) => setForm({ ...form, currentValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total Invested</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.totalInvested || ''}
                      onChange={(e) => setForm({ ...form, totalInvested: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                  />
                </div>
                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                  <span className="text-xs text-gray-400">Unrealized Gain (auto-calculated): </span>
                  <span className={`text-sm font-mono font-medium ${(form.currentValue - form.totalInvested) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(form.currentValue - form.totalInvested)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {editingId ? 'Update Asset' : 'Save Asset'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
