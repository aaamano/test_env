import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { STORE_NAME, YEAR_MONTH, allStores, managerNotifications } from '../data/mockData'

const nav = [
  { to: '/manager',                label: 'ダッシュボード', icon: '◈', end: true },
  { to: '/manager/targets',        label: '目標計画',       icon: '◎', end: false },
  { to: '/manager/shift',          label: 'シフト決定',     icon: '▦', end: false },
  { to: '/manager/members',        label: 'メンバー管理',   icon: '◉', end: false },
  { to: '/manager/settings',       label: '店舗設定',       icon: '◌', end: false },
  { to: '/manager/notifications',  label: '通知',           icon: '◍', end: false, badge: true },
]

const UNREAD = managerNotifications.filter(n => !n.read).length

export default function ManagerLayout() {
  const [showStoreDropdown, setShowStoreDropdown] = useState(false)
  const [activeStore, setActiveStore] = useState(allStores[0])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-900 text-white flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-blue-800">
          <div className="text-xs text-blue-300 mb-1">Manager Portal</div>
          <div className="text-sm font-bold leading-tight">{STORE_NAME.split(' ').slice(0,2).join(' ')}</div>
          <div className="text-xs text-blue-300 mt-1">{YEAR_MONTH}</div>

          {/* Store selector badge */}
          <div className="relative mt-3">
            <button
              onClick={() => setShowStoreDropdown(v => !v)}
              className="w-full flex items-center justify-between bg-blue-800 hover:bg-blue-700 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
            >
              <span>{activeStore.name}</span>
              <span className="text-blue-300 ml-1">▼</span>
            </button>
            {showStoreDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {allStores.map(store => (
                  <button
                    key={store.id}
                    onClick={() => {
                      if (store.status === 'active') {
                        setActiveStore(store)
                        setShowStoreDropdown(false)
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors ${
                      store.status === 'active'
                        ? 'text-gray-800 hover:bg-blue-50 font-semibold'
                        : 'text-gray-400 cursor-not-allowed'
                    } ${activeStore.id === store.id ? 'bg-blue-50' : ''}`}
                  >
                    <span>{store.name}</span>
                    {store.status === 'soon' && (
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">準備中</span>
                    )}
                    {activeStore.id === store.id && store.status === 'active' && (
                      <span className="text-[10px] text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              <span className="flex-1">{label}</span>
              {badge && UNREAD > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {UNREAD}
                </span>
              )}
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
      <main className="flex-1 overflow-auto" onClick={() => setShowStoreDropdown(false)}>
        <Outlet />
      </main>
    </div>
  )
}
