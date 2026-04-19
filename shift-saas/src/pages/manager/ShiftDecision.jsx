import { useState, useMemo } from 'react'
import {
  staff, daysConfig, shiftData, assignedShifts, skillLabels, YEAR_MONTH,
  storeConfig, staffConstraints, dailyTargets,
  generateSlots, parseShiftTimes, calcRequiredStaff,
} from '../../data/mockData'

const AI_STAGES = [
  'シフトデータを解析中...',
  '相性・条件を照合中...',
  '最適配置を算出中...',
]

const getTasksForSlot = (hour, min, tasks) =>
  tasks.filter(t => {
    if (!t.enabled) return false
    const [sh, sm] = t.startTime.split(':').map(Number)
    const [eh, em] = t.endTime.split(':').map(Number)
    const slotMin = hour * 60 + min
    return slotMin >= sh * 60 + sm && slotMin < eh * 60 + em
  })

const slotStatusColor = (assigned, required) => {
  if (assigned === 0)         return 'bg-red-100 border-red-300 text-red-700'
  if (assigned < required)    return 'bg-orange-100 border-orange-300 text-orange-700'
  if (assigned === required)  return 'bg-amber-100 border-amber-300 text-amber-700'
  return 'bg-green-100 border-green-300 text-green-800'
}

function runAIAssign(day, slots, staffList, constraints, targets, specialTasks) {
  const dayTarget = targets.find(t => t.day === day)
  const dailyOrders = dayTarget?.orders ?? 200
  const assignments = {}
  let avoidedConflicts = 0

  for (const slot of slots) {
    const [hourStr, minStr] = slot.split(':').map(Number)
    const taskExtra = getTasksForSlot(hourStr, minStr, specialTasks).reduce((s, t) => s + t.requiredStaff, 0)
    const required = calcRequiredStaff(dailyOrders, hourStr, storeConfig.avgProductivity, taskExtra)
    const slotDecimal = hourStr + minStr / 60

    const available = staffList.filter(s => {
      const code = shiftData[s.id]?.[day - 1]
      const times = parseShiftTimes(code)
      return times && slotDecimal >= times.start && slotDecimal < times.end
    })

    const scored = available.map(s => {
      let score = (11 - (constraints[s.id]?.retentionPriority ?? 5)) * 10
      const alreadyIn = assignments[slot] || []
      for (const { staffId, severity } of (constraints[s.id]?.incompatible ?? [])) {
        if (alreadyIn.includes(staffId)) {
          score -= severity * 15
          avoidedConflicts++
        }
      }
      if ((constraints[s.id]?.targetEarnings ?? 0) > 0) score += 8
      return { s, score }
    })

    scored.sort((a, b) => b.score - a.score)
    assignments[slot] = scored.slice(0, required).map(x => x.s.id)
  }

  const staffWithTargets = staffList.filter(s => (constraints[s.id]?.targetEarnings ?? 0) > 0).length
  const totalAssigned = new Set(Object.values(assignments).flat()).size

  return { assignments, avoidedConflicts, staffWithTargets, totalAssigned }
}

