import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getEmergencia, logEvento } from '../lib/emergencias'
import BotonSOS from '../components/BotonSOS'

const headerColor = { critico:'bg-red-600', alto:'bg-orange-500', medio:'bg-yellow-500' }

export default function Protocolo() {
  const { id, protocoloId } = useParams()
  const navigate = useNavigate()

  const [emergencia,    setEmergencia]    = useState(null)
  const [cargando,      setCargando]      = useState(true)
  const [error,         setError]         = useState(null)
  const [pasoActual,    setPasoActual]    = useState(0)
  const [tiempoRestante,setTiempoRestante]= useState(null)
  const intervaloRef = useRef(null)

  useEffect(() => {
    getEmergencia(id)
      .then(data => { setEmergencia(data); logEvento(id, 'inicio_protocolo', protocoloId) })
      .catch(err  => setError(err.message))
      .finally(()  => setCargando(false))
  }, [id])

  const protocolo    = emergencia?.protocolos?.[protocoloId]
  const paso         = protocolo?.pasos?.[pasoActual]
  const total        = protocolo?.pasos?.length || 0
  const esUltimo     = pasoActual === total - 1
  const color        = headerColor[emergencia?.urgencia] || 'bg-red-600'
  const esAyudante   = protocolo?.pantalla_ayudante
  const esPrefijado  = paso?.texto?.startsWith('PARA QUIEN AYUDA:')

  useEffect(() => {
    clearInterval(intervaloRef.current)
    if (paso?.timer) {
      setTiempoRestante(paso.timer)
      intervaloRef.current = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) { clearInterval(intervaloRef.current); return 0 }
          return prev - 1
        })
      }, 1000)
    } else { setTiempoRestante(null) }
    return () => clearInterval(intervaloRef.current)
  }, [pasoActual, emergencia])

  if (cargando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !emergencia || !protocolo) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <p className="text-4xl">🔍</p>
        <p className="text-gray-600 font-medium">{error || 'Protocolo no encontrado'}</p>
        <button onClick={() => navigate('/')} className="text-red-600 underline text-sm">Volver al inicio</button>
      </div>
    </div>
  )

  function formatTiempo(seg) {
    const m = Math.floor(seg / 60), s = seg % 60
    return m > 0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`
  }

  function textoLimpio(texto) {
    return (texto || '').replace(/^PARA QUIEN AYUDA:\s*/i, '')
  }

  function irAnterior() {
    if (pasoActual > 0) setPasoActual(p => p - 1)
    else navigate(`/emergencia/${id}`)
  }

  function completar() {
    logEvento(id, 'completar_protocolo', protocoloId)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className={`${esAyudante ? 'bg-red-700' : color} text-white px-4 pt-4 pb-5`}>
        <div className="max-w-lg mx-auto">
          <button onClick={irAnterior} className="flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white">
            Atrás
          </button>
          {esAyudante && (
            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
              Instrucciones para quien ayuda
            </p>
          )}
          <h1 className="text-lg font-bold leading-tight">{protocolo.nombre}</h1>
          <p className="text-white/70 text-sm mt-1">Paso {pasoActual + 1} de {total}</p>
          <div className="mt-3 bg-white/25 rounded-full h-1.5">
            <div className="bg-white rounded-full h-1.5 transition-all duration-300"
              style={{ width: `${((pasoActual+1)/total)*100}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${esAyudante ? 'bg-red-700' : color}`}>
            Paso {pasoActual + 1}
          </span>
          {tiempoRestante !== null && (
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              tiempoRestante > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
            }`}>
              {tiempoRestante > 0 ? `Tiempo: ${formatTiempo(tiempoRestante)}` : '✓ Listo'}
            </div>
          )}
        </div>

        <div className={`rounded-2xl shadow-sm p-6 flex-1 flex items-center justify-center ${
          esPrefijado ? 'bg-red-50 border-2 border-red-200' : 'bg-white border border-gray-100'
        }`}>
          {esPrefijado ? (
            <div className="w-full">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3 text-center">
                Dile a quien está contigo:
              </p>
              <p className="text-xl font-semibold text-gray-800 text-center leading-relaxed">
                {textoLimpio(paso?.texto)}
              </p>
            </div>
          ) : (
            <p className="text-xl font-semibold text-gray-800 text-center leading-relaxed">
              {paso?.texto}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {protocolo.pasos.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              i === pasoActual ? 'w-6 h-2 bg-gray-700'
              : i < pasoActual ? 'w-2 h-2 bg-gray-400'
              : 'w-2 h-2 bg-gray-200'
            }`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={irAnterior}
            className="col-span-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">
            Anterior
          </button>
          {!esUltimo ? (
            <button onClick={() => setPasoActual(p => p+1)}
              className={`col-span-2 py-4 rounded-xl text-white font-bold text-lg ${esAyudante ? 'bg-red-700' : color} hover:opacity-90`}>
              Siguiente
            </button>
          ) : (
            <button onClick={completar}
              className="col-span-2 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg">
              Completado ✓
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">Fuente: {emergencia.fuente}</p>
        <BotonSOS emergenciaId={id} />
      </main>
    </div>
  )
}
