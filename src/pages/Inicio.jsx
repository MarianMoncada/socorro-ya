import { useNavigate } from 'react-router-dom'
import { categorias } from '../data/categorias'
import emergencias from '../data/emergencias.json'
import CardEmergencia from '../components/CardEmergencia'

const idsDisponibles = new Set(emergencias.map(e => e.id))

export default function Inicio() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-200 px-4 py-5 text-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🚨</span>
          <h1 className="text-2xl font-bold text-red-600 tracking-tight">SocorroYA</h1>
        </div>
        <p className="text-sm text-gray-500">En una emergencia, cada segundo importa</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 text-center mb-5 font-medium">
          Selecciona el tipo de emergencia
        </p>

        <div className="grid grid-cols-2 gap-3">
          {categorias.map(cat => (
            <CardEmergencia
              key={cat.id}
              id={cat.id}
              titulo={cat.titulo}
              icono={cat.icono}
              urgencia={cat.urgencia}
              disponible={idsDisponibles.has(cat.id)}
            />
          ))}
        </div>

        <footer className="mt-8 text-center space-y-2">
          <p className="text-xs text-gray-400">
            Protocolos basados en Cruz Roja Internacional y OMS
          </p>
          <p className="text-xs text-red-500 font-semibold">
            Ante una emergencia grave llama al 911
          </p>
          <button
            onClick={() => navigate('/glosario')}
            className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
          >
            Glosario y fuentes bibliográficas
          </button>
        </footer>
      </main>
    </div>
  )
}
