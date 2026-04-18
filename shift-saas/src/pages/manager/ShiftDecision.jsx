import { useState } from 'react'
import { staff, daysConfig, timeSlots, shiftData, assignedShifts, skillLabels, YEAR_MONTH } from '../../data/mockData'

const getAvailable = (day) => {
  return staff.filter(s => {
    const row = shiftData[s.id] || []
    const code = row[day - 1]
    return code && code !== 'X'
  })
}

const slotColor = (staffCount) => {
  if (staffCount >= 5) return 'bg-green-100 border-green-300 text-green-800'
  if (staffCount >= 3) return 'bg-amber-100 border-amber-300 text-amber-800'
  if (staffCount >= 1) return 'bg-orange-100 border-orange-300 text-orange-800'
  return 'bg-red-100 border-red-300 text-red-700'
}

export default function ShiftDecision() {
  const [selectedSlot, setSelectedSlot] = useState(null) // { day, slot }
  const [assigned, setAssigned] = useState(assignedShifts)

  const handleSlotClick = (day, slot) => {
    setSelectedSlot({ day, slot })
  }

  const toggleStaff = (day, slot, staffId) => {
    setAssigned(prev => {
      const dayData = { ...(prev[day] || {}) }
      const slotList = [...(dayData[slot] || [])]
      const idx = slotList.indexOf(staffId)
      if (idx >= 0) slotList.splice(idx, 1)
      else slotList.push(staffId)
      dayData[slot] = slotList
      return { ...prev, [day]: dayData }
    })
  }

  const getSlotStaff = (day, slot) => assigned[day]?.[slot] || []
  const available = selectedSlot ? getAvailable(selectedSlot.day) : []

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-5">
        <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
        <h1 className="text-2xl font-bold text-gray-900">シフト決定 — 時間帯人員配置</h1>
        <p className="text-sm text-gray-500 mt-1">日付×時間帯のセルをクリックして、その時間帯の担当スタッフを確定します</p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Matrix */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-auto">
          <table className="border-collapse text-xs w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-900 text-white">
                <th className="px-3 py-2 text-left font-medium sticky left-0 bg-gray-900 min-w-[80px]">時間帯</th>
                {daysConfig.map(d => (
                  <th key={d.day} className={`px-1 py-2 text-center font-medium min-w-[52px] ${d.isWeekend ? 'text-red-300' : ''}`}>
                    <div>{d.day}日</div>
                    <div className="text-[9px] font-normal opacity-70">{d.dow}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot} className="border-b border-gray-100">
                  <td className="px-3 py-1.5 font-semibold text-gray-700 sticky left-0 bg-white border-r border-gray-200 whitespace-nowrap">
                    {slot}
                  </td>
                  {daysConfig.map(d => {
                    const slotStaff = getSlotStaff(d.day, slot)
                    const isSelected = selectedSlot?.day === d.day && selectedSlot?.slot === slot
                    return (
                      <td key={d.day} className="py-1 px-0.5">
                        <button
                          onClick={() => handleSlotClick(d.day, slot)}
                          className={`w-full rounded border transition-all text-center py-1.5 px-1 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-700 text-white ring-2 ring-blue-400'
                              : slotStaff.length > 0
                              ? slotColor(slotStaff.length)
                              : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-bold">{slotStaff.length > 0 ? slotStaff.length : '—'}</div>
                          {slotStaff.length > 0 && <div className="text-[9px]">名</div>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Staff Panel */}
        <div className="w-80 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
          {selectedSlot ? (
            <>
              <div className="px-4 py-3 bg-blue-600 text-white">
                <div className="text-xs opacity-80">選択中のスロット</div>
                <div className="font-bold text-lg">
                  {selectedSlot.day}日（{daysConfig[selectedSlot.day - 1]?.dow}）{selectedSlot.slot}〜
                </div>
                <div className="text-xs opacity-70 mt-0.5">
                  配置済み: {getSlotStaff(selectedSlot.day, selectedSlot.slot).length}名 / 出勤可能: {available.length}名
                </div>
              </div>

              <div className="p-3 border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                スタッフをクリックして配置・解除
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {available.map(s => {
                  const slotList = getSlotStaff(selectedSlot.day, selectedSlot.slot)
                  const isAssigned = slotList.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStaff(selectedSlot.day, selectedSlot.slot, s.id)}
                      className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                        isAssigned
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm text-gray-800">{s.name}</div>
                        <div className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          isAssigned ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isAssigned ? '✓ 配置済' : '+ 配置'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {s.type}
                        </span>
                        <div className="flex gap-1">
                          {s.skills.map(sk => (
                            <span key={sk} className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                              {skillLabels[sk]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        時間生産性: {s.hourlyOrders}件/h　シフト: {shiftData[s.id]?.[selectedSlot.day - 1]}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    const av = getAvailable(selectedSlot.day)
                    setAssigned(prev => {
                      const dayData = { ...(prev[selectedSlot.day] || {}) }
                      dayData[selectedSlot.slot] = av.map(s => s.id)
                      return { ...prev, [selectedSlot.day]: dayData }
                    })
                  }}
                  className="w-full text-sm bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  全員を一括配置
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 text-gray-400">
              <div>
                <div className="text-4xl mb-3">👆</div>
                <div className="text-sm">左のマトリクスから<br/>時間帯スロットを選択してください</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border bg-green-100 border-green-300 inline-block"/>5名以上（余裕）</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border bg-amber-100 border-amber-300 inline-block"/>3〜4名（適正）</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border bg-orange-100 border-orange-300 inline-block"/>1〜2名（少ない）</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border bg-red-100 border-red-300 inline-block"/>未配置</span>
      </div>
    </div>
  )
}
