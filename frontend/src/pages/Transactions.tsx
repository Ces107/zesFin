import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTransactions, createTransaction, deleteTransaction } from '../api'
import type { Transaction } from '../types'
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

const CATEGORIES = [
  'Salary',
  'Side Income',
  'Dividends',
  'Investment',
  'Housing',
  'Food',
  'Utilities',
  'Transport',
  'Entertainment',
  'Health',
  'Other',
]

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Transaction>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'EXPENSE',
    category: 'Other',
    isRecurring: false,
    recurrenceType: 'MONTHLY',
    nextExecutionDate: '',
  })

  const load = () => {
    setLoading(true)
    fetchTransactions()
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createTransaction(form)
    setShowModal(false)
    setForm({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'EXPENSE',
      category: 'Other',
      isRecurring: false,
      recurrenceType: 'MONTHLY',
      nextExecutionDate: '',
    })
    load()
  }

  const handleDelete = async (id: number) => {
    await deleteTransaction(id)
    load()
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-white/[0.05]" />
          <Skeleton className="h-10 w-40 rounded-xl bg-white/[0.05]" />
        </div>
        <Skeleton className="h-96 rounded-2xl bg-white/[0.05]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white rounded-xl text-sm font-medium transition-all duration-200"
        >
          <Plus size={16} />
          Add Transaction
        </motion.button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors duration-150">
                  <td className="px-5 py-3 text-sm text-gray-300">
                    {new Date(tx.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3 text-sm text-white">
                    {tx.description}
                    {tx.isRecurring && (
                      <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Recurring
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2 py-0.5 text-xs bg-white/[0.06] text-slate-300 border border-white/[0.06] rounded-full">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {tx.type === 'INCOME' ? (
                      <span className="flex items-center gap-1 text-sm text-emerald-400">
                        <ArrowUpCircle size={14} /> Income
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-red-400">
                        <ArrowDownCircle size={14} /> Expense
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-5 py-3 text-sm text-right font-mono font-medium ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {fmt(tx.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => tx.id && handleDelete(tx.id)}
                      className="hover:text-red-400 hover:bg-red-500/10 rounded-lg p-1.5 transition-all duration-150 text-gray-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl border border-white/[0.12] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">New Transaction</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                  <input
                    type="text"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.amount || ''}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 font-medium mb-1.5">Type</label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v as 'INCOME' | 'EXPENSE' })}
                    >
                      <SelectTrigger className="w-full rounded-xl bg-white/[0.05] border-white/[0.08] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/[0.12]">
                        <SelectItem value="EXPENSE" className="text-white hover:bg-white/[0.1]">Expense</SelectItem>
                        <SelectItem value="INCOME" className="text-white hover:bg-white/[0.1]">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 font-medium mb-1.5">Category</label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
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

                {/* Recurring Transaction Fields */}
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.05] text-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <span className="text-sm text-slate-300 font-medium">Recurring Transaction</span>
                  </label>
                </div>

                {form.isRecurring && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-300 font-medium mb-1.5">Frequency</label>
                      <Select
                        value={form.recurrenceType}
                        onValueChange={(v) => setForm({ ...form, recurrenceType: v as any })}
                      >
                        <SelectTrigger className="w-full rounded-xl bg-white/[0.05] border-white/[0.08] text-white">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/[0.12]">
                          <SelectItem value="DAILY" className="text-white hover:bg-white/[0.1]">Daily</SelectItem>
                          <SelectItem value="WEEKLY" className="text-white hover:bg-white/[0.1]">Weekly</SelectItem>
                          <SelectItem value="MONTHLY" className="text-white hover:bg-white/[0.1]">Monthly</SelectItem>
                          <SelectItem value="YEARLY" className="text-white hover:bg-white/[0.1]">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 font-medium mb-1.5">Next Execution</label>
                      <input
                        type="date"
                        value={form.nextExecutionDate || ''}
                        onChange={(e) => setForm({ ...form, nextExecutionDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                        required={form.isRecurring}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Save Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
