import { useState } from 'react'
import { managerNotifications } from '../../data/mockData'

const TYPE_CONFIG = {
  submit:  { bg: 'bg-blue-100',   icon: '📝', color: 'text-blue-600' },
  alert:   { bg: 'bg-amber-100',  icon: '⚠️', color: 'text-amber-600' },
  warning: { bg: 'bg-red-100',    icon: '🔴', color: 'text-red-600' },
  info:    { bg: 'bg-slate-100',  icon: 'ℹ️', color: 'text-slate-500' },
}

export default function ManagerNotifications() {
  const [items, setItems] = useState(managerNotifications)

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const unread = items.filter(n => !n.read).length

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">通知</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unread > 0 ? `未読 ${unread}件` : 'すべて既読です'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            すべて既読にする
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {items.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">通知はありません</div>
        )}
        {items.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                i > 0 ? 'border-t border-slate-100' : ''
              } ${!n.read ? 'bg-blue-50/40' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 text-base mt-0.5`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                    {n.text}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{n.sub} · {n.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
