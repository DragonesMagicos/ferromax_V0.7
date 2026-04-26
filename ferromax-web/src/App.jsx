import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import Productos from './pages/Productos'
import Ventas from './pages/Ventas'
import POS from './pages/POS'
import Tienda from './pages/Tienda'
import TiendaConfirmacion from './pages/TiendaConfirmacion'
import MisPedidos from './pages/MisPedidos'

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/tienda/confirmacion" element={<TiendaConfirmacion />} />
          <Route path="/tienda/mis-pedidos" element={<MisPedidos />} />

          {/* Rutas solo ADMIN */}
          <Route path="/" element={
            <ProtectedRoute requiereAdmin>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/productos" element={
            <ProtectedRoute requiereAdmin>
              <Productos />
            </ProtectedRoute>
          } />
          <Route path="/ventas" element={
            <ProtectedRoute requiereAdmin>
              <Ventas />
            </ProtectedRoute>
          } />

          {/* Rutas ADMIN y EMPLEADO */}
          <Route path="/pos" element={
            <ProtectedRoute requiereEmpleado>
              <POS />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </>
  )
}
