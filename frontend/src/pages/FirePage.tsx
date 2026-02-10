import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import { Flame, Target, Calendar, Rocket } from 'lucide-react'
import Card from '../components/Card'
import { fetchFireProfiles, fetchFireProjection, simulateFireProjection } from '../api'
import type { FireProfile, FireProjection } from '../types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

const defaultProfile: FireProfile = {
  currentAge: 30,
  currentSavings: 25000,
  monthlyContribution: 600,
  monthlyExpenses: 1500,
  expectedReturnRate: 0.07,
  inflationRate: 0.025,
  safeWithdrawalRate: 0.04,
  targetRetirementAge: 45,
  fireNumber: 450000,
}

export default function FirePage() {
  const [profile, setProfile] = useState<FireProfile>(defaultProfile)
  const [projection, setProjection] = useState<FireProjection | null>(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    fetchFireProfiles()
      .then((profiles) => {
        if (profiles.length > 0) {
          const p = profiles[0]
          setProfile(p)
          return fetchFireProjection(p.id!)
        }
        return simulateFireProjection(defaultProfile)
      })
      .then(setProjection)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const proj = await simulateFireProjection(profile)
      setProjection(proj)
    } catch (e) {
      console.error(e)
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
      </div>
    )
  }

  const chartData = projection?.yearlyProjections
    .filter((_, i) => i % 1 === 0) // show every year
    .map((p) => ({
      age: p.age,
      year: p.year,
      'Total Savings': Math.round(p.totalSavings),
      'FIRE Number': Math.round(p.fireNumber),
      Contributions: Math.round(p.totalContributions),
    })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="text-orange-400" size={28} />
        <h1 className="text-2xl font-bold text-white">FIRE Calculator</h1>
      </div>

      {/* Summary Cards */}
      {projection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="FIRE Number"
            value={fmt(projection.fireNumber)}
            subtitle={`${(profile.safeWithdrawalRate * 100).toFixed(0)}% SWR`}
            icon={<Target size={18} />}
            trend="neutral"
          />
          <Card
            title="FIRE Age"
            value={projection.fireAge ? `${projection.fireAge} years old` : 'Not achievable'}
            subtitle={projection.yearsToFire ? `${projection.yearsToFire} years from now` : undefined}
            icon={<Calendar size={18} />}
            trend={projection.fireAchievable ? 'up' : 'down'}
          />
          <Card
            title="Current Progress"
            value={`${((profile.currentSavings / projection.fireNumber) * 100).toFixed(1)}%`}
            subtitle={`${fmt(profile.currentSavings)} saved`}
            icon={<Rocket size={18} />}
            trend="up"
          />
          <Card
            title="Monthly Savings Rate"
            value={`${fmt(profile.monthlyContribution)}/mo`}
            subtitle={`${((profile.monthlyContribution / (profile.monthlyContribution + profile.monthlyExpenses)) * 100).toFixed(0)}% savings rate`}
            icon={<Flame size={18} />}
            trend="up"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Current Age</label>
              <input
                type="number"
                value={profile.currentAge}
                onChange={(e) => setProfile({ ...profile, currentAge: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Current Savings</label>
              <input
                type="number"
                value={profile.currentSavings}
                onChange={(e) => setProfile({ ...profile, currentSavings: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Monthly Contribution</label>
              <input
                type="number"
                value={profile.monthlyContribution}
                onChange={(e) => setProfile({ ...profile, monthlyContribution: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Monthly Expenses</label>
              <input
                type="number"
                value={profile.monthlyExpenses}
                onChange={(e) => setProfile({ ...profile, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Expected Annual Return ({(profile.expectedReturnRate * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0.01"
                max="0.15"
                step="0.005"
                value={profile.expectedReturnRate}
                onChange={(e) => setProfile({ ...profile, expectedReturnRate: parseFloat(e.target.value) })}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Inflation Rate ({(profile.inflationRate * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0.01"
                max="0.06"
                step="0.005"
                value={profile.inflationRate}
                onChange={(e) => setProfile({ ...profile, inflationRate: parseFloat(e.target.value) })}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Safe Withdrawal Rate ({(profile.safeWithdrawalRate * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0.025"
                max="0.05"
                step="0.005"
                value={profile.safeWithdrawalRate}
                onChange={(e) => setProfile({ ...profile, safeWithdrawalRate: parseFloat(e.target.value) })}
                className="w-full accent-orange-500"
              />
            </div>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {simulating ? 'Calculating...' : 'Simulate'}
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Capital Growth Projection</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="age" stroke="#6b7280" fontSize={12} label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value) => [fmt(Number(value)), undefined]}
                labelFormatter={(age) => `Age ${age}`}
              />
              <Legend />
              {projection?.fireAge && (
                <ReferenceLine
                  x={projection.fireAge}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `FIRE @ ${projection.fireAge}`,
                    fill: '#10b981',
                    fontSize: 12,
                    position: 'top',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="FIRE Number"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="Contributions"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorContrib)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="Total Savings"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorSavings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          {projection?.fireAchievable && projection.fireAge && (
            <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-300">
                At your current savings rate, you can achieve financial independence at age{' '}
                <strong>{projection.fireAge}</strong> (year {projection.yearlyProjections.find(p => p.age === projection.fireAge)?.year ?? ''}), with{' '}
                <strong>{fmt(projection.projectedSavingsAtFire)}</strong> accumulated.
              </p>
            </div>
          )}
          {projection && !projection.fireAchievable && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-sm text-red-300">
                With current parameters, FIRE is not achievable before age 100.
                Try increasing your monthly contribution or reducing expenses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
