import { useState, useMemo } from 'react'
import {
  staff, daysConfig, shiftData, assignedShifts, YEAR_MONTH,
  storeConfig, staffConstraints, dailyTargets, ORDER_DISTRIBUTION,
  generateSlots, parseShiftTimes, calcRequiredStaff,
} from '../../data/mockData'

const AI_STAGES = [
  'シフトデータを解析中...',
  '相性・制約条件を照合中...',
  '最適配置を算出中...',
]

const TASK_TOGGLE_ON = {
  orange: 'bg-orange-100 border-orange-300 text-orange-800',
  purple: 'bg-purple-100 border-purple-300 text-purple-800',
}

function getTasksForSlotMin(slotMin, tasks) {
  return tasks.filter(t => {
    if (!t.enabled) return false
    const [sh, sm] = t.startTime.split(':').map(Number)
    const [eh, em] = t.endTime.split(':').map(Number)
    return slotMin >= sh * 60 + sm && slotMin < eh * 60 + em
  })
}

function runAIForDays(days, slots, staffList, constraints, targets, specialTasks) {
  const result = {}
  let avoidedConflicts = 0
  for (const day of days) {
    const dailyOrders = targets.find(t => t.day === day)?.orders ?? 200
    const dayAssign = {}
    for (const slot of slots) {
      const [h, m] = slot.split(':').map(Number)
      const slotMin = h * 60 + m
      const taskExtra = getTasksForSlotMin(slotMin, specialTasks).reduce((s, t) => s + t.requiredStaff, 0)
      const required = calcRequiredStaff(dailyOrders, h, storeConfig.avgProductivity, taskExtra)
      const slotDec = h + m / 60
      const available = staffList.filter(s => {
        const times = parseShiftTimes(shiftData[s.id]?.[day - 1])
        return times && slotDec >= times.start && slotDec < times.end
      })
      const scored = available.map(s => {
        let score = (11 - (constraints[s.id]?.retentionPriority ?? 5)) * 10
        const alreadyIn = dayAssign[slot] || []
        for (const { staffId, severity } of (constraints[s.id]?.incompatible ?? [])) {
          if (alreadyIn.includes(staffId)) { score -= severity * 15; avoidedConflicts++ }
        }
        if ((constraints[s.id]?.targetEarnings ?? 0) > 0) score += 8
        return { s, score }
      })
      scored.sort((a, b) => b.score - a.score)
      dayAssign[slot] = scored.slice(0, required).map(x => x.s.id)
    }
    result[day] = dayAssign
  }
  const allStaffIds = new Set(Object.values(result).flatMap(d => Object.values(d).flat()))
  const staffWithTargets = staffList.filter(s => (constraints[s.id]?.targetEarnings ?? 0) > 0).length
  return { result, avoidedConflicts, staffWithTargets, totalAssigned: allStaffIds.size }
}

// Column widths
const LW = 100   // label / name
const SW = 64    // sub-label (top) = start+end cols (bottom)
const STW = 32   // start col
const ETW = 32   // end col
const SUMM = [
  { k: 'work',  l: '勤務',   w: 38 },
  { k: 'labor', l: '労働',   w: 38 },
  { k: 'night', l: '深夜',   w: 38 },
  { k: 'pay',   l: '給与',   w: 68 },
  { k: 'trans', l: '交通費', w: 54 },
]

