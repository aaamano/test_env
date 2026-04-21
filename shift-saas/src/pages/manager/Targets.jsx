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

const ACTUAL_RATIO = [0.98, 0.93, 1.04, 1.06, 0.97, 1.01, 1.05, 0.99, 1.03, 0.95, 1.00, 1.07, 0.98, 1.02, 0.96]

function SVGLineChart({ targets, meta }) {
  const planVals   = targets.map(d => meta.getValue(d))
  const actualVals = targets.map((d, i) => Math.round(meta.getValue(d) * ACTUAL_RATIO[i]))

  const allVals = [...planVals, ...actualVals]
  const dataMin = Math.min(...allVals)
  const dataMax = Math.max(...allVals)
  const yMin = dataMin * 0.88
  const yMax = dataMax * 1.08

  const W = 700, H = 188
  const L = 62, R = 16, T = 12, B = 40
  const PW = W - L - R
  const PH = H - T - B

  const xp = i => L + (i / (targets.length - 1)) * PW
  const yp = v => T + PH - ((v - yMin) / (yMax - yMin || 1)) * PH

  const planPts = planVals.map((v, i) => `${xp(i).toFixed(1)},${yp(v).toFixed(1)}`).join(' ')
  const actPts  = actualVals.map((v, i) => `${xp(i).toFixed(1)},${yp(v).toFixed(1)}`).join(' ')

  const gridVals = Array.from({ length: 5 }, (_, i) => yMin + (yMax - yMin) * i / 4)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'100%' }}>
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={L} y1={yp(v).toFixed(1)} x2={W - R} y2={yp(v).toFixed(1)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={L - 5} y={yp(v) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="system-ui, sans-serif">
            {Math.round(v).toLocaleString('ja-JP')}
          </text>
        </g>
      ))}
      <polyline points={planPts}  fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="6 3" strokeLinejoin="round" />
      <polyline points={actPts}   fill="none" stroke="#10b981" strokeWidth="2"   strokeLinejoin="round" />
      {planVals.map((v, i) => (
        <circle key={i} cx={xp(i).toFixed(1)} cy={yp(v).toFixed(1)} r="2.8" fill="white" stroke="#a5b4fc" strokeWidth="1.5" />
      ))}
      {actualVals.map((v, i) => (
        <circle key={i} cx={xp(i).toFixed(1)} cy={yp(v).toFixed(1)} r="3"   fill="white" stroke="#10b981" strokeWidth="2" />
      ))}
      {targets.map((d, i) => (
        <text key={d.day} x={xp(i).toFixed(1)} y={T + PH + 15} textAnchor="middle" fontSize="9" fill={d.isWeekend ? '#f87171' : '#94a3b8'} fontFamily="system-ui, sans-serif">
          {d.day}日
        </text>
      ))}
    </svg>
  )
}

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

  const totalSales  = targets.reduce((s, d) => s + d.sales, 0)
  const totalCust   = targets.reduce((s, d) => s + d.customers, 0)
  const totalOrders = targets.reduce((s, d) => s + d.orders, 0)
  const avgSpend    = totalCust > 0 ? Math.round((totalSales * 1000) / totalCust) : 0
  const { avgProductivity } = storeConfig

  const chartMeta = {
    sales:     { label: '売上(千円)', color: '#818cf8', getValue: d => d.sales },
    customers: { label: '客数(名)',   color: '#10b981', getValue: d => d.customers },
    avgSpend:  { label: '客単価(円)', color: '#f59e0b', getValue: d => d.avgSpend },
  }

  const kpiCards = [
    { label: '前半 売上目標合計', value: `¥${totalSales.toLocaleString()}千`,  sub: `1日平均 ¥${Math.round(totalSales/15).toLocaleString()}千`, bg:'bg-blue-50',   border:'border-blue-100',   val:'text-blue-800',   sub2:'text-blue-400' },
    { label: '前半 客数目標',     value: `${totalCust.toLocaleString()}名`,    sub: `1日平均 ${Math.round(totalCust/15)}名`,                   bg:'bg-emerald-50', border:'border-emerald-100', val:'text-emerald-800', sub2:'text-emerald-400' },
    { label: '平均客単価',        value: `¥${avgSpend.toLocaleString()}`,      sub: `目標 ¥3,000`,                                             bg:'bg-amber-50',   border:'border-amber-100',   val:'text-amber-800',  sub2:'text-amber-400' },
    { label: '注文数目標',        value: `${totalOrders.toLocaleString()}件`,  sub: `1日平均 ${Math.round(totalOrders/15)}件`,                  bg:'bg-violet-50',  border:'border-violet-100',  val:'text-violet-800', sub2:'text-violet-400' },
  ]

  return (
    <div className="mgr-page">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:11, color:'#94a3b8', marginBottom:4 }}>{YEAR_MONTH} 前半</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', letterSpacing:'-0.01em', margin:0 }}>目標計画</h1>
          <p style={{ fontSize:12, color:'#64748b', marginTop:4, marginBottom:0 }}>日別売上・客数・客単価の目標を設定します</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {csvMsg && <span style={{ fontSize:12, color: csvMsg.startsWith('✓') ? '#10b981' : '#ef4444' }}>{csvMsg}</span>}
          <button onClick={() => fileInputRef.current?.click()} className="mgr-btn-secondary">
            CSV アップロード
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          <button onClick={handleSave} className="mgr-btn-primary">
            {saved ? '✓ 保存しました' : '保存する'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {kpiCards.map((k, i) => (
          <div key={i} style={{
            background: ['#eef2ff','#d1fae5','#fef3c7','#ede9fe'][i],
            border: `1px solid ${['#c7d2fe','#a7f3d0','#fde68a','#ddd6fe'][i]}`,
            borderRadius:12, padding:'16px 18px',
            boxShadow:'0 1px 3px rgba(15,23,42,0.04)',
          }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>{k.label}</div>
            <div style={{ fontSize:24, fontWeight:700, lineHeight:1.2, color:['#3730a3','#065f46','#92400e','#5b21b6'][i], marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mgr-card" style={{ padding:'20px 20px 14px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <h2 style={{ fontSize:14, fontWeight:600, color:'#0f172a', margin:0 }}>
            目標グラフ <span style={{ fontSize:12, fontWeight:400, color:'#94a3b8', marginLeft:4 }}>— 計画 vs 参考実績</span>
          </h2>
          <div style={{ display:'flex', gap:4 }}>
            {Object.entries(chartMeta).map(([key, m]) => (
              <button key={key} onClick={() => setActiveChart(key)}
                style={{
                  padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight: activeChart === key ? 600 : 400,
                  background: activeChart === key ? '#0f172a' : '#f0f5f9',
                  color: activeChart === key ? 'white' : '#64748b',
                  border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 188 }}>
          <SVGLineChart targets={targets} meta={chartMeta[activeChart]} />
        </div>
        <div style={{ display:'flex', gap:20, fontSize:11, color:'#64748b', marginTop:4, paddingLeft:62 }}>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="20" height="10" style={{ display:'block' }}><line x1="0" y1="5" x2="20" y2="5" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="6 3" /></svg>
            計画
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="20" height="10" style={{ display:'block' }}><line x1="0" y1="5" x2="20" y2="5" stroke="#10b981" strokeWidth="2" /><circle cx="10" cy="5" r="3" fill="white" stroke="#10b981" strokeWidth="2" /></svg>
            実績（参考）
          </span>
        </div>
      </div>

      {/* CSV hint */}
      <div style={{ marginBottom:16, fontSize:12, color:'#94a3b8', background:'white', border:'1px solid #dde5f0', borderRadius:8, padding:'8px 16px' }}>
        CSVフォーマット: <code style={{ background:'#f0f5f9', padding:'1px 5px', borderRadius:4, fontFamily:'monospace' }}>日,曜日,売上(千円),客数,注文数</code>
      </div>

      {/* Editable table */}
      <div className="mgr-card" style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, fontFamily:'inherit' }}>
          <thead>
            <tr style={{ background:'#c7d2fe', borderBottom:'1px solid #a5b4fc' }}>
              <th style={{ textAlign:'left', padding:'10px 16px', fontWeight:600, color:'#3730a3', minWidth:140, fontSize:11 }}>項目</th>
              {targets.map(d => (
                <th key={d.day} style={{
                  textAlign:'center', padding:'10px 8px', fontWeight:600, minWidth:66, fontSize:11,
                  color: (d.dow === '土' || d.dow === '日') ? '#be123c' : '#3730a3',
                  background: (d.dow === '土' || d.dow === '日') ? '#a5b4fc' : '#c7d2fe',
                }}>
                  <div>{d.day}日</div>
                  <div style={{ fontSize:10, fontWeight:400 }}>{d.dow}</div>
                </th>
              ))}
              <th style={{ textAlign:'center', padding:'10px 12px', fontWeight:700, color:'white', background:'#818cf8', minWidth:80, fontSize:11 }}>合計/平均</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(({ key, label, unit, color }) => (
              <tr key={key} style={{ borderBottom:'1px solid #f0f5f9' }}>
                <td style={{ padding:'9px 16px', fontWeight:500, color:'#334155', fontSize:12 }}>{label}</td>
                {targets.map(d => (
                  <td key={d.day} style={{
                    textAlign:'center', padding:'6px 4px',
                    background: 'white',
                  }}>
                    {editingCell?.day === d.day && editingCell?.field === key ? (
                      <input type="number" defaultValue={d[key]} autoFocus
                        style={{ width:'100%', textAlign:'center', border:'2px solid #4f46e5', borderRadius:4, padding:'4px', fontSize:12, outline:'none', fontFamily:'inherit', background:'#f5f3ff', color:'#3730a3' }}
                        onBlur={e => { update(d.day, key, e.target.value); setEditingCell(null) }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
                    ) : (
                      <button onClick={() => setEditingCell({ day: d.day, field: key })}
                        style={{
                          width:'100%', fontSize:12, fontWeight:600, border:'none', borderRadius:4,
                          padding:'4px', cursor:'pointer', background:'transparent', color:'#0f172a',
                          fontFamily:'inherit', transition:'background 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='#e0e7ff'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        {key === 'avgSpend' ? `¥${d[key].toLocaleString()}` : d[key].toLocaleString()}
                        <span style={{ fontSize:10, fontWeight:400, color:'#94a3b8', marginLeft:2 }}>{unit}</span>
                      </button>
                    )}
                  </td>
                ))}
                <td style={{ textAlign:'center', padding:'8px 12px', background:'#ddd6fe', fontWeight:700, color:'#3730a3', fontSize:12 }}>
                  {key === 'avgSpend' ? `¥${avgSpend.toLocaleString()}`
                    : key === 'sales' ? `${totalSales.toLocaleString()}千`
                    : key === 'customers' ? `${totalCust.toLocaleString()}`
                    : targets.reduce((s, d) => s + d[key], 0).toLocaleString()}
                </td>
              </tr>
            ))}

            {/* Required staff row */}
            <tr style={{ borderBottom:'1px solid #c7d2fe', background:'#eef2ff' }}>
              <td style={{ padding:'9px 16px', fontWeight:600, color:'#3730a3', fontSize:12 }}>
                <div>必要人員数（推定）</div>
                <div style={{ fontWeight:400, color:'#a5b4fc', fontSize:10, marginTop:2 }}>ピーク最大 / 平均</div>
              </td>
              {targets.map(d => {
                const peak = calcDayPeakStaff(d.orders, avgProductivity)
                const avg = calcDayAvgStaff(d.orders, avgProductivity)
                return (
                  <td key={d.day} style={{ textAlign:'center', padding:'6px 4px', background: d.isWeekend ? '#c7d2fe' : '#eef2ff' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#3730a3' }}>{peak}<span style={{ fontSize:10, fontWeight:400, marginLeft:1 }}>名</span></div>
                    <div style={{ fontSize:10, color:'#a5b4fc' }}>avg {avg}</div>
                  </td>
                )
              })}
              <td style={{ textAlign:'center', padding:'8px 12px', background:'#c7d2fe', fontWeight:700, color:'#3730a3', fontSize:12 }}>
                {Math.round(targets.reduce((s, d) => s + calcDayPeakStaff(d.orders, avgProductivity), 0) / targets.length)}
                <span style={{ fontSize:10, fontWeight:400, marginLeft:2 }}>名/日avg</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ padding:'8px 16px', fontSize:11, color:'#94a3b8' }}>
          ※ セルをクリックして直接編集できます。必要人員は注文数÷時間生産性({avgProductivity}件/h)で推定。
        </div>
      </div>
    </div>
  )
}
