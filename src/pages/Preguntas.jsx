import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import emergencias from '../data/emergencias.json'

const headerColor = {
  critico: 'bg-red-600',
  alto:    'bg-orange-500',
  medio:   'bg-yellow-500',
}

export default function Preguntas() {
  const { id } = useParams()
  const navigate = useNavigate()

  const emergencia = emergencias.find(e => e.id === id)

  const [preguntaId, setPreguntaId] = useState('p1')
  const [historial, setHistorial]   = useState([])

  if (!emergencia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-4xl">🔍</p>
          <p className="text-gray-600 font-medium">Emergencia no encontrada</p>
          <button
            onClick={() => navigate('/')}
            className="text-red-600 underline text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const preguntaActual = emergencia.preguntas.find(p => p.id === preguntaId)
  const totalPreguntas  = emergencia.preguntas.length
  const numeroPregunta  = historial.length + 1
  const color           = headerColor[emergencia.urgencia] || 'bg-red-600'

  function handleRespuesta(siguiente) {
    const esPregunta = emergencia.preguntas.some(p => p.id === siguiente)
    if (esPregunta) {
      setHistorial(prev => [...prev, preguntaId])
      setPreguntaId(siguiente)
    } else {
      navigate(`/protocolo/${id}/${siguiente}`)
    }
  }

  function handleAtras() {
    if (historial.length > 0) {
      const anterior = historial[historial.length - 1]
      setHistorial(prev => prev.slice(0, -1))
      setPreguntaId(anterior)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <header className={`${color} text-white px-4 pt-4 pb-5`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleAtras}
            className="flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white"
          >
            ← Atrás
          </button>
          <h1 className="text-xl font-bold">{emergencia.titulo}</h1>
          <p className="text-white/70 text-sm mt-1">
            Pregunta {numeroPregunta} de {totalPreguntas}
          </p>
          <div className="mt-3 bg-white/25 rounded-full h-1.5">
            <div
              className="bg-white rounded-full h-1.5 transition-all duration-400"
              style={{ width: `${(numeroPregunta / totalPreguntas) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 flex items-center justify-center">
          <p className="text-xl font-semibold text-gray-800 text-center leading-snug">
            {preguntaActual?.texto}
          </p>
        </div>

        <div className="space-y-3">
          {preguntaActual?.opciones.map((opcion, i) => (
            <button
              key={i}
              onClick={() => handleRespuesta(opcion.siguiente)}
              className="w-full bg-white border-2 border-gray-200 hover:border-red-400
                         hover:bg-red-50 rounded-xl p-4 text-left font-medium text-gray-700
                         transition-all duration-150 hover:shadow-md"
            >
              {opcion.respuesta}
            </button>
          ))}
        </div>

        {emergencia.llamar_911 && (
          <a
            href="tel:911"
            className="block w-full bg-red-600 hover:bg-red-700 text-white text-center
                       py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Llamar al 911
          </a>
        )}

      </main>
    </div>
  )
}
