import { useNavigate } from 'react-router-dom'
import { categorias } from '../data/categorias'
import emergencias from '../data/emergencias.json'
import CardEmergencia from '../components/CardEmergencia'

const idsDisponibles = new Set(emergencias.map(e => e.id))
const seccion1 = categorias.filter(c => c.seccion === 1)
const seccion2 = categorias.filter(c => c.seccion === 2)

function tieneContacto() {
  try { return !!JSON.parse(localStorage.getItem('socorroya_contacto'))?.telefono } catch { return false }
}

export default function Inicio() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 pt-5 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <h1 className="text-2xl font-bold text-red-600 tracking-tight">SocorroYA</h1>
            </div>
            <button
              onClick={() => navigate('/contacto-emergencia')}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                tieneContacto()
                  ? 'border-green-400 text-green-700 bg-green-50'
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}
            >
              {tieneContacto() ? '✓ Contacto SOS' : '+ Contacto SOS'}
            </button>
          </div>
          <p className="text-sm text-gray-500">¿Qué te está pasando?</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">

        {/* Sección 1 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🆘</span>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Emergencias físicas</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {seccion1.map(cat => (
              <CardEmergencia key={cat.id} {...cat} disponible={idsDisponibles.has(cat.id)} />
            ))}
          </div>
        </section>

        {/* Sección 2 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🩺</span>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Signos vitales y neurología</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {seccion2.map(cat => (
              <CardEmergencia key={cat.id} {...cat} disponible={idsDisponibles.has(cat.id)} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center space-y-2 pb-4">
          <p className="text-xs text-gray-400">Protocolos basados en Cruz Roja Internacional, OMS y AHA</p>
          <p className="text-xs text-red-500 font-semibold">Ante una emergencia grave llama al 911</p>
          <button onClick={() => navigate('/glosario')} className="text-xs text-gray-400 underline hover:text-gray-600">
            Glosario y fuentes bibliográficas
          </button>
        </footer>

      </main>
    </div>
  )
}
