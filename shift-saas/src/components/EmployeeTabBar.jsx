import { Link } from 'react-router-dom'
import { employeeNotifications } from '../data/mockData'

const UNREAD = employeeNotifications.filter(n => !n.read).length

export default function EmployeeTabBar({ base = '/employee', active, sukima = false }) {
  const dot = { position:'absolute', top:6, right:'calc(50% - 14px)', width:7, height:7, background:'#ef4444', borderRadius:'50%' }
  return (
    <div className="pita-phone-tabbar">
      <Link to={base} className={`pita-tab-item ${active === 'schedule' ? 'active' : ''}`}>
        <span className="pita-tab-ico">📅</span>スケジュール
      </Link>
      <Link to={`${base}/submit`} className={`pita-tab-item ${active === 'submit' ? 'active' : ''}`}>
        <span className="pita-tab-ico">📝</span>シフト提出
      </Link>
      {sukima && (
        <Link to={`${base}/sukima`} className={`pita-tab-item ${active === 'sukima' ? 'active' : ''}`}>
          <span className="pita-tab-ico">⚡</span>スキマ
        </Link>
      )}
      <Link to={`${base}/notifications`} className={`pita-tab-item ${active === 'notifications' ? 'active' : ''}`} style={{ position:'relative' }}>
        <span className="pita-tab-ico">🔔</span>通知
        {UNREAD > 0 && <span style={dot} />}
      </Link>
    </div>
  )
}
