import { Outlet } from 'react-router-dom'

export default function EmployeeLayout() {
  return (
    <div className="emp-wrap" style={{ minHeight:'100vh', background:'#dde3ff', display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:390, minHeight:'100vh', background:'#f9fafb', display:'flex', flexDirection:'column', boxShadow:'0 0 40px rgba(91,103,248,0.18)' }}>
        <Outlet />
      </div>
    </div>
  )
}
