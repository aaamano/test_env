import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { daysConfig, YEAR_MONTH } from '../../data/mockData'

const TIME_SLOTS = [
  '5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00',
]

const SHIFT_OPTIONS = [
  { label: '希望あり',   value: 'available', color: 'bg-emerald-400' },
  { label: '第一希望',   value: 'prefer',    color: 'bg-blue-500' },
  { label: '不可',       value: 'off',       color: 'bg-red-300' },
  { label: 'クリア',     value: null,        color: 'bg-gray-200' },
]

export default function ShiftEdit() {
  const [cells, setCells] = useState({}) // key: `${day}-${slot}` -> value
  const [mode, setMode] = useState('available')
  const [dragging, setDragging] = useState(false)
  const [saved, setSaved] = useState(false)
  const startCell = useRef(null)
  const currentMode = useRef(mode)
  currentMode.current = mode

  const cellKey = (day, slot) => `${day}-${slot}`

  const setRange = useCallback((from, to) => {
    const d1 = Math.min(from.day, to.day)
    const d2 = Math.max(from.day, to.day)
    const s1 = Math.min(from.slot, to.slot)
    const s2 = Math.max(from.slot, to.slot)
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

  const handleMouseDown = (day, slotIdx) => {
    setDragging(true)
    startCell.current = { day, slot: slotIdx }
    setRange({ day, slot: slotIdx }, { day, slot: slotIdx })
  }

  const handleMouseEnter = (day, slotIdx) => {
    if (!dragging || !startCell.current) return
    setRange(startCell.current, { day, slot: slotIdx })
  }

  const handleMouseUp = () => {
    setDragging(false)
    startCell.current = null
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const filledCount = Object.keys(cells).length
  const availCount = Object.values(cells).filter(v => v === 'available' || v === 'prefer').length

  const getCellStyle = (val) => {
    if (!val) return 'bg-white border-gray-200 hover:bg-emerald-50'
    if (val === 'available') return 'bg-emerald-200 border-emerald-400'
    if (val === 'prefer')    return 'bg-blue-400 border-blue-600'
    if (val === 'off')       return 'bg-red-200 border-red-400'
    return ''
  }

  return (
    <div className="p-6 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-gray-900">希望シフト入力</h1>
          <p className="text-sm text-gray-500 mt-1">ドラッグで範囲選択。マスをタップ/クリックしてシフト希望を入力できます。</p>
        </div>
        <div className="flex gap-3">
          <Link to="/employee" className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">
            ← 戻る
          </Link>
          <button
            onClick={handleSave}
            className="text-sm bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            {saved ? '✓ 送信しました！' : '希望を送信する'}
          </button>
        </div>
      </div>

      {/* Stats + mode selector */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        {/* Mode buttons */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500 font-medium">入力モード:</span>
          {SHIFT_OPTIONS.map(opt => (
            <button
              key={opt.value ?? 'clear'}
              onClick={() => setMode(opt.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
                mode === opt.value
                  ? `${opt.color} text-white border-transparent shadow`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-gray-500 flex gap-4">
          <span>入力済み: <strong>{filledCount}</strong> スロット</span>
          <span>希望可能: <strong className="text-emerald-600">{availCount}</strong> スロット</span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <table className="border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-900 text-white">
              <th className="py-2 px-2 text-left font-medium sticky left-0 bg-gray-900 w-16">時間帯</th>
              {daysConfig.map(d => (
                <th key={d.day} className={`py-2 text-center font-medium w-14 ${d.isWeekend ? 'text-red-300' : ''}`}>
                  <div>{d.day}日</div>
                  <div className="text-[9px] font-normal opacity-70">{d.dow}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, si) => (
              <tr key={slot} className="border-b border-gray-100">
                <td className="py-1 px-2 text-gray-500 font-semibold sticky left-0 bg-white border-r border-gray-200 whitespace-nowrap text-[11px]">
                  {slot}
                </td>
                {daysConfig.map(d => {
                  const key = cellKey(d.day, si)
                  const val = cells[key]
                  return (
                    <td
                      key={d.day}
                      className={`h-8 border border-gray-100 cursor-crosshair transition-colors ${getCellStyle(val)} ${d.isWeekend ? 'bg-red-50/30' : ''}`}
                      onMouseDown={() => handleMouseDown(d.day, si)}
                      onMouseEnter={() => handleMouseEnter(d.day, si)}
                    >
                      {val === 'prefer' && (
                        <div className="flex items-center justify-center h-full text-white text-[9px] font-bold">★</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-emerald-400 bg-emerald-200 inline-block"/>希望あり</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-400 inline-block"/>第一希望（★）</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-red-400 bg-red-200 inline-block"/>出勤不可</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-gray-200 bg-white inline-block"/>未入力</span>
        <div className="ml-auto text-gray-400">ドラッグで複数セルを一括選択できます</div>
      </div>
    </div>
  )
}
