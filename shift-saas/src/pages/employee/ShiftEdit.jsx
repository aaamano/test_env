import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { daysConfig, YEAR_MONTH, staff } from '../../data/mockData'

const ME = staff[0]
const WEEK_SIZE = 7

const TIME_SLOTS = [
  '5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00',
]

const SHIFT_OPTIONS = [
  { label: '希望あり', value: 'available', btn: 'bg-emerald-500 text-white', cell: 'bg-emerald-200 border-emerald-400' },
  { label: '第一希望', value: 'prefer',    btn: 'bg-blue-500 text-white',    cell: 'bg-blue-400 border-blue-600' },
  { label: '出勤不可', value: 'off',       btn: 'bg-red-400 text-white',     cell: 'bg-red-200 border-red-400' },
  { label: 'クリア',   value: null,        btn: 'bg-gray-200 text-gray-600', cell: '' },
]

export default function ShiftEdit() {
  const [cells, setCells] = useState({})
  const [mode, setMode] = useState('available')
  const [dragging, setDragging] = useState(false)
  const [weekPage, setWeekPage] = useState(0)
  const [targetEarnings, setTargetEarnings] = useState(ME.wage * 80)
  const [editingEarnings, setEditingEarnings] = useState(false)
  const [saved, setSaved] = useState(false)
  const startCell = useRef(null)
  const currentMode = useRef(mode)
  currentMode.current = mode

  const totalWeeks = Math.ceil(daysConfig.length / WEEK_SIZE)
  const visibleDays = daysConfig.slice(weekPage * WEEK_SIZE, weekPage * WEEK_SIZE + WEEK_SIZE)

  const cellKey = (day, si) => `${day}-${si}`

  const applyRange = useCallback((from, to) => {
    const d1 = Math.min(from.day, to.day), d2 = Math.max(from.day, to.day)
    const s1 = Math.min(from.si, to.si), s2 = Math.max(from.si, to.si)
    setCells(prev => {
      const next = { ...prev }
      for (let d = d1; d <= d2; d++) {
        for (let s = s1; s <= s2; s++) {
          const k = cellKey(d, s)
          if (currentMode.current === null) delete next[k]
          else next[k] = currentMode.current
        }
      }
      return next
    })
  }, [])

  const handleMouseDown = (day, si) => {
    setDragging(true)
    startCell.current = { day, si }
    applyRange({ day, si }, { day, si })
  }
  const handleMouseEnter = (day, si) => {
    if (!dragging || !startCell.current) return
    applyRange(startCell.current, { day, si })
  }
  const handleMouseUp = () => { setDragging(false); startCell.current = null }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const filledCount = Object.keys(cells).length
  const availCount  = Object.values(cells).filter(v => v === 'available' || v === 'prefer').length

  const getCellCls = (val, isWeekend) => {
    const base = 'h-8 border transition-colors cursor-crosshair'
    const wknd = isWeekend ? 'bg-red-50/40' : ''
    const opt = SHIFT_OPTIONS.find(o => o.value === val)
    if (opt && opt.cell) return `${base} ${opt.cell}`
    return `${base} ${wknd || 'bg-white border-gray-100'} hover:bg-emerald-50`
  }

  return (
    <div className="p-4 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{YEAR_MONTH} 前半</div>
          <h1 className="text-xl font-bold text-gray-900">希望シフト入力</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/employee" className="text-sm border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50">← 戻る</Link>
          <button onClick={handleSave}
            className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700">
            {saved ? '✓ 送信済み' : '送信する'}
          </button>
        </div>
      </div>

      {/* Target earnings */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs font-semibold text-emerald-700 mb-0.5">今月の目標収入</div>
          {editingEarnings ? (
            <input
              type="number"
              defaultValue={targetEarnings}
              autoFocus
              className="w-40 border-2 border-emerald-400 rounded-lg px-3 py-1 text-sm outline-none font-bold text-gray-900"
              onBlur={e => { setTargetEarnings(Number(e.target.value)); setEditingEarnings(false) }}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            />
          ) : (
            <button onClick={() => setEditingEarnings(true)}
              className="text-xl font-bold text-gray-900 hover:text-emerald-700 transition-colors">
              ¥{targetEarnings.toLocaleString()}
              <span className="text-xs font-normal text-emerald-500 ml-1">タップして編集</span>
            </button>
          )}
        </div>
        <div className="text-xs text-emerald-600 text-right leading-relaxed">
          設定した目標収入は<br/>マネージャーがシフト作成時に参考にします
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <span className="text-xs text-gray-500 font-medium">入力モード:</span>
        {SHIFT_OPTIONS.map(opt => (
          <button key={opt.value ?? 'clear'} onClick={() => setMode(opt.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
              mode === opt.value ? `${opt.btn} border-transparent shadow` : 'bg-white border-gray-200 text-gray-600'
            }`}>
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">希望可能: <strong className="text-emerald-600">{availCount}</strong> スロット</span>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekPage(p => Math.max(0, p - 1))} disabled={weekPage === 0}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50">
          ← 前の週
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {visibleDays[0]?.day}日〜{visibleDays[visibleDays.length - 1]?.day}日
        </span>
        <button onClick={() => setWeekPage(p => Math.min(totalWeeks - 1, p + 1))} disabled={weekPage >= totalWeeks - 1}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50">
          次の週 →
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <table className="border-collapse text-xs" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-900 text-white">
              <th className="py-2 px-2 text-left font-medium sticky left-0 bg-gray-900 w-14">時間帯</th>
              {visibleDays.map(d => (
                <th key={d.day} className={`py-2 text-center font-medium ${d.isWeekend ? 'text-red-300' : ''}`} style={{ minWidth: 52 }}>
                  <div>{d.day}日</div>
                  <div className="text-[9px] font-normal opacity-70">{d.dow}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, si) => (
              <tr key={slot} className="border-b border-gray-100">
                <td className="py-0 px-2 text-gray-500 font-semibold sticky left-0 bg-white border-r border-gray-200 whitespace-nowrap text-[10px]">
                  {slot}
                </td>
                {visibleDays.map(d => {
                  const val = cells[cellKey(d.day, si)]
                  return (
                    <td key={d.day}
                      className={getCellCls(val, d.isWeekend)}
                      onMouseDown={() => handleMouseDown(d.day, si)}
                      onMouseEnter={() => handleMouseEnter(d.day, si)}
                    >
                      {val === 'prefer' && <div className="flex items-center justify-center h-full text-white text-[9px] font-bold">★</div>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-emerald-400 bg-emerald-200 inline-block"/>希望あり</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-400 inline-block"/>第一希望（★）</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-red-400 bg-red-200 inline-block"/>出勤不可</span>
        <div className="ml-auto text-gray-400">ドラッグで範囲一括入力</div>
      </div>
    </div>
  )
}
