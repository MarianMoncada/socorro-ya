import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio              from './pages/Inicio'
import Preguntas           from './pages/Preguntas'
import Protocolo           from './pages/Protocolo'
import Glosario            from './pages/Glosario'
import PedirAyuda          from './pages/PedirAyuda'
import ContactoEmergencia  from './pages/ContactoEmergencia'

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
      </Routes>
    </BrowserRouter>
  )
}
