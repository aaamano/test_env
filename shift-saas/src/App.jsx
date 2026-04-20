import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TopPage from './pages/TopPage'
import ManagerLayout from './components/ManagerLayout'
import EmployeeLayout from './components/EmployeeLayout'
import Dashboard from './pages/manager/Dashboard'
import Targets from './pages/manager/Targets'
import ShiftDecision from './pages/manager/ShiftDecision'
import Members from './pages/manager/Members'
import MemberDetail from './pages/manager/MemberDetail'
import StoreSettings from './pages/manager/StoreSettings'
import Schedule from './pages/employee/Schedule'
import ShiftSubmit from './pages/employee/ShiftSubmit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />

        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="targets" element={<Targets />} />
          <Route path="shift" element={<ShiftDecision />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>

        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Schedule />} />
          <Route path="submit" element={<ShiftSubmit />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
