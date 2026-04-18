import { useParams, Link } from 'react-router-dom'
import { staff, shiftData, daysConfig, skillLabels, YEAR_MONTH } from '../../data/mockData'

const getShiftColor = (code) => {
  if (!code || code === 'X') return 'bg-gray-100 text-gray-400'
  if (code === 'F') return 'bg-green-100 text-green-700'
  if (code.startsWith('O')) return 'bg-blue-100 text-blue-700'
  if (code.endsWith('L')) return 'bg-purple-100 text-purple-700'
  return 'bg-amber-100 text-amber-700'
}

export default function MemberDetail() {
  const { id } = useParams()
  const member = staff.find(s => s.id === Number(id))

  if (!member) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="text-4xl mb-4">🔍</div>
        <div>メンバーが見つかりません</div>
        <Link to="/manager/members" className="text-blue-600 hover:underline mt-2 inline-block">← 一覧に戻る</Link>
      </div>
    )
  }

  const row = shiftData[member.id] || []
  const workDays = row.filter(c => c && c !== 'X').length
  const totalHours = row.reduce((sum, code) => {
    if (!code || code === 'X') return sum
    if (code === 'F') return sum + 8
    const m = code.match(/(\d+)[\.-](\d+|L)/)
    if (!m) return sum + 6
    const start = parseInt(m[1])
    const end = m[2] === 'L' ? 22 : parseInt(m[2])
    return sum + Math.max(0, end - start - 1)
  }, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/manager/members" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
          ← メンバー一覧
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {member.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${member.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {member.type === 'F' ? '正社員' : 'パート/バイト'}
                </span>
                <span className="text-sm text-gray-500">{member.role}</span>
              </div>
            </div>
          </div>
          <Link to={`/manager/members`} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            編集する
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '今月出勤日数',   value: `${workDays}日`,        color: 'bg-blue-50 border-blue-200' },
          { label: '想定労働時間',   value: `${totalHours}h`,       color: 'bg-emerald-50 border-emerald-200' },
          { label: '時間生産性',     value: `${member.hourlyOrders}件/h`, color: 'bg-amber-50 border-amber-200' },
          { label: '時給',           value: `¥${member.wage.toLocaleString()}`, color: 'bg-purple-50 border-purple-200' },
        ].map((k, i) => (
          <div key={i} className={`border rounded-xl p-4 ${k.color}`}>
            <div className="text-xs text-gray-500 mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">スキル・能力</h2>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(skillLabels).map(([k, v]) => (
            <div key={k} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${
              member.skills.includes(k)
                ? k === 'barista'
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : k === 'cashier'
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-gray-100 border-gray-300 text-gray-700'
                : 'bg-gray-50 border-gray-200 text-gray-300'
            }`}>
              <span>{member.skills.includes(k) ? '✓' : '—'}</span>
              {v}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          時間生産性係数 <strong>{member.hourlyOrders}</strong> は、1時間あたりに処理できる注文数の想定値です。シフト配置時の必要人員計算に使用されます。
        </div>
      </div>

      {/* Shift calendar */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">{YEAR_MONTH} 前半シフト</h2>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {daysConfig.map(d => (
                <th key={d.day} className={`text-center px-1 py-2 font-medium min-w-[52px] ${d.isWeekend ? 'text-red-500' : 'text-gray-500'}`}>
                  <div>{d.day}日</div>
                  <div className="text-[9px] font-normal">{d.dow}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {daysConfig.map((d, di) => {
                const code = row[di] || 'X'
                return (
                  <td key={d.day} className={`py-2 px-0.5 ${d.isWeekend ? 'bg-red-50/30' : ''}`}>
                    <div className={`text-center rounded py-2 px-1 font-medium ${getShiftColor(code)}`}>
                      {code === 'X' ? '休' : code}
                    </div>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
