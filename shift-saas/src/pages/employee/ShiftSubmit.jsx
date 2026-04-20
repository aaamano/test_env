import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { staff, daysConfig, YEAR_MONTH, shiftSubmissions as initialSubmissions } from '../../data/mockData'

const ME = staff[0]
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)

function parseCode(code) {
  if (!code || code === 'X') return null
  if (code === 'F') return { start: 9, end: 18 }
  const m = code.match(/^O-(\d+(?:\.\d+)?)$/)
  if (m) return { start: 9, end: parseFloat(m[1]) }
  const m2 = code.match(/^(\d+(?:\.\d+)?)[.-](\d+(?:\.\d+)?|L)$/)
  if (m2) return { start: parseFloat(m2[1]), end: m2[2] === 'L' ? 22 : parseFloat(m2[2]) }
  return null
}

const STATUS_LABEL = { draft: '下書き', submitted: '提出済み', confirmed: '確定済み' }
const STATUS_STYLE = {
  draft:     'bg-amber-100 text-amber-800',
  submitted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
}

export default function ShiftSubmit() {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [mode, setMode] = useState('list') // 'list' | 'edit'
  const [active, setActive] = useState(null) // submission being edited
  const [editRow, setEditRow] = useState([])
  const [previewRange, setPreviewRange] = useState(null)
  const dragging = useRef(false)
  const startCell = useRef(null)
  const selectVal = useRef(null)

  const openEdit = (sub) => {
    setActive(sub)
    setEditRow([...sub.shiftRow])
    setMode('edit')
  }
  const openNew = () => {
    const newSub = { id: Date.now(), period: '2026年5月 後半', submittedAt: null, lastEditedAt: null, status: 'draft', shiftRow: Array(15).fill('X') }
    setActive(newSub)
    setEditRow(Array(15).fill('X'))
    setMode('edit')
  }
  const saveDraft = () => {
    const now = new Date().toLocaleString('ja-JP').replace(/\//g,'-').slice(0,16)
    const updated = { ...active, shiftRow: [...editRow], lastEditedAt: now, status: active.status === 'confirmed' ? 'confirmed' : 'draft' }
    setSubmissions(prev => prev.find(s => s.id === active.id) ? prev.map(s => s.id === active.id ? updated : s) : [...prev, updated])
    setMode('list')
  }
  const submitShift = () => {
    const now = new Date().toLocaleString('ja-JP').replace(/\//g,'-').slice(0,16)
    const updated = { ...active, shiftRow: [...editRow], submittedAt: now, lastEditedAt: now, status: 'submitted' }
    setSubmissions(prev => prev.find(s => s.id === active.id) ? prev.map(s => s.id === active.id ? updated : s) : [...prev, updated])
    setMode('list')
  }

  const isInPreview = (di, h) => {
    if (!previewRange || previewRange.di !== di) return false
    const lo = Math.min(previewRange.startH, previewRange.endH)
    const hi = Math.max(previewRange.startH, previewRange.endH)
    return h >= lo && h <= hi
  }
  const onDown = (di, h) => {
    dragging.current = true; startCell.current = { di, h }
    const ex = parseCode(editRow[di]); selectVal.current = ex && h >= ex.start && h < ex.end ? 'erase' : 'draw'
    setPreviewRange({ di, startH: h, endH: h })
  }
  const onEnter = (di, h) => {
    if (!dragging.current || !startCell.current || startCell.current.di !== di) return
    setPreviewRange({ di, startH: startCell.current.h, endH: h })
  }
  const onUp = (di, h) => {
    if (!dragging.current) return; dragging.current = false
    const pr = previewRange; if (!pr || pr.di !== di) { setPreviewRange(null); return }
    const lo = Math.min(pr.startH, pr.endH), hi = Math.max(pr.startH, pr.endH)
    setEditRow(prev => {
      const next = [...prev]
      if (selectVal.current === 'erase') { next[di] = 'X' }
      else {
        const sh = lo, eh = hi + 1
        next[di] = sh === 9 && eh === 18 ? 'F' : sh === 9 ? `O-${eh}` : eh === 22 ? `${sh}-L` : `${sh}-${eh}`
      }
      return next
    })
    setPreviewRange(null); startCell.current = null; selectVal.current = null
  }

  if (mode === 'edit') return (
    <div className="pita-phone-stage">
      <div>
        <div className="pita-phone">
          <div className="pita-phone-inner">
            <div className="pita-notch" />
            <div className="pita-status-bar"><span>9:41</span><span>●●● 5G 100%</span></div>
            <div className="pita-phone-header">
              <button onClick={() => setMode('list')} style={{ fontSize:12, color:'var(--pita-accent)', background:'none', border:'none', cursor:'pointer', padding:'0 4px', fontWeight:600 }}>← 戻る</button>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--pita-text)' }}>{active.period}</div>
                <div style={{ fontSize:9, color:'var(--pita-muted)' }}>シフト提出</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[active.status]}`}>{STATUS_LABEL[active.status]}</span>
            </div>
            <div className="pita-mode-bar">
              <span className="pita-mode-chip editing">編集中</span>
              <span style={{ fontSize:9, color:'var(--pita-muted)' }}>ドラッグでシフト入力</span>
            </div>
            <div className="pita-phone-body" onMouseLeave={() => { if (dragging.current) { dragging.current = false; setPreviewRange(null) } }}>
              <div style={{ overflowX:'auto' }}>
                <table className="pita-shift-grid" style={{ userSelect:'none' }}>
                  <thead><tr><th className="pita-time-col">日</th>{HOURS.map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {daysConfig.map((d, di) => {
                      const shift = parseCode(editRow[di])
                      return (
                        <tr key={d.day}>
                          <td className="pita-time-col" style={{ color: d.isWeekend ? 'oklch(0.50 0.12 20)' : 'var(--pita-text)', fontSize:9 }}>{d.day}/{d.dow}</td>
                          {HOURS.map(h => {
                            const inShift = shift && h >= shift.start && h < shift.end
                            const inPrev = isInPreview(di, h)
                            let cls = 'pita-cell-off'
                            if (inPrev) cls = selectVal.current === 'erase' ? 'pita-cell-off' : 'pita-cell-select'
                            else if (inShift) cls = 'pita-cell-work'
                            return <td key={h} className={cls} style={{ cursor:'crosshair' }} onMouseDown={() => onDown(di, h)} onMouseEnter={() => onEnter(di, h)} onMouseUp={() => onUp(di, h)} />
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ padding:'8px 12px', borderTop:'1px solid var(--pita-border)', display:'flex', gap:8, background:'var(--pita-panel)', flexShrink:0 }}>
              <button onClick={saveDraft} style={{ flex:1, padding:'8px 0', borderRadius:8, border:'1px solid var(--pita-border)', background:'var(--pita-panel)', color:'var(--pita-text)', fontSize:12, fontWeight:600, cursor:'pointer' }}>下書き保存</button>
              {active.status !== 'confirmed' && (
                <button onClick={submitShift} style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', background:'var(--pita-accent)', color:'white', fontSize:12, fontWeight:600, cursor:'pointer' }}>提出する</button>
              )}
            </div>
            <div className="pita-phone-tabbar">
              <Link to="/employee" className="pita-tab-item"><span className="pita-tab-ico">📅</span>スケジュール</Link>
              <Link to="/employee/submit" className="pita-tab-item active"><span className="pita-tab-ico">📝</span>シフト提出</Link>
              <span className="pita-tab-item"><span className="pita-tab-ico">👤</span>アカウント</span>
            </div>
          </div>
        </div>
      </div>
      <div><div className="pita-side-note" style={{ fontSize:11 }}>グリッドをドラッグしてシフト範囲を入力。すでに入力済みのセルからドラッグすると消去できます。</div></div>
    </div>
  )

  return (
    <div className="pita-phone-stage">
      <div>
        <div className="pita-phone">
          <div className="pita-phone-inner">
            <div className="pita-notch" />
            <div className="pita-status-bar"><span>9:41</span><span>●●● 5G 100%</span></div>
            <div className="pita-phone-header">
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--pita-accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{ME.name[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--pita-text)' }}>シフト提出</div>
                <div style={{ fontSize:10, color:'var(--pita-muted)', marginTop:1 }}>{YEAR_MONTH}</div>
              </div>
              <button onClick={openNew} className="pita-btn accent" style={{ fontSize:10, height:24 }}>+ 新規作成</button>
            </div>
            <div className="pita-phone-body">
              <div style={{ padding:'8px 0' }}>
                {submissions.length === 0 && (
                  <div style={{ textAlign:'center', padding:'32px 16px', color:'var(--pita-faint)', fontSize:12 }}>提出済みのシフトはありません</div>
                )}
                {submissions.map(sub => (
                  <div key={sub.id} style={{ margin:'0 10px 8px', padding:'10px 12px', background:'var(--pita-panel)', border:'1px solid var(--pita-border)', borderRadius:10 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--pita-text)' }}>{sub.period}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[sub.status]}`}>{STATUS_LABEL[sub.status]}</span>
                    </div>
                    <div style={{ fontSize:10, color:'var(--pita-muted)', marginBottom:8 }}>
                      <div>提出: {sub.submittedAt || '—'}</div>
                      <div>最終編集: {sub.lastEditedAt || '—'}</div>
                    </div>
                    <button onClick={() => openEdit(sub)} style={{ width:'100%', padding:'6px 0', borderRadius:6, border:'1px solid var(--pita-border)', background:'var(--pita-bg-subtle)', color:'var(--pita-text)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                      {sub.status === 'confirmed' ? '確認する' : '編集する'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="pita-phone-tabbar">
              <Link to="/employee" className="pita-tab-item"><span className="pita-tab-ico">📅</span>スケジュール</Link>
              <Link to="/employee/submit" className="pita-tab-item active"><span className="pita-tab-ico">📝</span>シフト提出</Link>
              <span className="pita-tab-item"><span className="pita-tab-ico">👤</span>アカウント</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginTop:12, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--pita-faint)' }}>URL: /employee/submit</div>
      </div>
      <div>
        <div className="pita-side-note" style={{ fontSize:11, color:'var(--pita-muted)', lineHeight:1.6 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontWeight:600, marginBottom:8, color:'var(--pita-text)' }}>承認状況</div>
          <div style={{ marginBottom:4 }}><span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full font-semibold">下書き</span> — 未提出の編集中</div>
          <div style={{ marginBottom:4 }}><span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full font-semibold">提出済み</span> — マネージャー確認待ち</div>
          <div style={{ marginBottom:12 }}><span className="bg-emerald-100 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-semibold">確定済み</span> — マネージャーが確定</div>
          <hr style={{ border:'none', borderTop:'1px solid var(--pita-border)', margin:'10px 0' }} />
          <Link to="/" style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--pita-muted)', textDecoration:'none' }}>← TOPへ</Link>
        </div>
      </div>
    </div>
  )
}
