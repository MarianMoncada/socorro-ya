import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../lib/useAdmin'

const urgenciaColor = { critico:'bg-red-100 text-red-800', alto:'bg-orange-100 text-orange-800', medio:'bg-yellow-100 text-yellow-800' }
const tipoColor     = { 'autoatendible':'bg-green-100 text-green-800', 'necesita-ayuda':'bg-blue-100 text-blue-800', 'solo-911':'bg-red-100 text-red-800' }
const tipoLabel     = { 'autoatendible':'Tú puedes', 'necesita-ayuda':'Con ayuda', 'solo-911':'Solo 911' }

export default function AdminDashboard() {
  const navigate        = useNavigate()
  const { admin, logout } = useAdmin()
  const [emergencias, setEmergencias] = useState([])
  const [stats,       setStats]       = useState({ total:0, consultas:0, completados:0 })
  const [cargando,    setCargando]    = useState(true)
  const [filtro,      setFiltro]      = useState('todas')
  const [busqueda,    setBusqueda]    = useState('')

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [{ data: emgs }, { count: consultas }, { count: completados }] = await Promise.all([
        supabase.from('emergencias').select('*').order('seccion').order('urgencia'),
        supabase.from('eventos_consulta').select('*', { count:'exact', head:true }),
        supabase.from('eventos_consulta').select('*', { count:'exact', head:true }).eq('tipo','completar_protocolo'),
      ])
      setEmergencias(emgs || [])
      setStats({ total: emgs?.length||0, consultas: consultas||0, completados: completados||0 })
    } finally { setCargando(false) }
  }

  async function toggleActivo(id, val) {
    await supabase.from('emergencias').update({ activo: !val }).eq('id', id)
    setEmergencias(prev => prev.map(e => e.id===id ? {...e, activo:!val} : e))
  }

  async function handleLogout() { await logout(); navigate('/admin/login') }

  const filtradas = emergencias
    .filter(e => filtro==='todas' || e.seccion===Number(filtro))
    .filter(e => e.titulo.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Panel Admin</h1>
              <p className="text-gray-500 text-xs mt-0.5">SocorroYA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/estadisticas')}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700
                         text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              📊 Estadísticas
            </button>
            <p className="text-gray-400 text-xs hidden sm:block">{admin?.email}</p>
            <button onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700
                         text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Emergencias',           value:stats.total,       icon:'🗂️' },
            { label:'Consultas totales',     value:stats.consultas,   icon:'📊' },
            { label:'Protocolos completados',value:stats.completados, icon:'✅' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <input type="text" placeholder="Buscar emergencia..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="flex-1 min-w-48 bg-gray-900 border border-gray-700 rounded-lg
                       px-3 py-2 text-white text-sm placeholder-gray-500
                       focus:outline-none focus:border-red-500" />
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2
                       text-white text-sm focus:outline-none focus:border-red-500">
            <option value="todas">Todas las secciones</option>
            <option value="1">Sección 1 — Físicas</option>
            <option value="2">Sección 2 — Signos vitales</option>
          </select>
          <button onClick={() => navigate('/admin/emergencias/nueva')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm
                       font-semibold rounded-lg transition-colors">
            + Nueva emergencia
          </button>
        </div>

        {cargando ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando...</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Emergencia','Urgencia','Tipo','Sec.','Estado',''].map(h => (
                    <th key={h} className={`text-left text-xs font-medium text-gray-400 px-4 py-3 uppercase tracking-wider ${h==='Urgencia'?'hidden sm:table-cell':h==='Tipo'||h==='Sec.'?'hidden md:table-cell':''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtradas.map(e => (
                  <tr key={e.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{e.icono}</span>
                        <div>
                          <p className="text-white text-sm font-medium leading-tight">{e.titulo}</p>
                          <p className="text-gray-500 text-xs">{e.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgenciaColor[e.urgencia]}`}>{e.urgencia}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColor[e.tipo_protocolo]}`}>{tipoLabel[e.tipo_protocolo]}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-xs">S{e.seccion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActivo(e.id, e.activo)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${e.activo?'bg-green-600':'bg-gray-600'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${e.activo?'left-5':'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => navigate(`/admin/emergencias/${e.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-700
                                   text-gray-300 hover:text-white hover:border-gray-500 transition-colors">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtradas.length===0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No se encontraron emergencias</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
