import { Link } from 'react-router-dom'

export default function TopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">ShiftFlow</div>
        <h1 className="text-5xl font-bold text-white mb-4">飲食店シフト管理</h1>
        <p className="text-slate-400 text-lg">Segafredo ZANETTI 新宿三丁目店</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Manager Portal */}
        <Link
          to="/manager"
          className="group bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="text-5xl mb-4">🏢</div>
          <div className="text-white text-xl font-bold mb-2">Manager Portal</div>
          <div className="text-slate-400 text-sm mb-4">
            シフト計画・目標管理・メンバー管理
          </div>
          <div className="space-y-1 text-xs text-slate-500 text-left">
            <div className="flex items-center gap-2"><span className="text-blue-400">→</span> 計画一覧ダッシュボード</div>
            <div className="flex items-center gap-2"><span className="text-blue-400">→</span> 売上・客数 目標設定</div>
            <div className="flex items-center gap-2"><span className="text-blue-400">→</span> シフト確定・人員配置</div>
            <div className="flex items-center gap-2"><span className="text-blue-400">→</span> スタッフ管理</div>
          </div>
          <div className="mt-6 inline-block bg-blue-600 group-hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            マネージャーとして入る →
          </div>
        </Link>

        {/* Employee Portal */}
        <Link
          to="/employee"
          className="group bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20"
        >
          <div className="text-5xl mb-4">👤</div>
          <div className="text-white text-xl font-bold mb-2">Employee Portal</div>
          <div className="text-slate-400 text-sm mb-4">
            スケジュール確認・シフト提出
          </div>
          <div className="space-y-1 text-xs text-slate-500 text-left">
            <div className="flex items-center gap-2"><span className="text-emerald-400">→</span> スケジュール（確定/提出済み/下書きを色分け表示）</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400">→</span> シフト提出（ドラッグ入力・保存・提出）</div>
          </div>
          <div className="mt-6 inline-block bg-emerald-600 group-hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            従業員として入る →
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <Link
          to="/employee-ver2"
          className="group inline-flex items-center gap-3 bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-400/40 rounded-xl px-6 py-3 text-sm text-slate-400 hover:text-yellow-300 transition-all duration-200"
        >
          <span className="text-lg">⚡</span>
          <span>Employee ver2 — スキマバイト機能付き</span>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-semibold">NEW</span>
        </Link>
      </div>
      <p className="text-slate-600 text-xs mt-6">ShiftFlow v2.0 — 2026年4月 前半シフト</p>
    </div>
  )
}
