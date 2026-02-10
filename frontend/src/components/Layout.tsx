import { type ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Flame,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/portfolio', label: 'Portfolio', icon: PieChart },
  { to: '/fire', label: 'FIRE', icon: Flame },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
            Z
          </div>
          <span className="text-lg font-semibold text-white">zesFin</span>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Boglehead Portfolio Tracker
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-14 px-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="ml-3 font-semibold text-white">zesFin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
