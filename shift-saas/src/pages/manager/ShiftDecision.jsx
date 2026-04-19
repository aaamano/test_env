import { useState, useMemo } from 'react'
import {
  staff, daysConfig, shiftData, assignedShifts, skillLabels, YEAR_MONTH,
  storeConfig, staffConstraints, dailyTargets,
  generateSlots, parseShiftTimes, calcRequiredStaff,
} from '../../data/mockData'

const AI_STAGES = [
  'シフトデータを解析中...',
  '相性・制約条件を照合中...',
  '最適配置を算出中...',
]

// Hardcoded — no dynamic class strings
const TASK_BADGE = {
  orange: 'bg-orange-200 text-orange-800',
  purple: 'bg-purple-200 text-purple-800',
  blue:   'bg-blue-200 text-blue-800',
  green:  'bg-green-200 text-green-800',
  red:    'bg-red-200 text-red-800',
}
const TASK_TOGGLE_ON = {
  orange: 'bg-orange-100 border-orange-300 text-orange-800',
  purple: 'bg-purple-100 border-purple-300 text-purple-800',
  blue:   'bg-blue-100 border-blue-300 text-blue-800',
  green:  'bg-green-100 border-green-300 text-green-800',
  red:    'bg-red-100 border-red-300 text-red-800',
}

function getTasksForSlotMin(slotMin, tasks) {
  return tasks.filter(t => {
    if (!t.enabled) return false
    const [sh, sm] = t.startTime.split(':').map(Number)
    const [eh, em] = t.endTime.split(':').map(Number)
    return slotMin >= sh * 60 + sm && slotMin < eh * 60 + em
  })
}

function metricCls(assigned, required) {
  if (assigned === 0)        return 'bg-red-100 text-red-700'
  if (assigned < required)   return 'bg-orange-100 text-orange-700'
  if (assigned === required) return 'bg-amber-50 text-amber-700'
  return 'bg-green-50 text-green-700'
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

  const allStaffIds = new Set(
    Object.values(result).flatMap(dayData => Object.values(dayData).flat())
  )
  const staffWithTargets = staffList.filter(s => (constraints[s.id]?.targetEarnings ?? 0) > 0).length
  return { result, avoidedConflicts, staffWithTargets, totalAssigned: allStaffIds.size }
}

