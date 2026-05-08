import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio    from './pages/Inicio'
import Preguntas from './pages/Preguntas'
import Protocolo from './pages/Protocolo'
import Glosario  from './pages/Glosario'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                           element={<Inicio />}    />
        <Route path="/emergencia/:id"             element={<Preguntas />} />
        <Route path="/protocolo/:id/:protocoloId" element={<Protocolo />} />
        <Route path="/glosario"                   element={<Glosario />}  />
      </Routes>
    </BrowserRouter>
  )
}
