import { useParams, useNavigate } from 'react-router-dom'
import emergencias from '../data/emergencias.json'

export default function PedirAyuda() {
  const { id, protocoloId } = useParams()
  const navigate = useNavigate()
  const emergencia = emergencias.find(e => e.id === id)
  const protocolo  = emergencia?.protocolos?.[protocoloId]

  if (!emergencia || !protocolo) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-2xl font-bold mb-4">Protocolo no encontrado</p>
          <button onClick={() => navigate('/')} className="underline text-white/80">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-600 flex flex-col">

      {/* Header para el transeúnte */}
      <div className="bg-red-700 px-4 py-6 text-center">
        <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">Necesito tu ayuda</p>
        <h1 className="text-white text-3xl font-bold leading-tight">{protocolo.mensaje_ayudante || 'Esta persona necesita ayuda urgente.'}</h1>
      </div>

      {/* Pasos para el ayudante */}
      <main className="flex-1 px-4 py-5 space-y-3 max-w-lg mx-auto w-full">
        {protocolo.pasos.map(paso => (
          <div key={paso.n} className="bg-white rounded-2xl p-4 flex gap-4 items-start">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-red-600 text-white font-bold text-lg flex items-center justify-center">
              {paso.n}
            </span>
            <p className="text-gray-800 text-base font-medium leading-snug flex-1">
              {paso.texto.replace('PARA QUIEN AYUDA: ', '')}
            </p>
          </div>
        ))}
      </main>

      {/* Botones de acción */}
      <div className="px-4 pb-6 space-y-3 max-w-lg mx-auto w-full">
        <a
          href="tel:911"
          className="block w-full bg-white text-red-700 text-center py-4 rounded-xl font-bold text-xl"
        >
          Llamar al 911
        </a>
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-red-700 text-white text-center py-3 rounded-xl font-medium text-sm"
        >
          ← Volver a la app
        </button>
      </div>

    </div>
  )
}
