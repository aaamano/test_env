import { useState } from 'react'
import { storeConfig as initialConfig, YEAR_MONTH } from '../../data/mockData'

const COLOR_OPTIONS = [
  { label: 'オレンジ', value: 'bg-orange-200 border-orange-400 text-orange-800' },
  { label: 'パープル', value: 'bg-purple-200 border-purple-400 text-purple-800' },
  { label: 'ブルー',   value: 'bg-blue-200 border-blue-400 text-blue-800' },
  { label: 'グリーン', value: 'bg-green-200 border-green-400 text-green-800' },
  { label: 'レッド',   value: 'bg-red-200 border-red-400 text-red-800' },
]

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)
const MINS  = ['00', '15', '30', '45']

export default function StoreSettings() {
  const [config, setConfig] = useState(initialConfig)
  const [saved, setSaved] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [taskForm, setTaskForm] = useState(null)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const openEditTask = (task) => {
    const [sh, sm] = task.startTime.split(':').map(Number)
    const [eh, em] = task.endTime.split(':').map(Number)
    setTaskForm({
      ...task,
      startH: sh, startM: String(sm).padStart(2,'0'),
      endH: eh, endM: String(em).padStart(2,'0'),
    })
    setEditTask(task.id)
  }

  const openNewTask = () => {
    setTaskForm({ id: Date.now(), name: '', startH: 9, startM: '00', endH: 9, endM: '45', requiredStaff: 2, color: COLOR_OPTIONS[0].value, enabled: true })
    setEditTask('new')
  }

  const saveTask = () => {
    if (!taskForm?.name?.trim()) return
    const updated = {
      ...taskForm,
      startTime: `${taskForm.startH}:${taskForm.startM}`,
      endTime: `${taskForm.endH}:${taskForm.endM}`,
    }
    setConfig(prev => ({
      ...prev,
      specialTasks: editTask === 'new'
        ? [...prev.specialTasks, updated]
        : prev.specialTasks.map(t => t.id === editTask ? updated : t),
    }))
    setEditTask(null)
    setTaskForm(null)
  }

  const removeTask = (id) => {
    setConfig(prev => ({ ...prev, specialTasks: prev.specialTasks.filter(t => t.id !== id) }))
  }

  const toggleTask = (id) => {
    setConfig(prev => ({
      ...prev,
      specialTasks: prev.specialTasks.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t),
    }))
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH}</div>
          <h1 className="text-2xl font-bold text-gray-900">店舗設定</h1>
          <p className="text-sm text-gray-500 mt-1">各店舗ごとに個別設定できます</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {saved ? '✓ 保存しました' : '設定を保存'}
        </button>
      </div>

      {/* Basic settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">基本設定</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">営業開始時間</label>
            <select
              value={config.openHour}
              onChange={e => setConfig(p => ({ ...p, openHour: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">営業終了時間</label>
            <select
              value={config.closeHour}
              onChange={e => setConfig(p => ({ ...p, closeHour: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">シフト時間単位</label>
            <div className="flex gap-2">
              {[15, 30, 60].map(v => (
                <button
                  key={v}
                  onClick={() => setConfig(p => ({ ...p, slotInterval: v }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    config.slotInterval === v
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {v}分
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">平均時間生産性（件/人/時）</label>
            <input
              type="number"
              value={config.avgProductivity}
              onChange={e => setConfig(p => ({ ...p, avgProductivity: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              min={1} max={30}
            />
            <div className="text-xs text-gray-400 mt-1">必要人員数の算出に使用されます</div>
          </div>
        </div>
      </div>

      {/* Special tasks */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">特別業務時間帯</h2>
            <p className="text-xs text-gray-500 mt-0.5">設定した時間帯は必要人員数に自動加算されます</p>
          </div>
          <button
            onClick={openNewTask}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
          >
            + 追加
          </button>
        </div>

        <div className="space-y-3">
          {config.specialTasks.map(task => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border ${task.color} ${!task.enabled ? 'opacity-50' : ''}`}>
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${task.enabled ? 'bg-blue-600' : 'bg-gray-300'} relative`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${task.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <div className="flex-1">
                <div className="font-semibold text-sm">{task.name}</div>
                <div className="text-xs opacity-70">{task.startTime} 〜 {task.endTime}　追加人員: {task.requiredStaff}名</div>
              </div>
              <button onClick={() => openEditTask(task)} className="text-xs text-gray-600 hover:underline">編集</button>
              <button onClick={() => removeTask(task.id)} className="text-xs text-red-500 hover:underline">削除</button>
            </div>
          ))}
          {config.specialTasks.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              特別業務が未設定です。「+ 追加」から登録してください。
            </div>
          )}
        </div>
      </div>

      {/* Task edit modal */}
      {editTask && taskForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editTask === 'new' ? '特別業務を追加' : '特別業務を編集'}</h3>
              <button onClick={() => setEditTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">業務名 *</label>
                <input
                  value={taskForm.name}
                  onChange={e => setTaskForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="例：搬入、掃除"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">開始時刻</label>
                  <div className="flex gap-1">
                    <select value={taskForm.startH} onChange={e => setTaskForm(p => ({ ...p, startH: Number(e.target.value) }))}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="self-center text-gray-400">:</span>
                    <select value={taskForm.startM} onChange={e => setTaskForm(p => ({ ...p, startM: e.target.value }))}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {MINS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">終了時刻</label>
                  <div className="flex gap-1">
                    <select value={taskForm.endH} onChange={e => setTaskForm(p => ({ ...p, endH: Number(e.target.value) }))}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="self-center text-gray-400">:</span>
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
                  {COLOR_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setTaskForm(p => ({ ...p, color: opt.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${opt.value} ${taskForm.color === opt.value ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}>
                      {opt.label}
                    </button>
                  ))}
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