export default function ShiftDecision() {
  const [slotInterval, setSlotInterval] = useState(60)
  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [assigned, setAssigned] = useState(assignedShifts)
  const [specialTasks, setSpecialTasks] = useState(storeConfig.specialTasks)
  const [aiLoading, setAILoading] = useState(false)
  const [aiStage, setAIStage] = useState(0)
  const [aiResult, setAIResult] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)

  const slots = useMemo(() => generateSlots(slotInterval, storeConfig.openHour, storeConfig.closeHour), [slotInterval])

  const dayTarget = dailyTargets.find(t => t.day === selectedDay)
  const dailyOrders = dayTarget?.orders ?? 200

  const getRequired = (slot) => {
    const [h, m] = slot.split(':').map(Number)
    const taskExtra = getTasksForSlot(h, m, specialTasks).reduce((s, t) => s + t.requiredStaff, 0)
    return calcRequiredStaff(dailyOrders, h, storeConfig.avgProductivity, taskExtra)
  }

  const getSlotStaff = (day, slot) => assigned[day]?.[slot] || []

  const toggleStaff = (staffId) => {
    if (!selectedSlot) return
    setAssigned(prev => {
      const dayData = { ...(prev[selectedSlot.day] || {}) }
      const list = [...(dayData[selectedSlot.slot] || [])]
      const idx = list.indexOf(staffId)
      if (idx >= 0) list.splice(idx, 1)
      else list.push(staffId)
      dayData[selectedSlot.slot] = list
      return { ...prev, [selectedSlot.day]: dayData }
    })
  }

  const handleAIAssign = async () => {
    setShowAIModal(true)
    setAILoading(true)
    setAIResult(null)
    for (let i = 0; i < AI_STAGES.length; i++) {
      setAIStage(i)
      await new Promise(r => setTimeout(r, 600))
    }
    const result = runAIAssign(selectedDay, slots, staff, staffConstraints, dailyTargets, specialTasks)
    setAssigned(prev => ({ ...prev, [selectedDay]: result.assignments }))
    setAIResult(result)
    setAILoading(false)
  }

  const selectedSlotStaff = selectedSlot ? getSlotStaff(selectedSlot.day, selectedSlot.slot) : []
  const availableForSelected = selectedSlot ? staff.filter(s => {
    const code = shiftData[s.id]?.[selectedSlot.day - 1]
    const times = parseShiftTimes(code)
    if (!times) return false
    const [h, m] = selectedSlot.slot.split(':').map(Number)
    const dec = h + m / 60
    return dec >= times.start && dec < times.end
  }) : []

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{YEAR_MONTH} 前半</div>
          <h1 className="text-xl font-bold text-gray-900">シフト決定 — 時間帯人員配置</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Slot interval toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 text-xs">
            {[15, 30, 60].map(v => (
              <button key={v} onClick={() => setSlotInterval(v)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${slotInterval === v ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {v}分
              </button>
            ))}
          </div>
          <button
            onClick={handleAIAssign}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow"
          >
            ✨ AIによる自動配置
          </button>
        </div>
      </div>

      {/* Special task toggles */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="text-xs text-gray-500 self-center">特別業務:</span>
        {specialTasks.map(t => (
          <button key={t.id} onClick={() => setSpecialTasks(prev => prev.map(x => x.id === t.id ? { ...x, enabled: !x.enabled } : x))}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${t.enabled ? t.color : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
            {t.enabled ? '✓' : '○'} {t.name} ({t.startTime}〜{t.endTime})
          </button>
        ))}
      </div>

      {/* Day selector */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {daysConfig.map(d => (
          <button key={d.day} onClick={() => { setSelectedDay(d.day); setSelectedSlot(null) }}
            className={`flex-shrink-0 w-12 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedDay === d.day ? 'bg-blue-600 text-white' : d.isWeekend ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <div>{d.day}日</div>
            <div className="text-[9px]">{d.dow}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        {/* Slot list */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-900 text-white">
                <th className="px-3 py-2 text-left font-medium sticky left-0 bg-gray-900 min-w-[72px]">時間帯</th>
                <th className="px-2 py-2 text-center font-medium min-w-[56px]">必要</th>
                <th className="px-2 py-2 text-center font-medium min-w-[56px]">配置</th>
                <th className="px-3 py-2 text-left font-medium">配置スタッフ</th>
                <th className="px-2 py-2 text-left font-medium min-w-[80px]">特別業務</th>
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => {
                const [h, m] = slot.split(':').map(Number)
                const required = getRequired(slot)
                const slotStaff = getSlotStaff(selectedDay, slot)
                const tasks = getTasksForSlot(h, m, specialTasks)
                const isSelected = selectedSlot?.slot === slot && selectedSlot?.day === selectedDay
                return (
                  <tr key={slot}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedSlot({ day: selectedDay, slot })}>
                    <td className="px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                      {slot}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="font-bold text-indigo-700">{required}<span className="font-normal text-gray-400 text-[10px]">名</span></span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold border text-[11px] ${slotStatusColor(slotStaff.length, required)}`}>
                        {slotStaff.length}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {slotStaff.map(id => {
                          const s = staff.find(x => x.id === id)
                          return s ? (
                            <span key={id} className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{s.name}</span>
                          ) : null
                        })}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex gap-1 flex-wrap">
                        {tasks.map(t => (
                          <span key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${t.color}`}>{t.name}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Staff panel */}
        <div className="w-72 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
          {selectedSlot ? (
            <>
              <div className="px-4 py-3 bg-blue-600 text-white">
                <div className="text-xs opacity-80">選択スロット</div>
                <div className="font-bold">{selectedSlot.day}日（{daysConfig[selectedSlot.day-1]?.dow}）{selectedSlot.slot}〜</div>
                <div className="text-xs opacity-70 mt-0.5">
                  必要 {getRequired(selectedSlot.slot)}名 / 配置 {selectedSlotStaff.length}名
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {availableForSelected.map(s => {
                  const isAssigned = selectedSlotStaff.includes(s.id)
                  const constraint = staffConstraints[s.id]
                  const hasIncompat = constraint?.incompatible?.some(i => selectedSlotStaff.includes(i.staffId))
                  return (
                    <button key={s.id} onClick={() => toggleStaff(s.id)}
                      className={`w-full text-left rounded-lg border p-2 transition-all ${isAssigned ? 'bg-blue-50 border-blue-300' : hasIncompat ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-800">{s.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isAssigned ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {isAssigned ? '✓ 配置' : '+ 追加'}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {s.skills.map(sk => (
                          <span key={sk} className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded">{skillLabels[sk]}</span>
                        ))}
                        {hasIncompat && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">⚠ 相性注意</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {shiftData[s.id]?.[selectedSlot.day-1]} / {s.hourlyOrders}件/h
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="p-2 border-t">
                <button onClick={() => {
                  const toAssign = availableForSelected.map(s => s.id)
                  setAssigned(prev => {
                    const dd = { ...(prev[selectedSlot.day] || {}) }
                    dd[selectedSlot.slot] = toAssign
                    return { ...prev, [selectedSlot.day]: dd }
                  })
                }} className="w-full text-xs bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">
                  全員を一括配置
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-6">
              <div><div className="text-3xl mb-2">👆</div><div className="text-sm">時間帯をクリックしてスタッフを配置</div></div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border bg-green-100 border-green-300 inline-block"/>必要数以上</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border bg-amber-100 border-amber-300 inline-block"/>ちょうど</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border bg-orange-100 border-orange-300 inline-block"/>不足</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border bg-red-100 border-red-300 inline-block"/>未配置</span>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {aiLoading ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl animate-spin inline-block">✨</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI が最適配置を計算中</h3>
                <div className="space-y-2 mt-4">
                  {AI_STAGES.map((stage, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm transition-all ${i <= aiStage ? 'text-blue-700' : 'text-gray-300'}`}>
                      <span>{i < aiStage ? '✓' : i === aiStage ? '⟳' : '○'}</span>
                      {stage}
                    </div>
                  ))}
                </div>
              </div>
            ) : aiResult ? (
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-gray-900 mb-1">AI配置が完了しました</h3>
                <p className="text-sm text-gray-500 mb-4">{selectedDay}日（{daysConfig[selectedDay-1]?.dow}）のシフトを最適化</p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: '配置スタッフ', value: `${aiResult.totalAssigned}名`, color: 'bg-blue-50 text-blue-800' },
                    { label: '相性問題回避', value: `${aiResult.avoidedConflicts}件`, color: 'bg-green-50 text-green-800' },
                    { label: '収入目標考慮', value: `${aiResult.staffWithTargets}名`, color: 'bg-purple-50 text-purple-800' },
                  ].map((k, i) => (
                    <div key={i} className={`rounded-lg p-2 ${k.color}`}>
                      <div className="text-lg font-bold">{k.value}</div>
                      <div className="text-[10px] opacity-70">{k.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAIModal(false)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                  確認する
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
