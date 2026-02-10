import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Wallet, TrendingUp, ArrowDownUp, Target } from 'lucide-react'
import Card from '../components/Card'
import { fetchDashboardSummary, fetchSnapshots } from '../api'
import type { DashboardSummary, PortfolioSnapshot } from '../types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchSnapshots()])
      .then(([s, snaps]) => {
        setSummary(s)
        setSnapshots(snaps)
      })
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

  const chartData = snapshots.map((s) => ({
    date: new Date(s.date).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    'Portfolio Value': s.portfolioValue,
    'Total Invested': s.totalInvested,
  }))

  const yieldPct =
    summary && summary.totalInvested > 0
      ? ((summary.yield / summary.totalInvested) * 100).toFixed(1)
      : '0'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Patrimonio"
          value={fmt(summary?.totalPatrimonio ?? 0)}
          icon={<Wallet size={18} />}
          trend="up"
        />
        <Card
          title="Total Invested"
          value={fmt(summary?.totalInvested ?? 0)}
          icon={<Target size={18} />}
          trend="neutral"
        />
        <Card
          title="Unrealized Yield"
          value={fmt(summary?.yield ?? 0)}
          subtitle={`${yieldPct}% return`}
          icon={<TrendingUp size={18} />}
          trend={(summary?.yield ?? 0) >= 0 ? 'up' : 'down'}
        />
        <Card
          title="Net Cash Flow (Month)"
          value={fmt(summary?.netCashFlow ?? 0)}
          icon={<ArrowDownUp size={18} />}
          trend={(summary?.netCashFlow ?? 0) >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Portfolio Evolution Chart */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">
          Portfolio Evolution
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value) => [fmt(Number(value)), undefined]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Portfolio Value"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Total Invested"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorInvested)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
