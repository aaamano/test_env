import { useState, useRef } from 'react'
import { dailyTargets, YEAR_MONTH, storeConfig, calcRequiredStaff, ORDER_DISTRIBUTION } from '../../data/mockData'

// Calculate peak required staff for a day (max across all hours)
const calcDayPeakStaff = (orders, productivity) => {
  const hours = Object.keys(ORDER_DISTRIBUTION).map(Number)
  return Math.max(...hours.map(h => calcRequiredStaff(orders, h, productivity, 0)))
}

// Calculate average required staff for a day
const calcDayAvgStaff = (orders, productivity) => {
  const hours = Object.keys(ORDER_DISTRIBUTION).map(Number)
  const vals = hours.map(h => calcRequiredStaff(orders, h, productivity, 0))
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
}

export default function Targets() {
  const [targets, setTargets] = useState(dailyTargets)
  const [editingCell, setEditingCell] = useState(null) // { day, field }
  const [saved, setSaved] = useState(false)
  const [csvMsg, setCsvMsg] = useState('')
  const fileInputRef = useRef(null)

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

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target.result
        const lines = text.trim().split('\n')
        // Skip header row if it starts with 日 or non-numeric
        const dataLines = lines.filter(l => {
          const first = l.split(',')[0].trim()
          return /^\d+$/.test(first)
        })
        const parsed = dataLines.map(line => {
          const parts = line.split(',').map(s => s.trim())
          const day = parseInt(parts[0])
          const dow = parts[1] || ''
          const sales = parseFloat(parts[2]) || 0
          const customers = Math.round(sales * 1000 / 3000)
          const orders = parseInt(parts[4]) || Math.round(customers * 1.5)
          const avgSpend = customers > 0 ? Math.round(sales * 1000 / customers) : 3000
          return { day, dow, sales, customers, avgSpend, orders }
        }).filter(d => d.day >= 1 && d.day <= 31)

        if (parsed.length === 0) {
          setCsvMsg('CSVの形式が正しくありません。')
          return
        }

        setTargets(prev => prev.map(d => {
          const found = parsed.find(p => p.day === d.day)
          return found ? { ...d, ...found } : d
        }))
        setCsvMsg(`✓ ${parsed.length}日分のデータを読み込みました`)
        setTimeout(() => setCsvMsg(''), 3000)
      } catch {
        setCsvMsg('CSVの読み込みに失敗しました。')
      }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const totalSales = targets.reduce((s, d) => s + d.sales, 0)
  const totalCust  = targets.reduce((s, d) => s + d.customers, 0)
  const avgSpend   = totalCust > 0 ? Math.round((totalSales * 1000) / totalCust) : 0

  const { avgProductivity } = storeConfig

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
        <div className="flex items-center gap-3">
          {/* CSV Upload */}
          <div className="flex items-center gap-2">
            {csvMsg && (
              <span className={`text-xs ${csvMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                {csvMsg}
              </span>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 transition-colors flex items-center gap-2"
            >
              📂 CSVアップロード
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {saved ? '✓ 保存しました' : '保存する'}
          </button>
        </div>
      </div>

      {/* CSV format hint */}
      <div className="mb-4 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
        CSVフォーマット: <code className="bg-gray-100 px-1 rounded">日,曜日,売上(千円),客数,注文数</code> — ヘッダー行は自動でスキップします
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
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px]">項目</th>
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

            {/* Required staffing row */}
            <tr className="border-b border-indigo-100 bg-indigo-50">
              <td className="px-4 py-2.5 font-semibold text-indigo-700 text-xs">
                <div>必要人員数（推定）</div>
                <div className="font-normal text-indigo-400 mt-0.5">ピーク最大 / 平均</div>
              </td>
              {targets.map(d => {
                const peak = calcDayPeakStaff(d.orders, avgProductivity)
                const avg = calcDayAvgStaff(d.orders, avgProductivity)
                return (
                  <td key={d.day} className={`text-center py-2 px-1 ${d.dow === '土' || d.dow === '日' ? 'bg-indigo-100/50' : ''}`}>
                    <div className="text-sm font-bold text-indigo-700">{peak}<span className="text-[10px] font-normal ml-0.5">名</span></div>
                    <div className="text-[10px] text-indigo-400">avg {avg}</div>
                  </td>
                )
              })}
              <td className="text-center py-2 px-3 bg-indigo-100 font-bold text-indigo-700 text-sm">
                {Math.round(targets.reduce((s, d) => s + calcDayPeakStaff(d.orders, avgProductivity), 0) / targets.length)}
                <span className="text-xs font-normal ml-0.5">名/日avg</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-2 text-xs text-gray-400">
          ※ セルをクリックして編集。客単価は売上÷客数で自動計算。必要人員は注文数÷時間生産性({avgProductivity}件/h)で推定。
        </div>
      </div>
    </div>
  )
}
