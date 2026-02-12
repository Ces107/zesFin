import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
import { fetchFireProfiles, fetchFireProjection, simulateFireProjection, fetchDashboardSummary } from '../api'
import { config } from '../config'
import type { FireProfile, FireProjection } from '../types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

const STORAGE_KEY = 'zesfin:fire-profile'

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
  annualContributionIncreaseRate: null,
}

function loadSavedProfile(): FireProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProfile(profile: FireProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

export default function FirePage() {
  const [profile, setProfile] = useState<FireProfile>(defaultProfile)
  const [projection, setProjection] = useState<FireProjection | null>(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = loadSavedProfile()
        if (saved) {
          setProfile(saved)
          const proj = await simulateFireProjection(saved)
          setProjection(proj)
          return
        }

        const [profiles, dashboard] = await Promise.all([
          fetchFireProfiles(),
          fetchDashboardSummary(),
        ])

        if (profiles.length > 0 && profiles[0].id) {
          const p = profiles[0]
          setProfile(p)
          const proj = await fetchFireProjection(p.id!)
          setProjection(proj)
        } else {
          const profileWithPortfolio = {
            ...defaultProfile,
            currentSavings: dashboard.totalPatrimonio ?? defaultProfile.currentSavings,
          }
          setProfile(profileWithPortfolio)
          const proj = await simulateFireProjection(profileWithPortfolio)
          setProjection(proj)
        }
      } catch (error) {
        console.error('Error loading FIRE data:', error)
        // Set default projection even on error so the page renders
        setProfile(defaultProfile)
        try {
          const proj = await simulateFireProjection(defaultProfile)
          setProjection(proj)
        } catch (e) {
          console.error('Error simulating default profile:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const proj = await simulateFireProjection(profile)
      setProjection(proj)
      saveProfile(profile)
    } catch (e) {
      console.error(e)
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-400 border-r-orange-400/40 animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-amber-400/60 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>
      </div>
    )
  }

  const maxAge = projection?.fireAge
    ? projection.fireAge + config.fire.yearsAfterFire
    : undefined

  const chartData = (projection?.yearlyProjections ?? [])
    .filter((p) => maxAge === undefined || p.age <= maxAge)
    .map((p) => ({
      age: p.age,
      year: p.year,
      'Total Savings': Math.round(p.totalSavings),
      'FIRE Number': Math.round(p.fireNumber),
      Contributions: Math.round(p.totalContributions),
    }))

  const inputClass = 'w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200'

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <Flame className="text-orange-400" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">FIRE Calculator</h1>
      </motion.div>

      {/* Summary Cards */}
      {projection && (
        <motion.div
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
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
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <motion.div
          variants={item}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-5 tracking-tight">Your Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Age</label>
              <input
                type="number"
                value={profile.currentAge}
                onChange={(e) => setProfile({ ...profile, currentAge: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Savings</label>
              <input
                type="number"
                value={profile.currentSavings}
                onChange={(e) => setProfile({ ...profile, currentSavings: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Contribution</label>
              <input
                type="number"
                value={profile.monthlyContribution}
                onChange={(e) => setProfile({ ...profile, monthlyContribution: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Expenses</label>
              <input
                type="number"
                value={profile.monthlyExpenses}
                onChange={(e) => setProfile({ ...profile, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>

            {/* Variable contributions toggle */}
            <div className="flex items-center gap-3 py-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.annualContributionIncreaseRate != null && profile.annualContributionIncreaseRate > 0}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      annualContributionIncreaseRate: e.target.checked ? 0.05 : null,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/[0.1] peer-focus:ring-2 peer-focus:ring-orange-500/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600 transition-colors" />
              </label>
              <span className="text-xs font-medium text-slate-400">Variable contributions</span>
            </div>

            {profile.annualContributionIncreaseRate != null && profile.annualContributionIncreaseRate > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Annual Increase Rate ({((profile.annualContributionIncreaseRate ?? 0) * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.30"
                  step="0.01"
                  value={profile.annualContributionIncreaseRate ?? 0.05}
                  onChange={(e) => setProfile({ ...profile, annualContributionIncreaseRate: parseFloat(e.target.value) })}
                  className="w-full accent-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Year 1: {fmt(profile.monthlyContribution * 12)} &rarr; Year 10: {fmt(profile.monthlyContribution * 12 * Math.pow(1 + (profile.annualContributionIncreaseRate ?? 0), 10))}
                </p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
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

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-orange-500/20"
            >
              {simulating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                  Calculating...
                </span>
              ) : (
                'Simulate'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-5 tracking-tight">Capital Growth Projection</h2>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="age"
                stroke="rgba(255,255,255,0.2)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.3)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 30, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                formatter={(value) => [fmt(Number(value)), undefined]}
                labelFormatter={(age) => `Age ${age}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
              />
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
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 backdrop-blur-sm"
            >
              <p className="text-sm text-emerald-300">
                At your current savings rate, you can achieve financial independence at age{' '}
                <strong className="text-emerald-200">{projection.fireAge}</strong> (year {projection.yearlyProjections.find(p => p.age === projection.fireAge)?.year ?? ''}), with{' '}
                <strong className="text-emerald-200">{fmt(projection.projectedSavingsAtFire)}</strong> accumulated.
              </p>
            </motion.div>
          )}
          {projection && !projection.fireAchievable && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 backdrop-blur-sm"
            >
              <p className="text-sm text-red-300">
                With current parameters, FIRE is not achievable before age 100.
                Try increasing your monthly contribution or reducing expenses.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
