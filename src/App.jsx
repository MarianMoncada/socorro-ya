import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio    from './pages/Inicio'
import Preguntas from './pages/Preguntas'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Inicio />}    />
        <Route path="/emergencia/:id"      element={<Preguntas />} />
      </Routes>
    </BrowserRouter>
  )
}
