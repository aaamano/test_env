import { useState } from 'react'
import { Link } from 'react-router-dom'
import { daysConfig, YEAR_MONTH, staff } from '../../data/mockData'

const ME = staff[0]

const STATUS_OPTIONS = [
  { value: 'off',       label: '休み',      icon: '✕', inactive: 'bg-gray-100 text-gray-500 border border-gray-200', active: 'bg-gray-500 text-white border border-gray-500' },
  { value: 'available', label: '出勤可',    icon: '○', inactive: 'bg-emerald-50 text-emerald-600 border border-emerald-200', active: 'bg-emerald-500 text-white border border-emerald-500' },
  { value: 'prefer',    label: '★第一希望', icon: '★', inactive: 'bg-blue-50 text-blue-600 border border-blue-200', active: 'bg-blue-600 text-white border border-blue-600' },
]

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)  // 8〜22
const MINS  = ['00', '15', '30', '45']

const defaultPref = { status: 'off', startH: 9, startM: '00', endH: 18, endM: '00' }

export default function ShiftEdit() {
  const [prefs, setPrefs]           = useState(() => Object.fromEntries(daysConfig.map(d => [d.day, { ...defaultPref }])))
  const [targetEarnings, setTarget] = useState(ME.wage * 80)
  const [editingTarget, setEditing] = useState(false)
  const [saved, setSaved]           = useState(false)
  const [expandAll, setExpandAll]   = useState(false)

  const setStatus = (day, status) =>
    setPrefs(prev => ({ ...prev, [day]: { ...prev[day], status } }))

  const setTime = (day, field, val) =>
    setPrefs(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }))

  const applyAll = (status) =>
    setPrefs(prev => Object.fromEntries(
      Object.entries(prev).map(([day, p]) => [day, { ...p, status }])
    ))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const availCount  = Object.values(prefs).filter(p => p.status === 'available' || p.status === 'prefer').length
  const preferCount = Object.values(prefs).filter(p => p.status === 'prefer').length

  return (
    <div className="p-4 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{YEAR_MONTH} 前半</div>
          <h1 className="text-xl font-bold text-gray-900">希望シフト入力</h1>
          <p className="text-sm text-gray-500">{ME.name} さん</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/employee" className="text-sm border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50">← 戻る</Link>
          <button onClick={handleSave}
            className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700">
            {saved ? '✓ 送信済み' : '送信する'}
          </button>
        </div>
      </div>

      {/* ── Target earnings ── */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs font-semibold text-emerald-700 mb-0.5">今月の目標収入</div>
            {editingTarget ? (
              <input type="number" defaultValue={targetEarnings} autoFocus
                className="w-40 border-2 border-emerald-400 rounded-lg px-3 py-1 text-sm outline-none font-bold"
                onBlur={e => { setTarget(Number(e.target.value)); setEditing(false) }}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              />
            ) : (
              <button onClick={() => setEditing(true)} className="text-xl font-bold text-gray-900 hover:text-emerald-700">
                ¥{targetEarnings.toLocaleString()}
                <span className="text-xs font-normal text-emerald-500 ml-1">タップして編集</span>
              </button>
            )}
          </div>
          <div className="text-xs text-emerald-600 text-right leading-relaxed">
            マネージャーがシフト作成時に<br/>参考にします
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '出勤可能', value: `${availCount}日`,      color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
          { label: '第一希望', value: `${preferCount}日`,     color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: '休み',     value: `${15 - availCount}日`, color: 'bg-gray-50 border-gray-200 text-gray-600' },
        ].map((k, i) => (
          <div key={i} className={`border rounded-xl p-3 ${k.color}`}>
            <div className="text-xs opacity-70 mb-0.5">{k.label}</div>
            <div className="text-xl font-bold">{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Bulk actions ── */}
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <span className="text-xs text-gray-500">一括設定:</span>
        <button onClick={() => applyAll('off')}
          className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 font-medium">
          全日 休み
        </button>
        <button onClick={() => applyAll('available')}
          className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 font-medium">
          全日 出勤可
        </button>
        <button onClick={() => setExpandAll(v => !v)}
          className="ml-auto text-xs px-3 py-1.5 rounded-full bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 font-medium">
          {expandAll ? '時刻を折りたたむ' : '全日 時刻を展開'}
        </button>
      </div>

      {/* ── Day cards ── */}
      <div className="space-y-2">
        {daysConfig.map(d => {
          const p = prefs[d.day]
          const isWorking = p.status !== 'off'
          const showTime  = isWorking || expandAll

          return (
            <div key={d.day}
              className={`rounded-xl border transition-all overflow-hidden ${
                p.status === 'prefer'    ? 'border-blue-300 bg-blue-50/50' :
                p.status === 'available' ? 'border-emerald-200 bg-emerald-50/30' :
                'border-gray-200 bg-white'
              }`}>

              {/* Top row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`flex-shrink-0 w-12 text-center rounded-lg py-1.5 ${d.isWeekend ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <div className={`text-base font-bold leading-tight ${d.isWeekend ? 'text-red-700' : 'text-gray-800'}`}>{d.day}</div>
                  <div className={`text-[10px] ${d.isWeekend ? 'text-red-500' : 'text-gray-500'}`}>{d.dow}</div>
                </div>
                <div className="flex gap-1.5 flex-1 flex-wrap">
                  {STATUS_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setStatus(d.day, opt.value)}
                      className={`flex-1 min-w-[68px] text-xs font-semibold px-2 py-2 rounded-lg transition-all ${
                        p.status === opt.value ? opt.active : opt.inactive
                      }`}>
                      <span className="mr-1">{opt.icon}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time range */}
              {showTime && (
                <div className={`px-4 pb-3 flex items-center gap-2 flex-wrap ${!isWorking ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-xs text-gray-500 flex-shrink-0">時間帯</span>
                  <select value={p.startH} onChange={e => setTime(d.day, 'startH', Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-400 bg-white">
                    {HOURS.map(h => <option key={h} value={h}>{h}時</option>)}
                  </select>
                  <select value={p.startM} onChange={e => setTime(d.day, 'startM', e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-400 bg-white">
                    {MINS.map(m => <option key={m} value={m}>{m}分</option>)}
                  </select>
                  <span className="text-gray-400">〜</span>
                  <select value={p.endH} onChange={e => setTime(d.day, 'endH', Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-400 bg-white">
                    {HOURS.map(h => <option key={h} value={h}>{h}時</option>)}
                  </select>
                  <select value={p.endM} onChange={e => setTime(d.day, 'endM', e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-400 bg-white">
                    {MINS.map(m => <option key={m} value={m}>{m}分</option>)}
                  </select>
                  {isWorking && (
                    <span className="text-xs text-gray-400">
                      ({Math.max(0, p.endH - p.startH)}h)
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Bottom save ── */}
      <div className="mt-6 pb-6">
        <button onClick={handleSave}
          className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-emerald-700 shadow-sm">
          {saved ? '✓ 送信済み' : '希望シフトを送信する'}
        </button>
        <p className="text-xs text-center text-gray-400 mt-2">マネージャーに通知されます</p>
      </div>
    </div>
  )
}
