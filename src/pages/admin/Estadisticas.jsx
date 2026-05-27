import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const ROJO    = '#dc2626'
const NARANJA = '#ea580c'
const VERDE   = '#16a34a'
const AZUL    = '#2563eb'
const COLORES = [ROJO, NARANJA, '#d97706', VERDE, AZUL, '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#c2410c']

const urgenciaColor = { critico: ROJO, alto: NARANJA, medio: '#ca8a04' }

function Kpi({ icono, valor, label, sub, color = 'red' }) {
  const colores = {
    red:    'border-red-800 bg-red-950/40',
    green:  'border-green-800 bg-green-950/40',
    blue:   'border-blue-800 bg-blue-950/40',
    orange: 'border-orange-800 bg-orange-950/40',
  }
  return (
    <div className={`border rounded-xl p-4 ${colores[color]}`}>
      <p className="text-2xl mb-2">{icono}</p>
      <p className="text-3xl font-bold text-white">{valor.toLocaleString()}</p>
      <p className="text-gray-300 text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

const TooltipOscuro = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
      {label && <p className="text-gray-400 text-xs mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }} className="font-medium">
          {p.name}: <span className="text-white">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export default function Estadisticas() {
  const navigate = useNavigate()

  const [kpis,        setKpis]        = useState({ consultas: 0, completados: 0, sos: 0, emergencias: 0 })
  const [porEmg,      setPorEmg]      = useState([])
  const [porTipo,     setPorTipo]     = useState([])
  const [porDia,      setPorDia]      = useState([])
  const [porUrgencia, setPorUrgencia] = useState([])
  const [cargando,    setCargando]    = useState(true)
  const [rango,       setRango]       = useState(30)

  useEffect(() => { cargar() }, [rango])

  async function cargar() {
    setCargando(true)
    const desde = new Date()
    desde.setDate(desde.getDate() - rango)
    const desdeISO = desde.toISOString()

    try {
      const [
        { count: consultas },
        { count: completados },
        { count: sos },
        { count: totalEmg },
        { data: eventos },
        { data: emergencias },
      ] = await Promise.all([
        supabase.from('eventos_consulta').select('*', { count:'exact', head:true }).gte('created_at', desdeISO),
        supabase.from('eventos_consulta').select('*', { count:'exact', head:true }).eq('tipo','completar_protocolo').gte('created_at', desdeISO),
        supabase.from('eventos_consulta').select('*', { count:'exact', head:true }).eq('tipo','llamada_911').gte('created_at', desdeISO),
        supabase.from('emergencias').select('*', { count:'exact', head:true }).eq('activo', true),
        supabase.from('eventos_consulta').select('emergencia_id, tipo, created_at').gte('created_at', desdeISO),
        supabase.from('emergencias').select('id, titulo, urgencia, tipo_protocolo, seccion'),
      ])

      setKpis({ consultas: consultas||0, completados: completados||0, sos: sos||0, emergencias: totalEmg||0 })

      // ── Por emergencia ────────────────────────────────────────
      const emgMap = {}
      emergencias.forEach(e => { emgMap[e.id] = { ...e, total: 0, completados: 0 } })
      eventos.forEach(ev => {
        if (!emgMap[ev.emergencia_id]) return
        emgMap[ev.emergencia_id].total++
        if (ev.tipo === 'completar_protocolo') emgMap[ev.emergencia_id].completados++
      })
      const porEmgArr = Object.values(emgMap)
        .filter(e => e.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(e => ({
          nombre: e.titulo.replace('Creo que ', '').replace('Siento que ', '').replace('Tengo ', ''),
          consultas: e.total,
          completados: e.completados,
          urgencia: e.urgencia,
        }))
      setPorEmg(porEmgArr)

      // ── Por tipo de evento ────────────────────────────────────
      const tipoCount = {}
      eventos.forEach(ev => { tipoCount[ev.tipo] = (tipoCount[ev.tipo]||0)+1 })
      const tipoLabels = {
        vista_emergencia:   'Vista inicial',
        inicio_protocolo:   'Inicio protocolo',
        completar_protocolo:'Completado',
        llamada_911:        'Llamada 911',
      }
      setPorTipo(Object.entries(tipoCount).map(([tipo, val]) => ({
        name: tipoLabels[tipo] || tipo, value: val
      })))

      // ── Por urgencia ──────────────────────────────────────────
      const urgCount = { critico: 0, alto: 0, medio: 0 }
      eventos.forEach(ev => {
        const emg = emgMap[ev.emergencia_id]
        if (emg?.urgencia) urgCount[emg.urgencia]++
      })
      setPorUrgencia(Object.entries(urgCount).map(([u, v]) => ({ name: u, value: v })))

      // ── Por día ───────────────────────────────────────────────
      const diaMap = {}
      eventos.forEach(ev => {
        const dia = ev.created_at.slice(0, 10)
        if (!diaMap[dia]) diaMap[dia] = { dia, consultas: 0, completados: 0 }
        diaMap[dia].consultas++
        if (ev.tipo === 'completar_protocolo') diaMap[dia].completados++
      })
      const diasArr = Object.values(diaMap).sort((a, b) => a.dia.localeCompare(b.dia))
        .map(d => ({ ...d, dia: d.dia.slice(5) }))
      setPorDia(diasArr)

    } finally {
      setCargando(false)
    }
  }

  const tasaComplecion = kpis.consultas > 0
    ? Math.round((kpis.completados / kpis.consultas) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white text-sm transition-colors">← Panel</button>
            <h1 className="text-white font-bold text-lg">Estadísticas</h1>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRango(d)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  rango === d
                    ? 'bg-red-600 text-white'
                    : 'border border-gray-700 text-gray-400 hover:text-white'
                }`}>
                {d}d
              </button>
            ))}
            <button onClick={cargar}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700
                         text-gray-400 hover:text-white transition-colors ml-1">
              ↻ Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {cargando && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
          </div>
        )}

        {!cargando && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Kpi icono="📊" valor={kpis.consultas}   label="Consultas totales"     sub={`Últimos ${rango} días`}        color="red"    />
              <Kpi icono="✅" valor={kpis.completados} label="Protocolos completados" sub={`${tasaComplecion}% de tasa`}   color="green"  />
              <Kpi icono="🆘" valor={kpis.sos}         label="Llamadas al 911"        sub="Eventos registrados"            color="orange" />
              <Kpi icono="🗂️" valor={kpis.emergencias} label="Emergencias activas"    sub="En la app"                      color="blue"   />
            </div>

            {/* Línea de tiempo */}
            {porDia.length > 1 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Consultas por día</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={porDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="dia" tick={{ fill:'#9ca3af', fontSize:11 }} />
                    <YAxis tick={{ fill:'#9ca3af', fontSize:11 }} />
                    <Tooltip content={<TooltipOscuro />} />
                    <Legend wrapperStyle={{ color:'#9ca3af', fontSize:12 }} />
                    <Line type="monotone" dataKey="consultas"   name="Consultas"   stroke={ROJO}  strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="completados" name="Completados" stroke={VERDE} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Emergencias más consultadas */}
            {porEmg.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Emergencias más consultadas (top 10)</h2>
                <ResponsiveContainer width="100%" height={Math.max(220, porEmg.length * 36)}>
                  <BarChart data={porEmg} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" tick={{ fill:'#9ca3af', fontSize:11 }} />
                    <YAxis type="category" dataKey="nombre" width={160} tick={{ fill:'#d1d5db', fontSize:11 }} />
                    <Tooltip content={<TooltipOscuro />} />
                    <Legend wrapperStyle={{ color:'#9ca3af', fontSize:12 }} />
                    <Bar dataKey="consultas"   name="Consultas"   fill={ROJO}  radius={[0,4,4,0]} />
                    <Bar dataKey="completados" name="Completados" fill={VERDE} radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Por tipo de evento */}
              {porTipo.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-4">Distribución por tipo de evento</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={porTipo} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) =>
                          `${name} ${(percent*100).toFixed(0)}%`
                        } labelLine={false}>
                        {porTipo.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                      </Pie>
                      <Tooltip content={<TooltipOscuro />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Por urgencia */}
              {porUrgencia.some(u => u.value > 0) && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-4">Consultas por nivel de urgencia</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={porUrgencia.filter(u => u.value > 0)} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                        labelLine={false}>
                        {porUrgencia.filter(u => u.value > 0).map((u, i) => (
                          <Cell key={i} fill={urgenciaColor[u.name] || COLORES[i]} />
                        ))}
                      </Pie>
                      <Tooltip content={<TooltipOscuro />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-3">
                    {porUrgencia.filter(u => u.value > 0).map(u => (
                      <div key={u.name} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ background: urgenciaColor[u.name] }} />
                        <span className="text-gray-400 text-xs capitalize">{u.name}: <span className="text-white">{u.value}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sin datos */}
            {kpis.consultas === 0 && (
              <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-gray-400 font-medium">No hay datos en los últimos {rango} días</p>
                <p className="text-gray-600 text-sm mt-1">Usa la app pública para generar eventos de estadísticas</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
