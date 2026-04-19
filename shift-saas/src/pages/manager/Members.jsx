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

// Retention priority: 1=most important (red), 10=least (gray)
const retentionCls = (p) => {
  if (p <= 2) return 'bg-red-100 text-red-700 border border-red-300'
  if (p <= 4) return 'bg-orange-100 text-orange-700 border border-orange-300'
  if (p <= 6) return 'bg-yellow-50 text-yellow-700 border border-yellow-300'
  return 'bg-gray-100 text-gray-500 border border-gray-200'
}

const BLANK_MEMBER     = { id: null, name: '', type: 'P', role: 'スタッフ', skills: [], hourlyOrders: 7, wage: 1050 }
const BLANK_CONSTRAINT = { incompatible: [], targetEarnings: 0, retentionPriority: 5 }

const MODAL_TABS = ['基本情報', 'マネージャー設定']

export default function Members() {
  const [members,         setMembers]         = useState(initialStaff)
  const [constraints,     setConstraints]     = useState(initialConstraints)
  const [showModal,       setShowModal]       = useState(false)
  const [activeTab,       setActiveTab]       = useState(0)
  const [form,            setForm]            = useState(BLANK_MEMBER)
  const [constraintForm,  setConstraintForm]  = useState(BLANK_CONSTRAINT)
  const [search,          setSearch]          = useState('')
  const [filterSkill,     setFilterSkill]     = useState('')
  const [addIncompat,     setAddIncompat]     = useState(null)
  const [addSeverity,     setAddSeverity]     = useState(3)

  const filtered = members.filter(m =>
    m.name.includes(search) && (filterSkill ? m.skills.includes(filterSkill) : true)
  )

  const openEdit = (m) => {
    setForm(m)
    setConstraintForm(constraints[m.id] || BLANK_CONSTRAINT)
    setActiveTab(0)
    setShowModal(true)
  }
  const openNew = () => {
    setForm(BLANK_MEMBER)
    setConstraintForm(BLANK_CONSTRAINT)
    setActiveTab(0)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const id = form.id || (members.length + 100)
    const saved = { ...form, id }
    if (form.id) setMembers(prev => prev.map(m => m.id === form.id ? saved : m))
    else         setMembers(prev => [...prev, saved])
    setConstraints(prev => ({ ...prev, [id]: constraintForm }))
    setShowModal(false)
  }

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
    }))
  }

  const removeIncompat = (staffId) =>
    setConstraintForm(prev => ({ ...prev, incompatible: prev.incompatible.filter(i => i.staffId !== staffId) }))

  const addIncompatPair = () => {
    if (!addIncompat || constraintForm.incompatible.some(i => i.staffId === addIncompat)) return
    setConstraintForm(prev => ({ ...prev, incompatible: [...prev.incompatible, { staffId: addIncompat, severity: addSeverity }] }))
    setAddIncompat(null); setAddSeverity(3)
  }

  const compatOptions = members.filter(m => m.id !== form.id && !constraintForm.incompatible.some(i => i.staffId === m.id))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{YEAR_MONTH} 前半</div>
          <h1 className="text-2xl font-bold text-gray-900">メンバー管理</h1>
        </div>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
          + メンバー追加
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="名前で検索..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 outline-none focus:border-blue-400" />
        <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
          <option value="">全スキル</option>
          {Object.entries(skillLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="ml-auto text-sm text-gray-500 flex items-center">{filtered.length}名 / {members.length}名</div>
      </div>

      {/* Legend for priority */}
      <div className="flex gap-3 mb-3 text-xs text-gray-500 flex-wrap">
        <span>残留優先度:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-200 inline-block border border-red-300" />1〜2 最優先</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-200 inline-block border border-orange-300" />3〜4 高</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-100 inline-block border border-yellow-300" />5〜6 中</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-100 inline-block border border-gray-200" />7〜10 低</span>
        <span className="ml-4 text-gray-400">※ AI配置の優先順位に影響します</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px]">名前</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">種別</th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600">スキル</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">生産性</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600 min-w-[80px]">残留優先度</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">目標収入</th>
              <th className="text-center px-3 py-3 font-semibold text-orange-600 min-w-[100px]">⚠ 相性注意</th>
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
              const hasIncompat = c.incompatible.length > 0
              return (
                <tr key={m.id} className={`border-b border-gray-100 hover:bg-blue-50/20 transition-colors ${
                  hasIncompat ? 'bg-orange-50/30' : idx % 2 === 1 ? 'bg-gray-50/30' : ''
                }`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/manager/members/${m.id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                        {m.name}
                      </Link>
                      {hasIncompat && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full border border-orange-200 font-medium">
                          相性注意
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {m.skills.map(sk => (
                        <span key={sk} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          sk === 'barista' ? 'bg-amber-100 text-amber-700' : sk === 'cashier' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>{skillLabels[sk]}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5 font-semibold text-gray-700">
                    {m.hourlyOrders}<span className="text-xs font-normal text-gray-400"> 件/h</span>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${retentionCls(c.retentionPriority)}`}>
                      P{c.retentionPriority}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2.5 text-sm">
                    {c.targetEarnings > 0
                      ? <span className="font-medium text-gray-700">¥{(c.targetEarnings / 10000).toFixed(0)}万</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="text-center px-3 py-2.5">
                    {hasIncompat ? (
                      <div className="space-y-1">
                        {c.incompatible.map(({ staffId, severity }) => {
                          const s = members.find(x => x.id === staffId)
                          return s ? (
                            <div key={staffId} className="inline-flex items-center gap-1 bg-red-100 border border-red-200 text-red-700 text-[10px] rounded-full px-2 py-0.5">
                              <span>{s.name}</span>
                              <span className={`rounded-full px-1 font-bold text-[9px] ${
                                severity >= 4 ? 'bg-red-600 text-white' : severity >= 2 ? 'bg-red-300 text-red-900' : 'bg-red-200 text-red-800'
                              }`}>Lv{severity}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  {daysConfig.slice(0, 7).map((d, di) => {
                    const code = row[di] || 'X'
                    return (
                      <td key={d.day} className="text-center py-1.5 px-0.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded font-medium ${getShiftColor(code)}`}>
                          {code === 'X' ? '×' : code}
                        </span>
                      </td>
                    )
                  })}
                  <td className="text-center px-2 py-2.5">
                    <button onClick={() => openEdit(m)} className="text-xs text-blue-600 hover:underline font-medium">編集</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">{form.id ? 'メンバー編集' : '新規メンバー追加'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              {MODAL_TABS.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors mr-2 ${
                    activeTab === i ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {i === 1 ? (
                    <span className="flex items-center gap-1.5">
                      {tab}
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">非公開</span>
                    </span>
                  ) : tab}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

              {/* ── Tab 0: 基本情報 ── */}
              {activeTab === 0 && (
                <>
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
                    <div className="flex gap-3 flex-wrap">
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
                </>
              )}

              {/* ── Tab 1: マネージャー設定 ── */}
              {activeTab === 1 && (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-orange-500 text-lg mt-0.5">🔒</span>
                    <div className="text-xs text-orange-700">
                      <div className="font-semibold mb-0.5">マネージャー専用情報</div>
                      この設定は従業員には表示されません。AI自動配置の計算に使用されます。
                    </div>
                  </div>

                  {/* Retention priority */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800">残留優先度</label>
                        <div className="text-xs text-gray-500 mt-0.5">1=最優先 / 10=低優先。AI配置での優先順位に影響</div>
                      </div>
                      <span className={`text-lg font-bold px-3 py-1 rounded-full ${retentionCls(constraintForm.retentionPriority)}`}>
                        P{constraintForm.retentionPriority}
                      </span>
                    </div>
                    <input type="range" min={1} max={10} value={constraintForm.retentionPriority}
                      onChange={e => setConstraintForm(p => ({ ...p, retentionPriority: Number(e.target.value) }))}
                      className="w-full accent-blue-600" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>1 最優先（退職リスク）</span>
                      <span>10 低優先</span>
                    </div>
                  </div>

                  {/* Target earnings */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">目標月収（円）</label>
                    <div className="text-xs text-gray-500 mb-3">AI配置でこの金額に近づくよう稼働時間を調整します</div>
                    <input type="number" value={constraintForm.targetEarnings}
                      onChange={e => setConstraintForm(p => ({ ...p, targetEarnings: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="例: 80000" />
                    {constraintForm.targetEarnings > 0 && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        月収目標: ¥{constraintForm.targetEarnings.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Incompatible pairs */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">相性の悪いスタッフ</label>
                    <div className="text-xs text-gray-500 mb-3">
                      設定したスタッフとは同時間帯に配置しないよう AI が考慮します。Lv が高いほど重大。
                    </div>

                    {constraintForm.incompatible.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        {constraintForm.incompatible.map(({ staffId, severity }) => {
                          const s = members.find(m => m.id === staffId)
                          return s ? (
                            <div key={staffId} className="flex items-center gap-1.5 bg-white border border-red-300 text-red-700 text-xs rounded-full px-2.5 py-1.5 shadow-sm">
                              <span className="font-medium">{s.name}</span>
                              <span className={`rounded-full px-1.5 py-0.5 font-bold text-[10px] ${
                                severity >= 4 ? 'bg-red-600 text-white' : severity >= 2 ? 'bg-red-300 text-red-900' : 'bg-red-100 text-red-700'
                              }`}>Lv{severity}</span>
                              <button onClick={() => removeIncompat(staffId)} className="hover:text-red-900 font-bold ml-0.5">×</button>
                            </div>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 mb-3 text-center">設定なし</div>
                    )}

                    <div className="flex gap-2">
                      <select value={addIncompat || ''} onChange={e => setAddIncompat(Number(e.target.value) || null)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400">
                        <option value="">スタッフを選択...</option>
                        {compatOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select value={addSeverity} onChange={e => setAddSeverity(Number(e.target.value))}
                        className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-red-400">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>Lv{v} {v >= 4 ? '⚠' : ''}</option>)}
                      </select>
                      <button onClick={addIncompatPair} disabled={!addIncompat}
                        className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 disabled:opacity-40">
                        追加
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">Lv1=軽微 / Lv5=重大な対立</div>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3 justify-between">
              <div className="text-xs text-gray-400 self-center">* 必須項目</div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">キャンセル</button>
                <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">保存する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
