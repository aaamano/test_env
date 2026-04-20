import { Outlet } from 'react-router-dom'

export default function EmployeeLayout() {
  return (
    <div style={{ minHeight:'100vh', background:'oklch(0.90 0.02 220)', display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:390, minHeight:'100vh', background:'var(--pita-bg)', display:'flex', flexDirection:'column', boxShadow:'0 0 48px rgba(0,0,0,0.13)' }}>
        <Outlet />
      </div>
    </div>
  )
}
