import { useState } from 'react'
import { Link } from 'react-router-dom'
import { staff as initialStaff, shiftData, daysConfig, skillLabels, YEAR_MONTH, staffConstraints as initialConstraints } from '../../data/mockData'

const getShiftColor = (code) => {
  if (!code || code === 'X') return 'bg-gray-100 text-gray-400'
  if (code === 'F') return 'bg-green-100 text-green-700'
  if (code.startsWith('O')) return 'bg-blue-100 text-blue-700'
  if (code.endsWith('L')) return 'bg-purple-100 text-purple-700'
  return 'bg-amber-100 text-amber-700'
}

const BLANK_MEMBER = { id: null, name: '', type: 'P', role: 'スタッフ', skills: [], hourlyOrders: 7, wage: 1050 }
const BLANK_CONSTRAINT = { incompatible: [], targetEarnings: 0, retentionPriority: 5 }

export default function Members() {
  const [members, setMembers] = useState(initialStaff)
  const [constraints, setConstraints] = useState(initialConstraints)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK_MEMBER)
  const [constraintForm, setConstraintForm] = useState(BLANK_CONSTRAINT)
  const [search, setSearch] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [addIncompat, setAddIncompat] = useState(null) // staffId being added
  const [addSeverity, setAddSeverity] = useState(3)

  const filtered = members.filter(m => {
    return m.name.includes(search) && (filterSkill ? m.skills.includes(filterSkill) : true)
  })

  const openEdit = (m) => {
    setForm(m)
    setConstraintForm(constraints[m.id] || BLANK_CONSTRAINT)
    setShowModal(true)
  }

  const openNew = () => {
    setForm(BLANK_MEMBER)
    setConstraintForm(BLANK_CONSTRAINT)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const id = form.id || (members.length + 100)
    const saved = { ...form, id }
    if (form.id) {
      setMembers(prev => prev.map(m => m.id === form.id ? saved : m))
    } else {
      setMembers(prev => [...prev, saved])
    }
    setConstraints(prev => ({ ...prev, [id]: constraintForm }))
    setShowModal(false)
  }

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const removeIncompat = (staffId) => {
    setConstraintForm(prev => ({
      ...prev,
      incompatible: prev.incompatible.filter(i => i.staffId !== staffId),
    }))
  }

  const addIncompatPair = () => {
    if (!addIncompat) return
    if (constraintForm.incompatible.some(i => i.staffId === addIncompat)) return
    setConstraintForm(prev => ({
      ...prev,
      incompatible: [...prev.incompatible, { staffId: addIncompat, severity: addSeverity }],
    }))
    setAddIncompat(null)
    setAddSeverity(3)
  }

  const compatibleStaffOptions = members.filter(m => m.id !== form.id && !constraintForm.incompatible.some(i => i.staffId === m.id))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-gray-900">メンバー管理</h1>
        </div>
        <button onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
          + メンバー追加
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="名前で検索..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 outline-none focus:border-blue-400" />
        <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
          <option value="">全スキル</option>
          {Object.entries(skillLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="ml-auto text-sm text-gray-500 flex items-center">{filtered.length}名 / {members.length}名</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px]">名前</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">種別</th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600">スキル</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">生産性</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">優先度</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">目標収入</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">相性注意</th>
              {daysConfig.slice(0, 7).map(d => (
                <th key={d.day} className={`text-center px-1 py-3 font-semibold min-w-[36px] ${d.isWeekend ? 'text-red-400' : 'text-gray-500'}`}>
                  {d.day}<div className="text-[9px] font-normal">{d.dow}</div>
                </th>
              ))}
              <th className="text-center px-3 py-3 text-gray-500 text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, idx) => {
              const row = shiftData[m.id] || []
              const c = constraints[m.id] || BLANK_CONSTRAINT
              return (
                <tr key={m.id} className={`border-b border-gray-100 hover:bg-blue-50/30 ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-2.5">
                    <Link to={`/manager/members/${m.id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">{m.name}</Link>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{m.type}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {m.skills.map(sk => (
                        <span key={sk} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sk === 'barista' ? 'bg-amber-100 text-amber-700' : sk === 'cashier' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {skillLabels[sk]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5 font-semibold text-gray-700">{m.hourlyOrders}<span className="text-xs font-normal text-gray-400"> 件/h</span></td>
                  <td className="text-center px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.retentionPriority <= 3 ? 'bg-blue-100 text-blue-800' : c.retentionPriority <= 6 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
                      {c.retentionPriority}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2.5 text-sm text-gray-700">
                    {c.targetEarnings > 0 ? `¥${(c.targetEarnings / 10000).toFixed(0)}万` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-center px-3 py-2.5">
                    {c.incompatible.length > 0 ? (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">{c.incompatible.length}件</span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  {daysConfig.slice(0, 7).map((d, di) => {
                    const code = row[di] || 'X'
                    return (
                      <td key={d.day} className="text-center py-1.5 px-0.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded font-medium ${getShiftColor(code)}`}>{code === 'X' ? '×' : code}</span>
                      </td>
                    )
                  })}
                  <td className="text-center px-2 py-2.5">
                    <button onClick={() => openEdit(m)} className="text-xs text-blue-600 hover:underline">編集</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">{form.id ? 'メンバー編集' : '新規メンバー追加'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Basic info */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">名前 *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="例：田中 太郎" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">雇用形態</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                    <option value="F">正社員 (F)</option>
                    <option value="P">パート/アルバイト (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">役職</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                    {['マネージャー','サブマネージャー','バリスタ','スタッフ'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">スキル</label>
                <div className="flex gap-3">
                  {Object.entries(skillLabels).map(([k, v]) => (
                    <label key={k} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${form.skills.includes(k) ? 'bg-blue-50 border-blue-400' : 'border-gray-200 hover:border-blue-200'}`}>
                      <input type="checkbox" checked={form.skills.includes(k)} onChange={() => toggleSkill(k)} className="accent-blue-600" />
                      <span className="text-sm">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">時間生産性（件/時間）</label>
                  <input type="number" value={form.hourlyOrders} onChange={e => setForm(p => ({ ...p, hourlyOrders: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">時給（円）</label>
                  <input type="number" value={form.wage} onChange={e => setForm(p => ({ ...p, wage: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* Manager-only section */}
              <div className="border-t border-dashed border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-700">マネージャー設定</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">従業員には非表示</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">残留優先度（1=最優先）</label>
                    <input type="number" min={1} max={10} value={constraintForm.retentionPriority}
                      onChange={e => setConstraintForm(p => ({ ...p, retentionPriority: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                    <div className="text-xs text-gray-400 mt-0.5">AI配置での優先順位（1〜10）</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">目標月収（円）</label>
                    <input type="number" value={constraintForm.targetEarnings}
                      onChange={e => setConstraintForm(p => ({ ...p, targetEarnings: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                      placeholder="0" />
                    <div className="text-xs text-gray-400 mt-0.5">AI配置で稼働時間を考慮</div>
                  </div>
                </div>

                {/* Incompatible pairs */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">相性の悪いスタッフ</label>
                  {constraintForm.incompatible.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {constraintForm.incompatible.map(({ staffId, severity }) => {
                        const s = members.find(m => m.id === staffId)
                        return s ? (
                          <div key={staffId} className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded-full px-2 py-1">
                            <span>{s.name}</span>
                            <span className="bg-red-200 rounded-full px-1 font-bold">Lv{severity}</span>
                            <button onClick={() => removeIncompat(staffId)} className="ml-1 hover:text-red-900">×</button>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <select value={addIncompat || ''} onChange={e => setAddIncompat(Number(e.target.value) || null)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                      <option value="">スタッフを選択...</option>
                      {compatibleStaffOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={addSeverity} onChange={e => setAddSeverity(Number(e.target.value))}
                      className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-400">
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>Lv{v}</option>)}
                    </select>
                    <button onClick={addIncompatPair} disabled={!addIncompat}
                      className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 disabled:opacity-40">追加</button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Lv1=軽微 / Lv5=重大。AI配置時に同じ時間帯を避けます。</div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">キャンセル</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">保存する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
