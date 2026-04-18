import { NavLink, Outlet } from 'react-router-dom'
import { STORE_NAME, YEAR_MONTH } from '../data/mockData'

const nav = [
  { to: '/manager',         label: '計画一覧',     icon: '📊' },
  { to: '/manager/targets', label: '目標計画',     icon: '🎯' },
  { to: '/manager/shift',   label: 'シフト決定',   icon: '📅' },
  { to: '/manager/members', label: 'メンバー管理', icon: '👥' },
]

export default function ManagerLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-900 text-white flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-blue-800">
          <div className="text-xs text-blue-300 mb-1">Manager Portal</div>
          <div className="text-sm font-bold leading-tight">{STORE_NAME.split(' ').slice(0,2).join(' ')}</div>
          <div className="text-xs text-blue-300 mt-1">{YEAR_MONTH}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/manager'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <a href="/" className="text-xs text-blue-400 hover:text-blue-200 flex items-center gap-1">
            ← TOP に戻る
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
