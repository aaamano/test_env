import { useState, useRef } from 'react'
import { dailyTargets, YEAR_MONTH, storeConfig, calcRequiredStaff, ORDER_DISTRIBUTION } from '../../data/mockData'

const calcDayPeakStaff = (orders, productivity) => {
  const hours = Object.keys(ORDER_DISTRIBUTION).map(Number)
  return Math.max(...hours.map(h => calcRequiredStaff(orders, h, productivity, 0)))
}

const calcDayAvgStaff = (orders, productivity) => {
  const hours = Object.keys(ORDER_DISTRIBUTION).map(Number)
  const vals = hours.map(h => calcRequiredStaff(orders, h, productivity, 0))
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
}

const FIELDS = [
  { key: 'sales',     label: '売上目標(千円)', unit: '千円', color: 'text-blue-700' },
  { key: 'customers', label: '客数目標(名)',    unit: '名',  color: 'text-emerald-700' },
  { key: 'avgSpend',  label: '客単価(円)',      unit: '円',  color: 'text-amber-700' },
  { key: 'orders',    label: '注文数(件)',      unit: '件',  color: 'text-purple-700' },
]

export default function Targets() {
  const [targets, setTargets] = useState(dailyTargets)
  const [editingCell, setEditingCell] = useState(null)
  const [saved, setSaved] = useState(false)
  const [csvMsg, setCsvMsg] = useState('')
  const [activeChart, setActiveChart] = useState('sales')
  const fileInputRef = useRef(null)

  const update = (day, field, value) => {
    setTargets(prev => prev.map(d =>
      d.day !== day ? d : { ...d, [field]: Number(value) }
    ))
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const lines = ev.target.result.trim().split('\n')
        const parsed = lines.filter(l => /^\d+/.test(l.split(',')[0].trim())).map(line => {
          const p = line.split(',').map(s => s.trim())
          const day = parseInt(p[0]), dow = p[1] || ''
          const sales = parseFloat(p[2]) || 0
          const customers = Math.round(sales * 1000 / 3000)
          const avgSpend = customers > 0 ? Math.round(sales * 1000 / customers) : 3000
          const orders = parseInt(p[4]) || Math.round(customers * 1.5)
          return { day, dow, sales, customers, avgSpend, orders }
        }).filter(d => d.day >= 1 && d.day <= 31)
        if (!parsed.length) { setCsvMsg('CSVの形式が正しくありません。'); return }
        setTargets(prev => prev.map(d => { const f = parsed.find(p => p.day === d.day); return f ? { ...d, ...f } : d }))
        setCsvMsg(`✓ ${parsed.length}日分のデータを読み込みました`)
        setTimeout(() => setCsvMsg(''), 3000)
      } catch { setCsvMsg('CSVの読み込みに失敗しました。') }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const totalSales = targets.reduce((s, d) => s + d.sales, 0)
  const totalCust  = targets.reduce((s, d) => s + d.customers, 0)
  const avgSpend   = totalCust > 0 ? Math.round((totalSales * 1000) / totalCust) : 0
  const { avgProductivity } = storeConfig

  const chartMeta = {
    sales:     { label: '売上目標(千円)', color: '#3b82f6', getValue: d => d.sales },
    customers: { label: '客数目標(名)',   color: '#10b981', getValue: d => d.customers },
    avgSpend:  { label: '客単価(円)',     color: '#f59e0b', getValue: d => d.avgSpend },
  }
  const chart = chartMeta[activeChart]
  const chartMax = Math.max(...targets.map(chart.getValue), 1)

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-400 mb-1 font-mono">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">目標計画</h1>
          <p className="text-sm text-slate-500 mt-0.5">日別売上・客数・客単価の目標を設定します</p>
        </div>
        <div className="flex items-center gap-2">
          {csvMsg && <span className={`text-xs ${csvMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{csvMsg}</span>}
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            CSVアップロード
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            {saved ? '✓ 保存しました' : '保存する'}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '売上合計目標',   value: `¥${totalSales.toLocaleString()}千`, border: 'border-blue-200',    bg: 'bg-blue-50',    text: 'text-blue-900' },
          { label: '客数合計目標',   value: `${totalCust.toLocaleString()}名`,   border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-900' },
          { label: '平均客単価',     value: `¥${avgSpend.toLocaleString()}`,     border: 'border-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-900' },
          { label: '1日平均売上',    value: `¥${Math.round(totalSales/15).toLocaleString()}千`, border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-900' },
        ].map((k, i) => (
          <div key={i} className={`border ${k.border} ${k.bg} rounded-xl p-4 shadow-sm`}>
            <div className="text-xs text-slate-500 mb-1">{k.label}</div>
            <div className={`text-2xl font-bold ${k.text}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">目標グラフ</h2>
          <div className="flex gap-1">
            {Object.entries(chartMeta).map(([key, m]) => (
              <button key={key} onClick={() => setActiveChart(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeChart === key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1 h-28">
          {targets.map(d => {
            const val = chart.getValue(d)
            const h = Math.round((val / chartMax) * 100)
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full rounded-t-sm transition-all" style={{ height: `${h}%`, background: d.isWeekend ? chart.color : chart.color + 'bb' }} title={`${d.day}日: ${val.toLocaleString()}`} />
                <div className="text-[9px] text-slate-500">{d.day}</div>
                <div className={`text-[9px] font-medium ${d.dow === '土' || d.dow === '日' ? 'text-red-500' : 'text-slate-400'}`}>{d.dow}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CSV hint */}
      <div className="mb-4 text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-4 py-2">
        CSVフォーマット: <code className="bg-slate-100 px-1 rounded">日,曜日,売上(千円),客数,注文数</code>
      </div>

      {/* Editable table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-auto shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 min-w-[140px]">項目</th>
              {targets.map(d => (
                <th key={d.day} className={`text-center px-2 py-3 font-semibold min-w-[66px] ${d.dow === '土' || d.dow === '日' ? 'text-red-500 bg-red-50/50' : 'text-slate-600'}`}>
                  <div>{d.day}日</div>
                  <div className="text-xs font-normal">{d.dow}</div>
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-slate-600 bg-slate-100 min-w-[80px]">合計/平均</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(({ key, label, unit, color }) => (
              <tr key={key} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium text-slate-700 text-xs">{label}</td>
                {targets.map(d => (
                  <td key={d.day} className={`text-center py-1.5 px-1 ${d.dow === '土' || d.dow === '日' ? 'bg-red-50/30' : ''}`}>
                    {editingCell?.day === d.day && editingCell?.field === key ? (
                      <input type="number" defaultValue={d[key]} autoFocus
                        className="w-full text-center border-2 border-blue-400 rounded px-1 py-1 text-sm outline-none"
                        onBlur={e => { update(d.day, key, e.target.value); setEditingCell(null) }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
                    ) : (
                      <button onClick={() => setEditingCell({ day: d.day, field: key })}
                        className={`w-full text-sm font-semibold rounded px-1 py-1 hover:bg-blue-50 hover:text-blue-700 transition-colors ${color}`}>
                        {key === 'avgSpend' ? `¥${d[key].toLocaleString()}` : d[key].toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>
                      </button>
                    )}
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-slate-50 font-bold text-slate-700 text-sm">
                  {key === 'avgSpend' ? `¥${avgSpend.toLocaleString()}`
                    : key === 'sales' ? `${totalSales.toLocaleString()}千`
                    : key === 'customers' ? `${totalCust.toLocaleString()}`
                    : targets.reduce((s, d) => s + d[key], 0).toLocaleString()}
                </td>
              </tr>
            ))}

            {/* Required staff row */}
            <tr className="border-b border-indigo-100 bg-indigo-50">
              <td className="px-4 py-2.5 font-semibold text-indigo-700 text-xs">
                <div>必要人員数（推定）</div>
                <div className="font-normal text-indigo-400 mt-0.5">ピーク最大 / 平均</div>
              </td>
              {targets.map(d => {
                const peak = calcDayPeakStaff(d.orders, avgProductivity)
                const avg = calcDayAvgStaff(d.orders, avgProductivity)
                return (
                  <td key={d.day} className={`text-center py-2 px-1 ${d.isWeekend ? 'bg-indigo-100/50' : ''}`}>
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
        <div className="px-4 py-2 text-xs text-slate-400">
          ※ セルをクリックして直接編集できます。必要人員は注文数÷時間生産性({avgProductivity}件/h)で推定。
        </div>
      </div>
    </div>
  )
}