export default function ShiftDecision() {
  const [selectedDay,  setSelectedDay]  = useState(1)
  const [assigned,     setAssigned]     = useState(assignedShifts)
  const [specialTasks, setSpecialTasks] = useState(storeConfig.specialTasks)
  const [showAI,   setShowAI]   = useState(false)
  const [aiPhase,  setAIPhase]  = useState('select')
  const [aiStage,  setAIStage]  = useState(0)
  const [aiDays,   setAIDays]   = useState(() => new Set(daysConfig.map(d => d.day)))
  const [aiResult, setAIResult] = useState(null)

  const slots = useMemo(
    () => generateSlots(15, storeConfig.openHour, storeConfig.closeHour),
    []
  )
  const slotW = 20
  const hours = [...new Set(slots.map(s => parseInt(s.split(':')[0])))]

  const dayTarget   = dailyTargets.find(t => t.day === selectedDay)
  const dailyOrders = dayTarget?.orders ?? 200

  const getRequired = (slot) => {
    const [h, m] = slot.split(':').map(Number)
    const extra = getTasksForSlotMin(h * 60 + m, specialTasks).reduce((s, t) => s + t.requiredStaff, 0)
    return calcRequiredStaff(dailyOrders, h, storeConfig.avgProductivity, extra)
  }
  const getAssignedList = (slot) => assigned[selectedDay]?.[slot] || []
  const isWorking = (staffId, slot) => {
    const times = parseShiftTimes(shiftData[staffId]?.[selectedDay - 1])
    if (!times) return false
    const [h, m] = slot.split(':').map(Number)
    const dec = h + m / 60
    return dec >= times.start && dec < times.end
  }
  const toggleCell = (staffId, slot) => {
    if (!isWorking(staffId, slot)) return
    setAssigned(prev => {
      const dd = { ...(prev[selectedDay] || {}) }
      const list = [...(dd[slot] || [])]
      const idx = list.indexOf(staffId)
      if (idx >= 0) list.splice(idx, 1); else list.push(staffId)
      dd[slot] = list
      return { ...prev, [selectedDay]: dd }
    })
  }

  const slotSalesKen = (slot) => {
    const [h] = slot.split(':').map(Number)
    return Math.round((dayTarget?.sales ?? 0) * (ORDER_DISTRIBUTION[h] ?? 0))
  }
  const cumSales = useMemo(() => {
    let cum = 0
    return slots.map(s => { cum += slotSalesKen(s); return cum })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, selectedDay])

  const getShiftSummary = (staffId) => {
    const code = shiftData[staffId]?.[selectedDay - 1] || 'X'
    const t = parseShiftTimes(code)
    if (!t) return null
    const work  = t.end - t.start
    const labor = Math.max(0, work - (work >= 6 ? 1 : 0))
    const night = Math.max(0, Math.min(t.end, 24) - Math.max(t.start, 22))
    const member = staff.find(s => s.id === staffId)
    return { start: t.start, end: t.end, work, labor, night, pay: Math.round(labor * (member?.wage ?? 1050)) }
  }

  const reqColor = (cnt, req) => {
    if (cnt === 0 && req > 0) return { background: 'oklch(0.92 0.08 20)',  color: 'oklch(0.45 0.12 20)' }
    if (cnt < req)            return { background: 'oklch(0.93 0.07 45)',  color: 'oklch(0.50 0.10 45)' }
    if (cnt >= req && req > 0)return { background: 'oklch(0.93 0.06 150)', color: 'oklch(0.40 0.09 150)' }
    return { background: 'var(--pita-bg)', color: 'var(--pita-faint)' }
  }

  const slotSalesPH = (slot) => {
    const cnt = staff.filter(s => isWorking(s.id, slot)).length
    return cnt > 0 ? Math.round(slotSalesKen(slot) * 1000 / cnt) : 0
  }

  const workingStaff = staff.filter(s => getShiftSummary(s.id) !== null)

  const openAI = () => { setAIDays(new Set(daysConfig.map(d => d.day))); setAIResult(null); setAIPhase('select'); setShowAI(true) }
  const runAI = async () => {
    setAIPhase('loading'); setAIStage(0)
    for (let i = 0; i < AI_STAGES.length; i++) { setAIStage(i); await new Promise(r => setTimeout(r, 700)) }
    const days = [...aiDays].sort((a, b) => a - b)
    const { result, avoidedConflicts, staffWithTargets, totalAssigned } = runAIForDays(days, slots, staff, staffConstraints, dailyTargets, specialTasks)
    setAssigned(prev => ({ ...prev, ...result }))
    setAIResult({ days, avoidedConflicts, staffWithTargets, totalAssigned })
    setAIPhase('done')
  }
  const toggleAIDay = (day) => setAIDays(prev => { const n = new Set(prev); n.has(day) ? n.delete(day) : n.add(day); return n })

  // Shared table styles
  const B = '1px solid var(--pita-border)'
  const BB = '1px solid var(--pita-border-strong)'
  const td = (extra = {}) => ({ border: B, padding: '2px 5px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--pita-panel)', ...extra })
  const th = (extra = {}) => ({ border: B, padding: '3px 5px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, background: 'var(--pita-text)', color: 'white', ...extra })
  const sL0 = { position: 'sticky', left: 0,        zIndex: 5 }
  const sL1 = { position: 'sticky', left: LW,        zIndex: 5 }
  const sL2 = { position: 'sticky', left: LW + STW,  zIndex: 5 }
  const sH0 = { position: 'sticky', left: 0,        zIndex: 15 }
  const sH1 = { position: 'sticky', left: LW,        zIndex: 15 }
  const sH2 = { position: 'sticky', left: LW + STW,  zIndex: 15 }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', padding:16, background:'var(--pita-bg)', gap:10 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:10, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:11, color:'var(--pita-muted)', marginBottom:2 }}>{YEAR_MONTH} 前半</div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'var(--pita-text)', margin:0 }}>シフト決定 — 時間帯人員配置</h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={openAI} style={{
            display:'flex', alignItems:'center', gap:6, border:'none', borderRadius:8,
            padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer', color:'white',
            background:'linear-gradient(135deg, oklch(0.45 0.15 300), oklch(0.50 0.10 250))',
          }}>✨ AI自動配置</button>
        </div>
      </div>

      {/* ── Day selector ── */}
      <div style={{ display:'flex', gap:4, overflowX:'auto', paddingBottom:2, flexShrink:0 }}>
        {daysConfig.map(d => (
          <button key={d.day} onClick={() => setSelectedDay(d.day)} style={{
            flexShrink:0, width:44, padding:'4px 0', borderRadius:6, border:'none', cursor:'pointer',
            fontSize:10, fontFamily:'var(--font-mono)', fontWeight:600,
            background: selectedDay === d.day ? 'var(--pita-accent)' : d.isWeekend ? 'oklch(0.95 0.04 20)' : 'var(--pita-bg-subtle)',
            color: selectedDay === d.day ? 'white' : d.isWeekend ? 'oklch(0.50 0.12 20)' : 'var(--pita-muted)',
          }}>
            <div>{d.day}</div><div style={{ fontSize:9 }}>{d.dow}</div>
          </button>
        ))}
      </div>

      {/* ── Special task toggles ── */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:11, color:'var(--pita-muted)' }}>特別業務:</span>
        {specialTasks.map(t => (
          <button key={t.id}
            onClick={() => setSpecialTasks(prev => prev.map(x => x.id === t.id ? {...x, enabled: !x.enabled} : x))}
            className={`text-xs px-3 py-1 rounded-full border font-medium ${t.enabled ? (TASK_TOGGLE_ON[t.colorKey] || TASK_TOGGLE_ON.orange) : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
            {t.enabled ? '✓' : '○'} {t.name} ({t.startTime}〜{t.endTime})
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ flex:1, minHeight:0, overflowX:'auto', overflowY:'auto', background:'var(--pita-panel)', border:B, borderRadius:8 }}>
        <table style={{ borderCollapse:'collapse', tableLayout:'fixed', minWidth:'max-content', fontSize:10, fontFamily:'var(--font-mono)' }}>
          <colgroup>
            <col style={{ width:LW }} />
            <col style={{ width:STW }} />
            <col style={{ width:ETW }} />
            {slots.map((_, i) => <col key={i} style={{ width:slotW }} />)}
            <col style={{ width:52 }} />
            {SUMM.map(s => <col key={s.k} style={{ width:s.w }} />)}
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} style={th({ ...sH0, textAlign:'left' })}>指標</th>
              <th rowSpan={2} colSpan={2} style={th({ ...sH1 })}></th>
              {hours.map(h => <th key={h} colSpan={slots.filter(s => parseInt(s) === h).length} style={th({ borderBottom:'1px solid oklch(0.45 0.05 180)' })}>{h}:00</th>)}
              <th rowSpan={2} style={th({ background:'var(--pita-accent)' })}>合計</th>
              <th rowSpan={2} colSpan={SUMM.length} style={{ border:B, background:'oklch(0.22 0.03 180)' }} />
            </tr>
            <tr>
              {slots.map(slot => <th key={slot} style={th({ fontSize:9, fontWeight:400, color:'oklch(0.75 0.03 180)' })}>{slot.split(':')[1]}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={2} style={td({ ...sL0, textAlign:'left', background:'oklch(0.94 0.03 220)', fontWeight:600, borderRight:BB, lineHeight:1.3 })}>実行計画売上<br/><span style={{ fontSize:9 }}>(千円)</span></td>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9 })}>PLAN</td>
              {slots.map(slot => { const v = slotSalesKen(slot); return <td key={slot} style={td({ color: v > 0 ? 'var(--pita-text)' : 'var(--pita-faint)' })}>{v > 0 ? v : ''}</td> })}
              <td style={td({ background:'var(--pita-accent-soft)', color:'var(--pita-accent-text)', fontWeight:700 })}>{dayTarget?.sales ?? 0}</td>
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9 })}>累計</td>
              {cumSales.map((v, i) => <td key={i} style={td({ color:'var(--pita-muted)', fontSize:9 })}>{v}</td>)}
              <td style={td()} />
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td rowSpan={2} style={td({ ...sL0, textAlign:'left', background:'oklch(0.95 0.02 150)', fontWeight:600, borderRight:BB, lineHeight:1.3 })}>売上ACTUAL<br/><span style={{ fontSize:9 }}>(千円)</span></td>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9 })}>ACTUAL</td>
              {slots.map(slot => <td key={slot} style={td()} />)}
              <td style={td()} />
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9 })}>累計</td>
              {slots.map(slot => <td key={slot} style={td()} />)}
              <td style={td()} />
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td style={td({ ...sL0, textAlign:'left', background:'oklch(0.93 0.03 240)', fontWeight:600, borderRight:BB })}>必要人員数</td>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9 })}>PLAN</td>
              {slots.map(slot => { const r = getRequired(slot); return <td key={slot} style={td({ background: r > 0 ? 'oklch(0.93 0.03 200)' : 'var(--pita-bg)', fontWeight: r > 0 ? 600 : 400, color: r > 0 ? 'var(--pita-text)' : 'var(--pita-faint)' })}>{r > 0 ? r.toFixed(2) : ''}</td> })}
              <td style={td({ background:'var(--pita-accent-soft)', color:'var(--pita-accent-text)', fontWeight:700 })}>{slots.reduce((s, slot) => s + getRequired(slot), 0).toFixed(2)}</td>
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td style={td({ ...sL0, textAlign:'left', background:'oklch(0.93 0.03 240)', fontWeight:600, borderRight:BB })}>配置済み人数</td>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9 })}>実績</td>
              {slots.map(slot => { const cnt = getAssignedList(slot).length; const req = getRequired(slot); return <td key={slot} style={td({ ...reqColor(cnt, req), fontWeight:600 })}>{cnt > 0 ? cnt : ''}</td> })}
              <td style={td()} />
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td style={td({ ...sL0, textAlign:'left', background:'oklch(0.93 0.03 180)', fontWeight:600, borderRight:BB, borderBottom:'2px solid var(--pita-border-strong)' })}>合計時間</td>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', color:'var(--pita-muted)', fontSize:9, borderBottom:'2px solid var(--pita-border-strong)' })}>PLAN</td>
              {slots.map(slot => { const r = getRequired(slot); return <td key={slot} style={td({ color: r > 0 ? 'var(--pita-text)' : 'var(--pita-faint)', borderBottom:'2px solid var(--pita-border-strong)' })}>{r > 0 ? r.toFixed(2) : ''}</td> })}
              <td style={td({ background:'var(--pita-accent-soft)', color:'var(--pita-accent-text)', fontWeight:700, borderBottom:'2px solid var(--pita-border-strong)' })}>{slots.reduce((s, slot) => s + getRequired(slot), 0).toFixed(2)}</td>
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)', borderBottom:'2px solid var(--pita-border-strong)' })} />)}
            </tr>
          </tbody>

          <tbody>
            <tr>
              <th rowSpan={2} style={th({ ...sH0, textAlign:'left' })}>STAFF</th>
              <th rowSpan={2} colSpan={2} style={th({ ...sH1 })}>勤務時間</th>
              {hours.map(h => <th key={h} colSpan={slots.filter(s => parseInt(s) === h).length} style={th({ borderBottom:'1px solid oklch(0.45 0.05 180)' })}>{h}:00</th>)}
              <th rowSpan={2} style={{ border:B, background:'oklch(0.22 0.03 180)' }} />
              {SUMM.map(s => <th key={s.k} rowSpan={2} style={th({ background:'oklch(0.30 0.05 180)' })}>{s.l}</th>)}
            </tr>
            <tr>
              {slots.map(slot => <th key={slot} style={th({ fontSize:9, fontWeight:400, color:'oklch(0.75 0.03 180)' })}>{slot.split(':')[1]}</th>)}
            </tr>
            {workingStaff.map((s, idx) => {
              const summ = getShiftSummary(s.id)
              const rowBg = idx % 2 === 0 ? 'var(--pita-panel)' : 'var(--pita-bg-subtle)'
              return (
                <tr key={s.id}>
                  <td style={td({ ...sL0, textAlign:'left', background:rowBg, fontWeight:600, borderRight:BB })}>{s.name}</td>
                  <td style={td({ ...sL1, background:rowBg, textAlign:'center', color:'var(--pita-muted)' })}>{summ ? summ.start.toFixed(2) : ''}</td>
                  <td style={td({ ...sL2, background:rowBg, textAlign:'center', color:'var(--pita-muted)' })}>{summ ? summ.end.toFixed(2) : ''}</td>
                  {slots.map(slot => {
                    const w = isWorking(s.id, slot)
                    const a = getAssignedList(slot).includes(s.id)
                    return (
                      <td key={slot} onClick={() => toggleCell(s.id, slot)} style={td({
                        padding:0, textAlign:'center', cursor: w ? 'pointer' : 'default',
                        background: a ? 'var(--pita-shift-work)' : w ? 'var(--pita-shift-soft)' : 'var(--pita-bg-subtle)',
                        color: a ? 'white' : 'oklch(0.35 0.08 180)',
                      })}>
                        {w && !a ? <span style={{ fontSize:8 }}>·</span> : ''}
                      </td>
                    )
                  })}
                  <td style={td({ background:rowBg })} />
                  {SUMM.map(col => {
                    const v = summ ? (
                      col.k === 'work'  ? summ.work.toFixed(2) :
                      col.k === 'labor' ? summ.labor.toFixed(2) :
                      col.k === 'night' ? (summ.night > 0 ? summ.night.toFixed(2) : '') :
                      col.k === 'pay'   ? `¥${summ.pay.toLocaleString()}` : ''
                    ) : ''
                    return <td key={col.k} style={td({ background: idx % 2 === 0 ? 'oklch(0.96 0.01 180)' : 'oklch(0.95 0.02 180)', color:'var(--pita-text)' })}>{v}</td>
                  })}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop:'2px solid var(--pita-border-strong)' }}>
              <td style={td({ ...sL0, textAlign:'left', background:'var(--pita-bg-subtle)', fontWeight:700 })}>計{workingStaff.length}名</td>
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', textAlign:'left', fontSize:9, color:'var(--pita-muted)' })}>時間帯別計画時間</td>
              {slots.map(slot => { const r = getRequired(slot); return <td key={slot} style={td({ background:'var(--pita-bg-subtle)', fontWeight: r > 0 ? 700 : 400, color: r > 0 ? 'oklch(0.45 0.12 20)' : 'var(--pita-faint)' })}>{r > 0 ? r.toFixed(2) : ''}</td> })}
              <td style={td({ background:'var(--pita-bg-subtle)' })} />
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
            <tr>
              <td style={td({ ...sL0, background:'var(--pita-bg-subtle)' })} />
              <td colSpan={2} style={td({ ...sL1, background:'var(--pita-bg-subtle)', textAlign:'left', fontSize:9, color:'var(--pita-muted)' })}>時間帯別人時売上高</td>
              {slots.map(slot => { const v = slotSalesPH(slot); return <td key={slot} style={td({ background:'var(--pita-bg-subtle)', fontSize:9, color:'var(--pita-muted)' })}>{v > 0 ? `¥${v.toLocaleString()}` : ''}</td> })}
              <td style={td({ background:'var(--pita-bg-subtle)' })} />
              {SUMM.map(s => <td key={s.k} style={td({ background:'var(--pita-bg-subtle)' })} />)}
            </tr>
          </tfoot>
        </table>
      </div>


      {/* ── Legend ── */}
      <div style={{ display:'flex', gap:16, fontSize:10, color:'var(--pita-muted)', flexWrap:'wrap', flexShrink:0 }}>
        {[
          { bg:'var(--pita-shift-work)', label:'配置済み（クリックで解除）' },
          { bg:'var(--pita-shift-soft)', label:'出勤中・未配置（クリックで配置）', border:B },
          { bg:'var(--pita-bg-subtle)',  label:'休み', border:B },
        ].map(({ bg, label, border: bd }) => (
          <span key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:16, height:12, borderRadius:2, background:bg, border:bd, display:'inline-block' }} />
            {label}
          </span>
        ))}
      </div>

      {/* ── AI Modal ── */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {aiPhase === 'select' && (
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">AI自動配置 — 対象日を選択</h3>
                <p className="text-sm text-gray-500 mb-4">配置を自動生成する日にちを選択してください</p>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setAIDays(new Set(daysConfig.map(d => d.day)))} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">全選択</button>
                  <button onClick={() => setAIDays(new Set())} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">全解除</button>
                  <span className="ml-auto text-xs text-gray-500">{aiDays.size}日 選択中</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-5">
                  {daysConfig.map(d => (
                    <button key={d.day} onClick={() => toggleAIDay(d.day)} className={`py-2 rounded-lg text-xs font-medium transition-colors border ${aiDays.has(d.day) ? 'bg-blue-600 text-white border-blue-600' : d.isWeekend ? 'bg-red-50 text-red-400 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      <div>{d.day}日</div><div className="text-[9px] opacity-70">{d.dow}</div>
                    </button>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-700">
                  <div className="font-semibold mb-1">AI配置の最適化基準:</div>
                  <div className="space-y-0.5 text-blue-600">
                    <div>① 相性の悪いスタッフを同時間帯に配置しない</div>
                    <div>② 目標月収に近づくよう稼働時間を考慮</div>
                    <div>③ 残留優先度の高いスタッフを優先配置</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAI(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
                  <button onClick={runAI} disabled={aiDays.size === 0} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40">✨ AI配置を実行</button>
                </div>
              </div>
            )}
            {aiPhase === 'loading' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl animate-spin inline-block">✨</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-5">AI が最適配置を計算中...</h3>
                <div className="space-y-3 text-left">
                  {AI_STAGES.map((stage, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm ${i <= aiStage ? 'text-blue-700' : 'text-gray-300'}`}>
                      <span className="w-5 text-center font-bold">{i < aiStage ? '✓' : i === aiStage ? '⟳' : '○'}</span>
                      {stage}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aiPhase === 'done' && aiResult && (
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">AI配置が完了しました</h3>
                <p className="text-sm text-gray-500 mb-5">{aiResult.days.slice(0,5).join('・')}日{aiResult.days.length > 5 ? ` ほか${aiResult.days.length-5}日` : ''}のシフトを最適化</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label:'対象日数',     value:`${aiResult.days.length}日`,      color:'bg-indigo-50 text-indigo-800' },
                    { label:'相性問題回避', value:`${aiResult.avoidedConflicts}件`, color:'bg-green-50 text-green-800' },
                    { label:'収入目標考慮', value:`${aiResult.staffWithTargets}名`, color:'bg-purple-50 text-purple-800' },
                  ].map((k, i) => (
                    <div key={i} className={`rounded-xl p-3 ${k.color}`}>
                      <div className="text-2xl font-bold">{k.value}</div>
                      <div className="text-[11px] opacity-70 mt-0.5">{k.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAI(false)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">確認する</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
