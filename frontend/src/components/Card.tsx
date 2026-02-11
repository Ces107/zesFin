import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  title: string
  value: string
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

const glowColors = {
  up: '0 0 24px rgba(16,185,129,0.15)',
  down: '0 0 24px rgba(239,68,68,0.15)',
  neutral: '0 0 24px rgba(148,163,184,0.08)',
}

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Card({ title, value, subtitle, icon, trend }: CardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-slate-300'

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: glowColors[trend ?? 'neutral'],
      }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-5 transition-colors duration-300 hover:bg-white/[0.06] hover:border-white/[0.12]"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400 tracking-wide">{title}</span>
        {icon && <span className="text-slate-500/80">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${trendColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
    </motion.div>
  )
}
