import { NavLink, Outlet } from 'react-router-dom'
import { STORE_NAME, YEAR_MONTH } from '../data/mockData'

const nav = [
  { to: '/employee',       label: 'シフト確認',   icon: '📋' },
  { to: '/employee/edit',  label: 'シフト入力',   icon: '✏️' },
]

export default function EmployeeLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-emerald-900 text-white flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-emerald-800">
          <div className="text-xs text-emerald-300 mb-1">Employee Portal</div>
          <div className="text-sm font-bold leading-tight">{STORE_NAME.split(' ').slice(0,2).join(' ')}</div>
          <div className="text-xs text-emerald-300 mt-1">{YEAR_MONTH}</div>
        </div>
        <div className="px-4 py-3 border-b border-emerald-800 bg-emerald-800">
          <div className="text-xs text-emerald-300">ログイン中</div>
          <div className="text-sm font-semibold">金子 光男</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/employee'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <a href="/" className="text-xs text-emerald-400 hover:text-emerald-200 flex items-center gap-1">
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