export default function ShiftDecision() {
  const [slotInterval, setSlotInterval]   = useState(60)
  const [selectedDay, setSelectedDay]     = useState(1)
  const [assigned, setAssigned]           = useState(assignedShifts)
  const [specialTasks, setSpecialTasks]   = useState(storeConfig.specialTasks)

  // AI modal state
  const [showAI, setShowAI]               = useState(false)
  const [aiPhase, setAIPhase]             = useState('select') // 'select' | 'loading' | 'done'
  const [aiStage, setAIStage]             = useState(0)
  const [aiDays, setAIDays]               = useState(() => new Set(daysConfig.map(d => d.day)))
  const [aiResult, setAIResult]           = useState(null)

  const slots = useMemo(() => generateSlots(slotInterval, storeConfig.openHour, storeConfig.closeHour), [slotInterval])

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

  // Cell classes — hardcoded, no dynamic strings
  const getCellCls = (staffId, slot) => {
    const working = isWorking(staffId, slot)
    const inAssign = getAssignedList(slot).includes(staffId)
    if (inAssign)  return 'bg-blue-500 border-r border-blue-400 cursor-pointer group-hover:bg-blue-400'
    if (working)   return 'bg-sky-100 border-r border-sky-200 cursor-pointer hover:bg-sky-200'
    return 'bg-gray-50 border-r border-gray-100'
  }

  const openAI = () => {
    setAIDays(new Set(daysConfig.map(d => d.day)))
    setAIResult(null)
    setAIPhase('select')
    setShowAI(true)
  }

  const runAI = async () => {
    setAIPhase('loading')
    setAIStage(0)
    for (let i = 0; i < AI_STAGES.length; i++) {
      setAIStage(i)
      await new Promise(r => setTimeout(r, 700))
    }
    const days = [...aiDays].sort((a, b) => a - b)
    const { result, avoidedConflicts, staffWithTargets, totalAssigned } = runAIForDays(days, slots, staff, staffConstraints, dailyTargets, specialTasks)
    setAssigned(prev => ({ ...prev, ...result }))
    setAIResult({ days, avoidedConflicts, staffWithTargets, totalAssigned })
    setAIPhase('done')
  }

  const toggleAIDay = (day) => {
    setAIDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day); else next.add(day)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-4">

      {/* ── Header ── */}
      <div className="mb-3 flex items-start justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{YEAR_MONTH} 前半</div>
          <h1 className="text-xl font-bold text-gray-900">シフト決定 — 時間帯人員配置</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 text-xs">
            {[15, 30, 60].map(v => (
              <button key={v} onClick={() => setSlotInterval(v)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${slotInterval === v ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {v}分
              </button>
            ))}
          </div>
          <button onClick={openAI}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 shadow">
            ✨ AIによる自動配置
          </button>
        </div>
      </div>

      {/* ── Day selector ── */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 flex-shrink-0">
        {daysConfig.map(d => (
          <button key={d.day} onClick={() => setSelectedDay(d.day)}
            className={`flex-shrink-0 w-12 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedDay === d.day ? 'bg-blue-600 text-white' : d.isWeekend ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <div>{d.day}日</div>
            <div className="text-[9px]">{d.dow}</div>
          </button>
        ))}
      </div>

      {/* ── Special task toggles ── */}
      <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0 items-center">
        <span className="text-xs text-gray-500">特別業務:</span>
        {specialTasks.map(t => (
          <button key={t.id}
            onClick={() => setSpecialTasks(prev => prev.map(x => x.id === t.id ? { ...x, enabled: !x.enabled } : x))}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
              t.enabled ? TASK_TOGGLE_ON[t.colorKey] || TASK_TOGGLE_ON.orange : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
            {t.enabled ? '✓' : '○'} {t.name} ({t.startTime}〜{t.endTime})
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="flex-1 min-h-0 overflow-auto border border-gray-200 rounded-xl bg-white">
        <table className="border-collapse text-xs" style={{ tableLayout: 'fixed', minWidth: 'max-content' }}>
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-800 text-white">
              <th className="sticky left-0 z-30 bg-gray-800 border-r border-gray-600 text-left px-3 py-2 font-medium" style={{ minWidth: 130, width: 130 }}>
                指標 / スタッフ
              </th>
              {slots.map((slot) => (
                <th key={slot} className="text-center font-medium border-r border-gray-700 py-1.5"
                  style={{ minWidth: slotInterval === 15 ? 28 : slotInterval === 30 ? 38 : 52, width: slotInterval === 15 ? 28 : slotInterval === 30 ? 38 : 52 }}>
                  <div className={`leading-tight ${slotInterval === 15 ? 'text-[8px]' : 'text-[9px]'}`}>
                    {slot.endsWith(':00') ? slot : slot.split(':')[1]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ── Metrics row 1: 必要人員数 ── */}
            <tr className="bg-indigo-50 border-b border-indigo-100">
              <td className="sticky left-0 z-10 bg-indigo-50 border-r border-indigo-200 px-3 py-2 font-semibold text-indigo-800 whitespace-nowrap text-[11px]">
                必要人員数
              </td>
              {slots.map(slot => {
                const req = getRequired(slot)
                return (
                  <td key={slot} className="text-center py-1.5 border-r border-indigo-100 font-bold text-indigo-700 text-[11px]">
                    {req}
                  </td>
                )
              })}
            </tr>

            {/* ── Metrics row 2: 配置済み ── */}
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-10 bg-white border-r border-gray-200 px-3 py-2 font-semibold text-gray-700 whitespace-nowrap text-[11px]">
                配置済み
              </td>
              {slots.map(slot => {
                const req = getRequired(slot)
                const cnt = getAssignedList(slot).length
                return (
                  <td key={slot} className={`text-center py-1 border-r border-gray-100 font-bold text-[11px] ${metricCls(cnt, req)}`}>
                    {cnt}
                  </td>
                )
              })}
            </tr>

            {/* ── Metrics row 3: 特別業務 ── */}
            <tr className="border-b-2 border-gray-300">
              <td className="sticky left-0 z-10 bg-amber-50 border-r border-amber-200 px-3 py-1.5 font-semibold text-amber-700 whitespace-nowrap text-[11px]">
                特別業務
              </td>
              {slots.map(slot => {
                const [h, m] = slot.split(':').map(Number)
                const tasks = getTasksForSlotMin(h * 60 + m, specialTasks)
                return (
                  <td key={slot} className="text-center py-0.5 border-r border-amber-100 bg-amber-50">
                    {tasks.map(t => (
                      <div key={t.id} className={`text-[8px] font-bold px-0.5 rounded leading-tight ${TASK_BADGE[t.colorKey] || TASK_BADGE.orange}`}>
                        {t.name}
                      </div>
                    ))}
                    {tasks.length === 0 && <div className="h-4" />}
                  </td>
                )
              })}
            </tr>

            {/* ── Staff rows ── */}
            {staff.map((s) => {
              const shiftCode = shiftData[s.id]?.[selectedDay - 1] || 'X'
              const isOff = shiftCode === 'X'
              return (
                <tr key={s.id} className={`border-b border-gray-100 ${isOff ? 'opacity-40' : 'hover:bg-gray-50/40'}`}>
                  <td className="sticky left-0 z-10 bg-white border-r border-gray-200 px-2 py-1.5 whitespace-nowrap">
                    <div className="font-semibold text-gray-800 text-[11px] leading-tight">{s.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[9px] font-medium px-1 rounded ${
                        shiftCode === 'F' ? 'bg-orange-100 text-orange-700' :
                        shiftCode.startsWith('O') ? 'bg-teal-100 text-teal-700' :
                        shiftCode.endsWith('L') ? 'bg-rose-100 text-rose-700' :
                        shiftCode === 'X' ? 'bg-gray-100 text-gray-400' :
                        'bg-blue-100 text-blue-700'
                      }`}>{shiftCode}</span>
                    </div>
                  </td>
                  {slots.map(slot => (
                    <td key={slot}
                      className={getCellCls(s.id, slot)}
                      onClick={() => toggleCell(s.id, slot)}
                    />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend ── */}
      <div className="mt-2 flex gap-4 text-[11px] text-gray-500 flex-wrap flex-shrink-0">
        <span className="flex items-center gap-1"><span className="w-4 h-3 rounded inline-block bg-blue-500" />配置済み（クリックで解除）</span>
        <span className="flex items-center gap-1"><span className="w-4 h-3 rounded inline-block bg-sky-100 border border-sky-300" />出勤中・未配置（クリックで配置）</span>
        <span className="flex items-center gap-1"><span className="w-4 h-3 rounded inline-block bg-gray-100 border border-gray-200" />休み</span>
        <div className="ml-auto flex gap-3">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-200 inline-block" />未配置</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-200 inline-block" />不足</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-200 inline-block" />充足</span>
        </div>
      </div>

      {/* ── AI Modal ── */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Day selection phase */}
            {aiPhase === 'select' && (
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">AI自動配置 — 対象日を選択</h3>
                <p className="text-sm text-gray-500 mb-4">配置を自動生成する日にちを選択してください</p>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setAIDays(new Set(daysConfig.map(d => d.day)))}
                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">全選択</button>
                  <button onClick={() => setAIDays(new Set())}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">全解除</button>
                  <span className="ml-auto text-xs text-gray-500">{aiDays.size}日 選択中</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-5">
                  {daysConfig.map(d => (
                    <button key={d.day} onClick={() => toggleAIDay(d.day)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors border ${
                        aiDays.has(d.day)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : d.isWeekend
                            ? 'bg-red-50 text-red-400 border-red-200 hover:border-red-300'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'
                      }`}>
                      <div>{d.day}日</div>
                      <div className="text-[9px] opacity-70">{d.dow}</div>
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
                  <button onClick={() => setShowAI(false)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                    キャンセル
                  </button>
                  <button onClick={runAI} disabled={aiDays.size === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                    ✨ AI配置を実行
                  </button>
                </div>
              </div>
            )}

            {/* Loading phase */}
            {aiPhase === 'loading' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl animate-spin inline-block">✨</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-5">AI が最適配置を計算中...</h3>
                <div className="space-y-3 text-left">
                  {AI_STAGES.map((stage, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i <= aiStage ? 'text-blue-700' : 'text-gray-300'}`}>
                      <span className="w-5 text-center font-bold">
                        {i < aiStage ? '✓' : i === aiStage ? '⟳' : '○'}
                      </span>
                      {stage}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Done phase */}
            {aiPhase === 'done' && aiResult && (
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">AI配置が完了しました</h3>
                <p className="text-sm text-gray-500 mb-5">
                  {aiResult.days.slice(0, 5).join('・')}日{aiResult.days.length > 5 ? ` ほか${aiResult.days.length - 5}日` : ''}のシフトを最適化
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: '対象日数',       value: `${aiResult.days.length}日`,   color: 'bg-indigo-50 text-indigo-800' },
                    { label: '相性問題回避',   value: `${aiResult.avoidedConflicts}件`, color: 'bg-green-50 text-green-800' },
                    { label: '収入目標考慮',   value: `${aiResult.staffWithTargets}名`, color: 'bg-purple-50 text-purple-800' },
                  ].map((k, i) => (
                    <div key={i} className={`rounded-xl p-3 ${k.color}`}>
                      <div className="text-2xl font-bold">{k.value}</div>
                      <div className="text-[11px] opacity-70 mt-0.5">{k.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAI(false)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">
                  確認する
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
