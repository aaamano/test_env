import { useState } from 'react'
import { dailyTargets, YEAR_MONTH } from '../../data/mockData'

export default function Targets() {
  const [targets, setTargets] = useState(dailyTargets)
  const [editingCell, setEditingCell] = useState(null) // { day, field }
  const [saved, setSaved] = useState(false)

  const update = (day, field, value) => {
    setTargets(prev => prev.map(d => {
      if (d.day !== day) return d
      const next = { ...d, [field]: Number(value) }
      if (field === 'sales' || field === 'customers') {
        next.avgSpend = next.customers > 0 ? Math.round((next.sales * 1000) / next.customers) : 0
        next.orders = Math.round(next.customers * 1.5)
      }
      return next
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalSales = targets.reduce((s, d) => s + d.sales, 0)
  const totalCust  = targets.reduce((s, d) => s + d.customers, 0)
  const avgSpend   = totalCust > 0 ? Math.round((totalSales * 1000) / totalCust) : 0

  const FIELDS = [
    { key: 'sales',     label: '売上目標(千円)',  unit: '千円', color: 'text-blue-700' },
    { key: 'customers', label: '客数目標(名)',     unit: '名',  color: 'text-emerald-700' },
    { key: 'avgSpend',  label: '客単価(円)',       unit: '円',  color: 'text-amber-700', readonly: true },
    { key: 'orders',    label: '注文数(件)',       unit: '件',  color: 'text-purple-700' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-gray-900">目標計画 — デイリー設定</h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {saved ? '✓ 保存しました' : '保存する'}
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '前半 売上合計目標', value: `¥${totalSales.toLocaleString()}千`, color: 'border-blue-300 bg-blue-50' },
          { label: '前半 客数合計目標', value: `${totalCust.toLocaleString()}名`, color: 'border-emerald-300 bg-emerald-50' },
          { label: '平均客単価',        value: `¥${avgSpend.toLocaleString()}`, color: 'border-amber-300 bg-amber-50' },
          { label: '1日平均売上',       value: `¥${Math.round(totalSales/15).toLocaleString()}千`, color: 'border-purple-300 bg-purple-50' },
        ].map((k, i) => (
          <div key={i} className={`border rounded-xl p-4 ${k.color}`}>
            <div className="text-xs text-gray-500 mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Chart bar preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">売上目標プレビュー（棒グラフ）</h2>
        <div className="flex items-end gap-1 h-28">
          {targets.map(d => {
            const maxSales = Math.max(...targets.map(t => t.sales))
            const h = Math.round((d.sales / maxSales) * 100)
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className={`w-full rounded-t transition-all ${d.dow === '土' || d.dow === '日' ? 'bg-blue-400' : 'bg-blue-200'}`}
                  style={{ height: `${h}%` }}
                  title={`${d.day}日: ¥${d.sales}千`}
                />
                <div className="text-[9px] text-gray-500">{d.day}</div>
                <div className={`text-[9px] font-medium ${d.dow === '土' || d.dow === '日' ? 'text-red-500' : 'text-gray-400'}`}>{d.dow}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editable Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[100px]">項目</th>
              {targets.map(d => (
                <th key={d.day} className={`text-center px-2 py-3 font-semibold min-w-[72px] ${
                  d.dow === '土' || d.dow === '日' ? 'text-red-500 bg-red-50/50' : 'text-gray-600'
                }`}>
                  <div>{d.day}日</div>
                  <div className="text-xs font-normal">{d.dow}</div>
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-gray-600 bg-gray-100 min-w-[80px]">合計/平均</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(({ key, label, unit, color, readonly }) => (
              <tr key={key} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-4 py-2.5 font-medium text-gray-700 text-xs">{label}</td>
                {targets.map(d => (
                  <td key={d.day} className={`text-center py-1.5 px-1 ${d.dow === '土' || d.dow === '日' ? 'bg-red-50/30' : ''}`}>
                    {readonly ? (
                      <div className={`text-sm font-semibold ${color}`}>
                        {key === 'avgSpend' ? `¥${d[key].toLocaleString()}` : d[key].toLocaleString()}
                      </div>
                    ) : editingCell?.day === d.day && editingCell?.field === key ? (
                      <input
                        type="number"
                        defaultValue={d[key]}
                        autoFocus
                        className="w-full text-center border-2 border-blue-400 rounded px-1 py-1 text-sm outline-none"
                        onBlur={e => { update(d.day, key, e.target.value); setEditingCell(null) }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingCell({ day: d.day, field: key })}
                        className={`w-full text-sm font-semibold rounded px-1 py-1 hover:bg-blue-50 hover:text-blue-700 transition-colors ${color}`}
                      >
                        {d[key].toLocaleString()}
                        <span className="text-[10px] font-normal text-gray-400 ml-0.5">{unit}</span>
                      </button>
                    )}
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-gray-50 font-bold text-gray-700 text-sm">
                  {key === 'avgSpend'
                    ? `¥${avgSpend.toLocaleString()}`
                    : key === 'sales'
                    ? `${totalSales.toLocaleString()}千`
                    : key === 'customers'
                    ? `${totalCust.toLocaleString()}`
                    : `${targets.reduce((s, d) => s + d[key], 0).toLocaleString()}`
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 text-xs text-gray-400">
          ※ セルをクリックして編集。客単価は売上÷客数で自動計算。
        </div>
      </div>
    </div>
  )
}
