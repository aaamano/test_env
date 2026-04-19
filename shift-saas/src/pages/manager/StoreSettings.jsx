import { useState } from 'react'
import { storeConfig as initialConfig, YEAR_MONTH } from '../../data/mockData'

// Hardcoded color lookup (avoids Tailwind purge issues with dynamic strings)
const TASK_COLORS = {
  orange: { card: 'bg-orange-100 border-orange-300 text-orange-900', badge: 'bg-orange-200 text-orange-800', btn: 'bg-orange-100 border-2 border-orange-400 text-orange-800' },
  purple: { card: 'bg-purple-100 border-purple-300 text-purple-900', badge: 'bg-purple-200 text-purple-800', btn: 'bg-purple-100 border-2 border-purple-400 text-purple-800' },
  blue:   { card: 'bg-blue-100 border-blue-300 text-blue-900',       badge: 'bg-blue-200 text-blue-800',   btn: 'bg-blue-100 border-2 border-blue-400 text-blue-800' },
  green:  { card: 'bg-green-100 border-green-300 text-green-900',    badge: 'bg-green-200 text-green-800', btn: 'bg-green-100 border-2 border-green-400 text-green-800' },
  red:    { card: 'bg-red-100 border-red-300 text-red-900',          badge: 'bg-red-200 text-red-800',     btn: 'bg-red-100 border-2 border-red-400 text-red-800' },
}
const COLOR_OPTIONS = [
  { key: 'orange', label: 'オレンジ' },
  { key: 'purple', label: 'パープル' },
  { key: 'blue',   label: 'ブルー' },
  { key: 'green',  label: 'グリーン' },
  { key: 'red',    label: 'レッド' },
]
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)
const MINS  = ['00', '15', '30', '45']

export { TASK_COLORS }

export default function StoreSettings() {
  const [config, setConfig] = useState(initialConfig)
  const [saved, setSaved] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [taskForm, setTaskForm] = useState(null)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const openEdit = (task) => {
    const [sh, sm] = task.startTime.split(':').map(Number)
    const [eh, em] = task.endTime.split(':').map(Number)
    setTaskForm({ ...task, startH: sh, startM: String(sm).padStart(2,'0'), endH: eh, endM: String(em).padStart(2,'0') })
    setEditTask(task.id)
  }
  const openNew = () => {
    setTaskForm({ id: Date.now(), name: '', startH: 9, startM: '00', endH: 9, endM: '45', requiredStaff: 2, colorKey: 'orange', enabled: true })
    setEditTask('new')
  }
  const saveTask = () => {
    if (!taskForm?.name?.trim()) return
    const updated = { ...taskForm, startTime: `${taskForm.startH}:${taskForm.startM}`, endTime: `${taskForm.endH}:${taskForm.endM}` }
    setConfig(prev => ({
      ...prev,
      specialTasks: editTask === 'new'
        ? [...prev.specialTasks, updated]
        : prev.specialTasks.map(t => t.id === editTask ? updated : t),
    }))
    setEditTask(null); setTaskForm(null)
  }
  const removeTask = (id) => setConfig(prev => ({ ...prev, specialTasks: prev.specialTasks.filter(t => t.id !== id) }))
  const toggleTask = (id) => setConfig(prev => ({
    ...prev,
    specialTasks: prev.specialTasks.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t),
  }))

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH}</div>
          <h1 className="text-2xl font-bold text-gray-900">店舗設定</h1>
          <p className="text-sm text-gray-500 mt-1">各店舗ごとに個別設定できます</p>
        </div>
        <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          {saved ? '✓ 保存しました' : '設定を保存'}
        </button>
      </div>

      {/* Basic settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">基本設定</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">営業開始時間</label>
            <select value={config.openHour} onChange={e => setConfig(p => ({ ...p, openHour: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
              {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">営業終了時間</label>
            <select value={config.closeHour} onChange={e => setConfig(p => ({ ...p, closeHour: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
              {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">シフト時間単位（デフォルト）</label>
            <div className="flex gap-2">
              {[15, 30, 60].map(v => (
                <button key={v} onClick={() => setConfig(p => ({ ...p, slotInterval: v }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${config.slotInterval === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'}`}>
                  {v}分
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">平均時間生産性（件/人/時）</label>
            <input type="number" value={config.avgProductivity}
              onChange={e => setConfig(p => ({ ...p, avgProductivity: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" min={1} max={30} />
            <div className="text-xs text-gray-400 mt-1">必要人員数の算出に使用</div>
          </div>
        </div>
      </div>

      {/* Special tasks */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">特別業務時間帯</h2>
            <p className="text-xs text-gray-500 mt-0.5">この時間帯は必要人員数に自動加算されます</p>
          </div>
          <button onClick={openNew} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1">
            + 追加
          </button>
        </div>

        <div className="space-y-3">
          {config.specialTasks.map(task => {
            const colors = TASK_COLORS[task.colorKey] || TASK_COLORS.orange
            return (
              <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border ${colors.card} ${!task.enabled ? 'opacity-50' : ''}`}>
                {/* Toggle switch */}
                <button
                  onClick={() => toggleTask(task.id)}
                  role="switch"
                  aria-checked={task.enabled}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${task.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${task.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{task.name}</div>
                  <div className="text-xs opacity-70 mt-0.5">{task.startTime} 〜 {task.endTime}　追加人員: +{task.requiredStaff}名</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => openEdit(task)} className="font-medium underline opacity-70 hover:opacity-100">編集</button>
                  <button onClick={() => removeTask(task.id)} className="font-medium text-red-600 underline opacity-70 hover:opacity-100">削除</button>
                </div>
              </div>
            )
          })}
          {config.specialTasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              特別業務が未設定です。「+ 追加」から登録してください。
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {editTask && taskForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editTask === 'new' ? '特別業務を追加' : '特別業務を編集'}</h3>
              <button onClick={() => setEditTask(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">業務名 *</label>
                <input value={taskForm.name} onChange={e => setTaskForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="例：搬入、掃除" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">開始時刻</label>
                  <div className="flex gap-1 items-center">
                    <select value={taskForm.startH} onChange={e => setTaskForm(p => ({ ...p, startH: Number(e.target.value) }))}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-400 text-sm">:</span>
                    <select value={taskForm.startM} onChange={e => setTaskForm(p => ({ ...p, startM: e.target.value }))}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {MINS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">終了時刻</label>
                  <div className="flex gap-1 items-center">
                    <select value={taskForm.endH} onChange={e => setTaskForm(p => ({ ...p, endH: Number(e.target.value) }))}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-400 text-sm">:</span>
                    <select value={taskForm.endM} onChange={e => setTaskForm(p => ({ ...p, endM: e.target.value }))}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {MINS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">追加必要人員数</label>
                <input type="number" min={1} max={10} value={taskForm.requiredStaff}
                  onChange={e => setTaskForm(p => ({ ...p, requiredStaff: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">表示カラー</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(opt => {
                    const c = TASK_COLORS[opt.key]
                    return (
                      <button key={opt.key} onClick={() => setTaskForm(p => ({ ...p, colorKey: opt.key }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${c.btn} ${taskForm.colorKey === opt.key ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={() => setEditTask(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">キャンセル</button>
              <button onClick={saveTask} className="px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
