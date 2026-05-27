import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const tipoEstilo = {
  info:    { contenedor: 'bg-blue-50 border-blue-200',   texto: 'text-blue-800',   icono: 'ℹ️'  },
  alerta:  { contenedor: 'bg-yellow-50 border-yellow-200', texto: 'text-yellow-800', icono: '⚠️'  },
  urgente: { contenedor: 'bg-red-50 border-red-300',     texto: 'text-red-800',    icono: '🚨'  },
}

export default function BannerNotificaciones() {
  const [notifs,   setNotifs]   = useState([])
  const [cerradas, setCerradas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('socorroya_notifs_cerradas') || '[]') } catch { return [] }
  })

  useEffect(() => {
    supabase
      .from('notificaciones')
      .select('id, titulo, mensaje, tipo')
      .eq('activa', true)
      .or('fecha_fin.is.null,fecha_fin.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifs(data || []))
  }, [])

  function cerrar(id) {
    const nuevas = [...cerradas, id]
    setCerradas(nuevas)
    localStorage.setItem('socorroya_notifs_cerradas', JSON.stringify(nuevas))
  }

  const visibles = notifs.filter(n => !cerradas.includes(n.id))
  if (visibles.length === 0) return null

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 space-y-2">
      {visibles.map(n => {
        const est = tipoEstilo[n.tipo] || tipoEstilo.info
        return (
          <div key={n.id} className={`border rounded-xl p-3 flex gap-3 items-start ${est.contenedor}`}>
            <span className="text-lg flex-shrink-0 mt-0.5">{est.icono}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${est.texto}`}>{n.titulo}</p>
              <p className={`text-xs mt-0.5 leading-relaxed ${est.texto} opacity-80`}>{n.mensaje}</p>
            </div>
            <button onClick={() => cerrar(n.id)}
              className={`flex-shrink-0 text-lg leading-none ${est.texto} opacity-60 hover:opacity-100`}>
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
