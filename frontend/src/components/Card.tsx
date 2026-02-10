import type { ReactNode } from 'react'

interface CardProps {
  title: string
  value: string
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export default function Card({ title, value, subtitle, icon, trend }: CardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-gray-400'

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{title}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${trendColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
