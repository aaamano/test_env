import { useState } from 'react'
import { Link } from 'react-router-dom'
import { staff as initialStaff, shiftData, daysConfig, skillLabels, YEAR_MONTH } from '../../data/mockData'

const SHIFT_COLORS = {
  'F': 'bg-green-100 text-green-700',
  'X': 'bg-gray-100 text-gray-400',
}
const getShiftColor = (code) => {
  if (!code || code === 'X') return 'bg-gray-100 text-gray-400'
  if (code === 'F') return 'bg-green-100 text-green-700'
  if (code.startsWith('O')) return 'bg-blue-100 text-blue-700'
  if (code.endsWith('L')) return 'bg-purple-100 text-purple-700'
  return 'bg-amber-100 text-amber-700'
}

const BLANK_MEMBER = { id: null, name: '', type: 'P', role: 'スタッフ', skills: [], hourlyOrders: 7, wage: 1050 }

export default function Members() {
  const [members, setMembers] = useState(initialStaff)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK_MEMBER)
  const [search, setSearch] = useState('')
  const [filterSkill, setFilterSkill] = useState('')

  const filtered = members.filter(m => {
    const matchName = m.name.includes(search)
    const matchSkill = filterSkill ? m.skills.includes(filterSkill) : true
    return matchName && matchSkill
  })

  const handleSave = () => {
    if (!form.name.trim()) return
    if (form.id) {
      setMembers(prev => prev.map(m => m.id === form.id ? form : m))
    } else {
      setMembers(prev => [...prev, { ...form, id: prev.length + 100 }])
    }
    setShowModal(false)
    setForm(BLANK_MEMBER)
  }

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-gray-900">メンバー管理</h1>
        </div>
        <button
          onClick={() => { setForm(BLANK_MEMBER); setShowModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> メンバー追加
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="名前で検索..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 outline-none focus:border-blue-400"
        />
        <select
          value={filterSkill}
          onChange={e => setFilterSkill(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">全スキル</option>
          {Object.entries(skillLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="ml-auto text-sm text-gray-500 flex items-center">
          {filtered.length}名 / {members.length}名
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px]">名前</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">種別</th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600">役職</th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600">スキル</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">時間生産性</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">時給</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">今月出勤</th>
              {daysConfig.slice(0, 7).map(d => (
                <th key={d.day} className={`text-center px-1 py-3 font-semibold min-w-[36px] ${d.isWeekend ? 'text-red-400' : 'text-gray-500'}`}>
                  {d.day}
                  <div className="text-[9px] font-normal">{d.dow}</div>
                </th>
              ))}
              <th className="text-center px-3 py-3 text-gray-500 text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, idx) => {
              const row = shiftData[m.id] || []
              const workDays = row.filter(c => c && c !== 'X').length
              return (
                <tr key={m.id} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-2.5">
                    <Link to={`/manager/members/${m.id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs">{m.role}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {m.skills.map(sk => (
                        <span key={sk} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          sk === 'barista' ? 'bg-amber-100 text-amber-700' :
                          sk === 'cashier' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {skillLabels[sk]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5 font-semibold text-gray-700">{m.hourlyOrders}<span className="text-xs font-normal text-gray-400 ml-0.5">件/h</span></td>
                  <td className="text-center px-3 py-2.5 text-gray-700">¥{m.wage.toLocaleString()}</td>
                  <td className="text-center px-3 py-2.5 font-bold text-blue-700">{workDays}日</td>
                  {daysConfig.slice(0, 7).map(d => {
                    const code = row[d.day - 1] || '—'
                    return (
                      <td key={d.day} className="text-center py-1.5 px-0.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded font-medium ${getShiftColor(code)}`}>
                          {code === 'X' ? '×' : code}
                        </span>
                      </td>
                    )
                  })}
                  <td className="text-center px-2 py-2.5">
                    <button
                      onClick={() => { setForm(m); setShowModal(true) }}
                      className="text-xs text-blue-600 hover:underline mr-2"
                    >編集</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">{form.id ? 'メンバー編集' : '新規メンバー追加'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">名前 *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="例：田中 太郎"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">雇用形態</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="F">正社員 (F)</option>
                    <option value="P">パート/アルバイト (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">役職</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option>マネージャー</option>
                    <option>サブマネージャー</option>
                    <option>バリスタ</option>
                    <option>スタッフ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">スキル</label>
                <div className="flex gap-3">
                  {Object.entries(skillLabels).map(([k, v]) => (
                    <label key={k} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                      form.skills.includes(k) ? 'bg-blue-50 border-blue-400' : 'border-gray-200 hover:border-blue-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.skills.includes(k)}
                        onChange={() => toggleSkill(k)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">時間生産性（件/時間）</label>
                  <input
                    type="number"
                    value={form.hourlyOrders}
                    onChange={e => setForm(p => ({ ...p, hourlyOrders: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <div className="text-xs text-gray-400 mt-0.5">1時間に処理できる注文数の係数</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">時給（円）</label>
                  <input
                    type="number"
                    value={form.wage}
                    onChange={e => setForm(p => ({ ...p, wage: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                キャンセル
              </button>
              <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
