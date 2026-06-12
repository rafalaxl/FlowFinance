// ─── FlowFinance — App.tsx ────────────────────────────────────────────────────
// React Router + proteção de rotas com AuthGuard
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/features/auth/AuthGuard'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Login from '@/pages/Login'

function ProtectedRoutes() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <Routes>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*"    element={<ProtectedRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}
