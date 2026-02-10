import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { fetchAssets } from '../api'
import type { Asset } from '../types'

const COLORS: Record<string, string> = {
  EQUITY: '#10b981',
  BONDS: '#6366f1',
  CRYPTO: '#f59e0b',
  CASH: '#8b5cf6',
  REAL_ESTATE: '#ec4899',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)

export default function Portfolio() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
      .then(setAssets)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Portfolio</h1>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <span className="text-sm text-gray-400">Total Value</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalValue)}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <span className="text-sm text-gray-400">Total Invested</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{fmt(totalInvested)}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <span className="text-sm text-gray-400">Unrealized P&L</span>
          <p className={`text-2xl font-bold mt-1 ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{fmt(totalGain)} ({totalGainPct}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Asset Allocation</h2>
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
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
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
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
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
                <div className="text-right ml-4">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
