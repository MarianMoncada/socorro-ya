import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio              from './pages/Inicio'
import Preguntas           from './pages/Preguntas'
import Protocolo           from './pages/Protocolo'
import Glosario            from './pages/Glosario'
import PedirAyuda          from './pages/PedirAyuda'
import ContactoEmergencia  from './pages/ContactoEmergencia'
import AdminLogin          from './pages/admin/Login'
import AdminDashboard      from './pages/admin/Dashboard'
import EditarEmergencia    from './pages/admin/EditarEmergencia'
import Estadisticas        from './pages/admin/Estadisticas'
import AdminGuard          from './components/admin/AdminGuard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                             element={<Inicio />}             />
        <Route path="/emergencia/:id"               element={<Preguntas />}          />
        <Route path="/protocolo/:id/:protocoloId"   element={<Protocolo />}          />
        <Route path="/pedir-ayuda/:id/:protocoloId" element={<PedirAyuda />}         />
        <Route path="/glosario"                     element={<Glosario />}           />
        <Route path="/contacto-emergencia"          element={<ContactoEmergencia />} />
        <Route path="/admin/login"                  element={<AdminLogin />}         />
        <Route path="/admin" element={
          <AdminGuard><AdminDashboard /></AdminGuard>
        } />
        <Route path="/admin/emergencias/:id" element={
          <AdminGuard><EditarEmergencia /></AdminGuard>
        } />
        <Route path="/admin/estadisticas" element={
          <AdminGuard><Estadisticas /></AdminGuard>
        } />
      </Routes>
    </BrowserRouter>
  )
}
