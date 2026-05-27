import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TIPOS = ['info', 'alerta', 'urgente']
const tipoEstilo = {
  info:    { badge: 'bg-blue-100 text-blue-800',   icono: 'ℹ️'  },
  alerta:  { badge: 'bg-yellow-100 text-yellow-800', icono: '⚠️'  },
  urgente: { badge: 'bg-red-100 text-red-800',      icono: '🚨'  },
}

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">{titulo}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

function Campo({ label, nota, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {children}
      {nota && <p className="text-xs text-gray-500 mt-1">{nota}</p>}
    </div>
  )
}

const inputCls = "w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"

export default function Notificaciones() {
  const navigate = useNavigate()
  const [lista,     setLista]     = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [modal,     setModal]     = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form,      setForm]      = useState({
    titulo: '', mensaje: '', tipo: 'info', fecha_fin: ''
  })

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false })
    setLista(data || [])
    setCargando(false)
  }

  async function guardar() {
    if (!form.titulo || !form.mensaje) return
    setGuardando(true)
    const payload = {
      titulo:      form.titulo,
      mensaje:     form.mensaje,
      tipo:        form.tipo,
      activa:      true,
      fecha_inicio: new Date().toISOString(),
      fecha_fin:   form.fecha_fin || null,
    }
    await supabase.from('notificaciones').insert(payload)
    setForm({ titulo:'', mensaje:'', tipo:'info', fecha_fin:'' })
    setModal(false)
    setGuardando(false)
    cargar()
  }

  async function toggleActiva(id, val) {
    await supabase.from('notificaciones').update({ activa: !val }).eq('id', id)
    setLista(prev => prev.map(n => n.id===id ? {...n, activa:!val} : n))
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta notificación?')) return
    await supabase.from('notificaciones').delete().eq('id', id)
    setLista(prev => prev.filter(n => n.id !== id))
  }

  const activas   = lista.filter(n => n.activa)
  const inactivas = lista.filter(n => !n.activa)

  return (
    <div className="min-h-screen bg-gray-950">

      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white text-sm">← Panel</button>
            <h1 className="text-white font-bold text-lg">Notificaciones</h1>
          </div>
          <button onClick={() => setModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Nueva notificación
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icono:'🔔', val: activas.length,                         label:'Activas ahora' },
            { icono:'📭', val: inactivas.length,                       label:'Inactivas' },
            { icono:'🚨', val: lista.filter(n=>n.tipo==='urgente').length, label:'Urgentes totales' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{s.icono}</p>
              <p className="text-2xl font-bold text-white">{s.val}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {cargando ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-400 font-medium">No hay notificaciones todavía</p>
            <button onClick={() => setModal(true)} className="text-red-400 text-sm mt-2 hover:text-red-300">
              Crear la primera
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map(n => {
              const est = tipoEstilo[n.tipo] || tipoEstilo.info
              const vencida = n.fecha_fin && new Date(n.fecha_fin) < new Date()
              return (
                <div key={n.id} className={`bg-gray-900 border rounded-xl p-4 transition-colors ${
                  n.activa && !vencida ? 'border-gray-700' : 'border-gray-800 opacity-60'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0">{est.icono}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-white font-semibold text-sm">{n.titulo}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${est.badge}`}>{n.tipo}</span>
                          {vencida && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Vencida</span>}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{n.mensaje}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <p className="text-gray-600 text-xs">
                            Creada: {new Date(n.created_at).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })}
                          </p>
                          {n.fecha_fin && (
                            <p className="text-gray-600 text-xs">
                              Expira: {new Date(n.fecha_fin).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleActiva(n.id, n.activa)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${n.activa && !vencida ? 'bg-green-600' : 'bg-gray-600'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${n.activa && !vencida ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <button onClick={() => eliminar(n.id)}
                        className="text-gray-600 hover:text-red-400 text-sm transition-colors">
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {modal && (
        <Modal titulo="Nueva notificación" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Campo label="Tipo de notificación">
              <div className="flex gap-2">
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setForm(f => ({...f, tipo:t}))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                      form.tipo === t
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-gray-600 text-gray-400 hover:text-white'
                    }`}>
                    {tipoEstilo[t].icono} {t}
                  </button>
                ))}
              </div>
            </Campo>

            <Campo label="Título">
              <input value={form.titulo} onChange={e => setForm(f=>({...f, titulo:e.target.value}))}
                placeholder="ej: Protocolo de RCP actualizado" className={inputCls} />
            </Campo>

            <Campo label="Mensaje" nota="El usuario verá este texto en la pantalla de inicio de la app">
              <textarea value={form.mensaje} onChange={e => setForm(f=>({...f, mensaje:e.target.value}))}
                rows={3} placeholder="Describe el contenido de la alerta..."
                className={`${inputCls} resize-none`} />
            </Campo>

            <Campo label="Fecha de expiración (opcional)" nota="Si no la pones, la notificación no vence">
              <input type="date" value={form.fecha_fin}
                onChange={e => setForm(f=>({...f, fecha_fin:e.target.value}))}
                min={new Date().toISOString().slice(0,10)} className={inputCls} />
            </Campo>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando || !form.titulo || !form.mensaje}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {guardando ? 'Publicando...' : 'Publicar notificación'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
