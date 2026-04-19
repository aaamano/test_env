import { Link } from 'react-router-dom'
import { staff, shiftData, daysConfig, dailyTargets, STORE_NAME, YEAR_MONTH } from '../../data/mockData'

/**
 * Returns className and display label for a shift code (bar-style visualization).
 * F = diagonal stripe (orange/salmon CSS pattern)
 * X = gray bg, gray text
 * O-* = solid teal-500
 * *-L = solid rose-500
 * others (mid shifts) = solid teal-400
 */
const getShiftStyle = (code) => {
  if (!code || code === 'X') {
    return { className: 'bg-gray-100 text-gray-400', label: '×' }
  }
  if (code === 'F') {
    return { className: 'shift-stripe text-orange-700 font-bold', label: 'F' }
  }
  if (code.startsWith('O-')) {
    return { className: 'bg-teal-500 text-white', label: code }
  }
  if (code.endsWith('-L')) {
    return { className: 'bg-rose-500 text-white', label: code }
  }
  // mid shifts like 9-18, 10-16, etc.
  return { className: 'bg-teal-400 text-white', label: code }
}

const totalMonth = dailyTargets.reduce((s, d) => s + d.sales, 0)
const totalCust  = dailyTargets.reduce((s, d) => s + d.customers, 0)

export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{STORE_NAME}</div>
          <h1 className="text-2xl font-bold text-gray-900">{YEAR_MONTH} 前半　計画一覧</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/manager/targets" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            目標設定 →
          </Link>
          <Link to="/manager/shift" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            シフト決定 →
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '前半 売上目標合計', value: `¥${totalMonth.toLocaleString()}千`, sub: '前年比 +3.2%', color: 'bg-blue-50 border-blue-200' },
          { label: '前半 客数目標', value: `${totalCust.toLocaleString()}名`, sub: '1日平均 ' + Math.round(totalCust/15) + '名', color: 'bg-emerald-50 border-emerald-200' },
          { label: '平均客単価', value: '¥3,006', sub: '目標 ¥3,000', color: 'bg-amber-50 border-amber-200' },
          { label: 'スタッフ数', value: `${staff.length}名`, sub: `正社員${staff.filter(s=>s.type==='F').length}名 / P${staff.filter(s=>s.type==='P').length}名`, color: 'bg-purple-50 border-purple-200' },
        ].map((k, i) => (
          <div key={i} className={`border rounded-xl p-4 ${k.color}`}>
            <div className="text-xs text-gray-500 mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded shift-stripe inline-block border border-orange-200" />
          <span className="text-gray-600">正社員(F) ストライプ</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-teal-500 inline-block" />
          <span className="text-gray-600">オープン</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-rose-500 inline-block" />
          <span className="text-gray-600">遅番(-L)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-teal-400 inline-block" />
          <span className="text-gray-600">中番</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gray-100 inline-block border" />
          <span className="text-gray-600">休み</span>
        </span>
      </div>

      {/* Shift Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">シフト一覧マトリクス — 4月前半（1〜15日）</h2>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-500 sticky left-0 bg-gray-50 border-r border-gray-100 min-w-[40px]">No</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500 sticky left-8 bg-gray-50 border-r border-gray-100 min-w-[120px]">スタッフ名</th>
              <th className="text-center px-1 py-2 font-medium text-gray-500 min-w-[36px]">種別</th>
              {daysConfig.map(d => (
                <th key={d.day} className={`text-center px-0.5 py-2 font-medium min-w-[52px] ${d.isWeekend ? 'text-red-500' : 'text-gray-500'}`}>
                  <div>{d.day}</div>
                  <div className="text-[9px]">{d.dow}</div>
                </th>
              ))}
              <th className="text-center px-2 py-2 font-medium text-gray-500 min-w-[50px]">出勤日数</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, idx) => {
              const row = shiftData[s.id] || []
              const workDays = row.filter(c => c && c !== 'X').length
              return (
                <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-3 py-1.5 text-gray-400 sticky left-0 bg-inherit border-r border-gray-100">{s.id}</td>
                  <td className="px-3 py-1.5 font-medium text-gray-800 sticky left-8 bg-inherit border-r border-gray-100 whitespace-nowrap">
                    <Link to={`/manager/members/${s.id}`} className="hover:text-blue-600 hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="text-center py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.type}
                    </span>
                  </td>
                  {daysConfig.map((d, di) => {
                    const code = row[di] || 'X'
                    const { className, label } = getShiftStyle(code)
                    return (
                      <td key={d.day} className="py-1 px-0.5">
                        <div className={`shift-cell ${className}`}>
                          {label}
                        </div>
                      </td>
                    )
                  })}
                  <td className="text-center py-1.5 font-semibold text-gray-700">{workDays}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-blue-200">
              <td colSpan={3} className="px-3 py-2 text-xs font-bold text-blue-800">日別 出勤人数</td>
              {daysConfig.map((d, di) => {
                const count = staff.filter(s => {
                  const row = shiftData[s.id] || []
                  return row[di] && row[di] !== 'X'
                }).length
                return (
                  <td key={d.day} className="text-center py-2 font-bold text-blue-800 text-xs">{count}</td>
                )
              })}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
