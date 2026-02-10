import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react'
import { fetchTransactions, createTransaction, deleteTransaction } from '../api'
import type { Transaction } from '../types'

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
    })
    load()
  }

  const handleDelete = async (id: number) => {
    await deleteTransaction(id)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Description</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-300">
                    {new Date(tx.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3 text-sm text-white">{tx.description}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300">
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
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">New Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
