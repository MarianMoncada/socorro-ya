import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getEmergencia, logEvento } from '../lib/emergencias'
import BotonSOS from '../components/BotonSOS'

const headerColor = { critico:'bg-red-600', alto:'bg-orange-500', medio:'bg-yellow-500' }
const tipoLabel   = { 'autoatendible':'Lo puedes hacer tú', 'necesita-ayuda':'Necesitas ayuda', 'solo-911':'Llama al 911 ahora' }

export default function Preguntas() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [emergencia, setEmergencia] = useState(null)
  const [cargando,   setCargando]   = useState(true)
  const [error,      setError]      = useState(null)
  const [preguntaId, setPreguntaId] = useState('p1')
  const [historial,  setHistorial]  = useState([])

  useEffect(() => {
    getEmergencia(id)
      .then(data => { setEmergencia(data); logEvento(id, 'vista_emergencia') })
      .catch(err  => setError(err.message))
      .finally(()  => setCargando(false))
  }, [id])

  if (cargando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  )

  if (error || !emergencia) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <p className="text-4xl">🔍</p>
        <p className="text-gray-600 font-medium">{error || 'Emergencia no encontrada'}</p>
        <button onClick={() => navigate('/')} className="text-red-600 underline text-sm">Volver al inicio</button>
      </div>
    </div>
  )

  const preguntas      = emergencia.preguntas || []
  const preguntaActual = preguntas.find(p => p.id === preguntaId)
  const total          = preguntas.length
  const numero         = historial.length + 1
  const color          = headerColor[emergencia.urgencia] || 'bg-red-600'
  const tipo           = emergencia.tipo_protocolo || 'autoatendible'

  function handleRespuesta(siguiente) {
    const esPregunta = preguntas.some(p => p.id === siguiente)
    if (esPregunta) {
      setHistorial(prev => [...prev, preguntaId])
      setPreguntaId(siguiente)
    } else {
      const protocolos = emergencia.protocolos || {}
      const prot = protocolos[siguiente]
      if (prot?.pantalla_ayudante) navigate(`/pedir-ayuda/${id}/${siguiente}`)
      else navigate(`/protocolo/${id}/${siguiente}`)
    }
  }

  function handleAtras() {
    if (historial.length > 0) {
      setPreguntaId(historial[historial.length - 1])
      setHistorial(prev => prev.slice(0, -1))
    } else { navigate('/') }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className={`${color} text-white px-4 pt-4 pb-5`}>
        <div className="max-w-lg mx-auto">
          <button onClick={handleAtras} className="flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white">
            ← Atrás
          </button>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold leading-tight">{emergencia.titulo}</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white/90 whitespace-nowrap flex-shrink-0 font-medium">
              {tipoLabel[tipo]}
            </span>
          </div>
          <p className="text-white/70 text-sm mt-1">Pregunta {numero} de {total}</p>
          <div className="mt-3 bg-white/25 rounded-full h-1.5">
            <div className="bg-white rounded-full h-1.5 transition-all duration-400"
              style={{ width: `${(numero / total) * 100}%` }} />
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
            <button key={i} onClick={() => handleRespuesta(opcion.siguiente)}
              className="w-full bg-white border-2 border-gray-200 hover:border-red-400
                         hover:bg-red-50 rounded-xl p-4 text-left font-medium text-gray-700
                         transition-all duration-150 hover:shadow-md text-base">
              {opcion.respuesta}
            </button>
          ))}
        </div>

        <BotonSOS emergenciaId={id} />
      </main>
    </div>
  )
}
