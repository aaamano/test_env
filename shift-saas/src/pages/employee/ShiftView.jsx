import { Link } from 'react-router-dom'
import { staff, shiftData, daysConfig, YEAR_MONTH } from '../../data/mockData'

const ME = staff[0] // 金子 光男 as logged-in user
const myRow = shiftData[ME.id] || []

const getShiftColor = (code) => {
  if (!code || code === 'X') return { bar: 'bg-gray-100', text: 'text-gray-400', label: '休み' }
  if (code === 'F') return { bar: 'bg-green-500', text: 'text-green-700', label: 'フル' }
  if (code.startsWith('O')) return { bar: 'bg-blue-500', text: 'text-blue-700', label: code }
  if (code.endsWith('L')) return { bar: 'bg-purple-500', text: 'text-purple-700', label: code }
  return { bar: 'bg-amber-500', text: 'text-amber-700', label: code }
}

const parseHours = (code) => {
  if (!code || code === 'X') return null
  if (code === 'F') return { start: 9, end: 18 }
  const m = code.match(/(\d+(?:\.\d+)?)[\.-](\d+(?:\.\d+)?|L)/)
  if (!m) return { start: 9, end: 18 }
  return {
    start: parseFloat(m[1]),
    end: m[2] === 'L' ? 22 : parseFloat(m[2]),
  }
}

const timeRange = Array.from({ length: 14 }, (_, i) => i + 8) // 8〜21

export default function ShiftView() {
  const workDays = myRow.filter(c => c && c !== 'X').length
  const totalH = myRow.reduce((sum, code) => {
    const h = parseHours(code)
    if (!h) return sum
    return sum + Math.max(0, h.end - h.start - 1)
  }, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-gray-900">シフト確認</h1>
          <p className="text-sm text-gray-500 mt-1">{ME.name} さんの確定シフト</p>
        </div>
        <Link
          to="/employee/edit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          ✏️ 希望シフトを入力する
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '出勤日数',     value: `${workDays}日`,   sub: '前半 15日中',     color: 'bg-emerald-50 border-emerald-200' },
          { label: '想定労働時間', value: `${totalH}h`,      sub: '休憩除く',        color: 'bg-blue-50 border-blue-200' },
          { label: '想定給与',     value: `¥${(totalH * ME.wage).toLocaleString()}`, sub: '税引前概算', color: 'bg-amber-50 border-amber-200' },
        ].map((k, i) => (
          <div key={i} className={`border rounded-xl p-4 ${k.color}`}>
            <div className="text-xs text-gray-500 mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Gantt-style timeline */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto mb-5">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">タイムライン表示</h2>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"/>フル</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block"/>オープン</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500 inline-block"/>遅番</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"/>中番</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-500 sticky left-0 bg-gray-50 min-w-[60px] border-r border-gray-200">日付</th>
                {timeRange.map(h => (
                  <th key={h} className="text-center font-medium text-gray-400 py-2 border-l border-gray-100" style={{ minWidth: 48 }}>
                    {h}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysConfig.map((d, di) => {
                const code = myRow[di] || 'X'
                const hours = parseHours(code)
                const { text } = getShiftColor(code)
                return (
                  <tr key={d.day} className={`border-b border-gray-100 ${d.isWeekend ? 'bg-red-50/20' : ''}`}>
                    <td className="px-3 py-1.5 sticky left-0 bg-inherit border-r border-gray-200 whitespace-nowrap">
                      <span className={`font-semibold ${d.isWeekend ? 'text-red-500' : 'text-gray-700'}`}>{d.day}日</span>
                      <span className={`ml-1 text-[10px] ${d.isWeekend ? 'text-red-400' : 'text-gray-400'}`}>{d.dow}</span>
                    </td>
                    {timeRange.map(h => {
                      const inShift = hours && h >= hours.start && h < hours.end
                      const isStart = hours && h === Math.floor(hours.start)
                      const isEnd = hours && h === Math.floor(hours.end) - 1
                      return (
                        <td key={h} className="py-1 border-l border-gray-100" style={{ minWidth: 48 }}>
                          {inShift ? (
                            <div className={`h-6 mx-0.5 ${
                              code === 'F' ? 'bg-green-400' :
                              code.startsWith('O') ? 'bg-blue-400' :
                              code.endsWith('L') ? 'bg-purple-400' :
                              'bg-amber-400'
                            } ${isStart ? 'rounded-l-md' : ''} ${isEnd ? 'rounded-r-md' : ''}`}>
                              {isStart && (
                                <span className="text-white text-[10px] px-1 font-medium leading-6 block whitespace-nowrap overflow-hidden">
                                  {code}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="h-6" />
                          )}
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

      {/* Colleague schedule preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">同僚スケジュール（前半7日間）</h2>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-500 sticky left-0 bg-gray-50 border-r border-gray-100 min-w-[120px]">スタッフ名</th>
              {daysConfig.slice(0, 7).map(d => (
                <th key={d.day} className={`text-center px-1 py-2 font-medium min-w-[52px] ${d.isWeekend ? 'text-red-400' : 'text-gray-500'}`}>
                  {d.day}日<br/><span className="text-[9px]">{d.dow}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.slice(0, 10).map((s, idx) => {
              const row = shiftData[s.id] || []
              return (
                <tr key={s.id} className={`border-b border-gray-100 ${s.id === ME.id ? 'bg-emerald-50' : idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className={`px-4 py-1.5 font-medium sticky left-0 bg-inherit border-r border-gray-100 ${s.id === ME.id ? 'text-emerald-700' : 'text-gray-700'}`}>
                    {s.name}{s.id === ME.id && <span className="ml-1 text-[10px] text-emerald-500">（あなた）</span>}
                  </td>
                  {daysConfig.slice(0, 7).map((d, di) => {
                    const code = row[di] || 'X'
                    const { bar } = getShiftColor(code)
                    return (
                      <td key={d.day} className="py-1 px-0.5">
                        <div className={`text-center text-[10px] font-medium rounded px-0.5 py-1 ${
                          code === 'X' ? 'bg-gray-100 text-gray-400' :
                          code === 'F' ? 'bg-green-100 text-green-700' :
                          code.startsWith('O') ? 'bg-blue-100 text-blue-700' :
                          code.endsWith('L') ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {code === 'X' ? '×' : code}
                        </div>
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
  )
}
