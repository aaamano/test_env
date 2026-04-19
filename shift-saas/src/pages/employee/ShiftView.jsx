import { Link } from 'react-router-dom'
import { staff, shiftData, daysConfig, YEAR_MONTH } from '../../data/mockData'

const ME = staff[0]
const myRow = shiftData[ME.id] || []

const parseHours = (code) => {
  if (!code || code === 'X') return null
  if (code === 'F') return { start: 9, end: 18 }
  const m = code.match(/^O-(\d+(?:\.\d+)?)$/)
  if (m) return { start: 9, end: parseFloat(m[1]) }
  const m2 = code.match(/^(\d+(?:\.\d+)?)[.-](\d+(?:\.\d+)?|L)$/)
  if (m2) return { start: parseFloat(m2[1]), end: m2[2] === 'L' ? 22 : parseFloat(m2[2]) }
  return { start: 9, end: 18 }
}

const getShiftBadge = (code) => {
  if (!code || code === 'X') return { cls: 'bg-gray-100 text-gray-400', label: '休み' }
  if (code === 'F') return { cls: 'bg-green-100 text-green-700', label: 'フル' }
  if (code.startsWith('O')) return { cls: 'bg-blue-100 text-blue-700', label: code }
  if (code.endsWith('L')) return { cls: 'bg-purple-100 text-purple-700', label: code }
  return { cls: 'bg-amber-100 text-amber-700', label: code }
}

const timeRange = Array.from({ length: 14 }, (_, i) => i + 8)

export default function ShiftView() {
  const workDays = myRow.filter(c => c && c !== 'X').length
  const totalH = myRow.reduce((sum, code) => {
    const h = parseHours(code)
    return h ? sum + Math.max(0, h.end - h.start - 1) : sum
  }, 0)

  return (
    <div className="p-4 max-w-2xl mx-auto md:max-w-none">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-xl font-bold text-gray-900">シフト確認</h1>
          <p className="text-sm text-gray-500">{ME.name} さんの確定シフト</p>
        </div>
        <Link to="/employee/edit"
          className="flex-shrink-0 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
          ✏️ 希望入力
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '出勤日数', value: `${workDays}日`, sub: '前半 15日中', color: 'bg-emerald-50 border-emerald-200' },
          { label: '労働時間', value: `${totalH}h`, sub: '休憩除く想定', color: 'bg-blue-50 border-blue-200' },
          { label: '想定給与', value: `¥${(totalH * ME.wage / 10000).toFixed(1)}万`, sub: '税引前概算', color: 'bg-amber-50 border-amber-200' },
        ].map((k, i) => (
          <div key={i} className={`border rounded-xl p-3 ${k.color}`}>
            <div className="text-xs text-gray-500 mb-0.5">{k.label}</div>
            <div className="text-xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Shift list (mobile-friendly card view) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">日別シフト</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {daysConfig.map((d, di) => {
            const code = myRow[di] || 'X'
            const badge = getShiftBadge(code)
            const hours = parseHours(code)
            return (
              <div key={d.day} className={`flex items-center px-4 py-3 ${d.isWeekend ? 'bg-red-50/30' : ''}`}>
                <div className="w-16 flex-shrink-0">
                  <span className={`text-sm font-bold ${d.isWeekend ? 'text-red-600' : 'text-gray-700'}`}>{d.day}日</span>
                  <span className={`ml-1.5 text-xs ${d.isWeekend ? 'text-red-400' : 'text-gray-400'}`}>{d.dow}</span>
                </div>
                <div className="flex-1">
                  {hours ? (
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                      <span className="text-xs text-gray-500">{hours.start}:00 〜 {hours.end === 22 ? '閉店' : `${hours.end}:00`}</span>
                      <span className="text-xs text-gray-400">{Math.max(0, hours.end - hours.start - 1)}h</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">休み</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gantt timeline (scrollable on mobile) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">タイムライン表示</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs" style={{ minWidth: 700 }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left font-medium text-gray-500 sticky left-0 bg-gray-100 w-16 border-r border-gray-200">日付</th>
                {timeRange.map(h => (
                  <th key={h} className="text-center font-medium text-gray-400 py-2 border-l border-gray-100" style={{ minWidth: 44 }}>{h}:00</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysConfig.map((d, di) => {
                const code = myRow[di] || 'X'
                const hours = parseHours(code)
                return (
                  <tr key={d.day} className={`border-b border-gray-100 ${d.isWeekend ? 'bg-red-50/20' : ''}`}>
                    <td className="px-3 py-1.5 sticky left-0 bg-inherit border-r border-gray-200 whitespace-nowrap">
                      <span className={`font-semibold ${d.isWeekend ? 'text-red-500' : 'text-gray-700'}`}>{d.day}</span>
                      <span className={`ml-1 text-[10px] ${d.isWeekend ? 'text-red-400' : 'text-gray-400'}`}>{d.dow}</span>
                    </td>
                    {timeRange.map(h => {
                      const inShift = hours && h >= hours.start && h < hours.end
                      const isStart = hours && h === Math.floor(hours.start)
                      const isEnd   = hours && h === Math.floor(hours.end) - 1
                      return (
                        <td key={h} className="py-1 border-l border-gray-100" style={{ minWidth: 44 }}>
                          {inShift ? (
                            <div className={`h-6 mx-0.5 ${code === 'F' ? 'bg-green-400' : code.startsWith('O') ? 'bg-blue-400' : code.endsWith('L') ? 'bg-purple-400' : 'bg-amber-400'}
                              ${isStart ? 'rounded-l-md' : ''} ${isEnd ? 'rounded-r-md' : ''}`}>
                              {isStart && <span className="text-white text-[9px] px-1 font-medium leading-6 block overflow-hidden whitespace-nowrap">{code}</span>}
                            </div>
                          ) : <div className="h-6" />}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
