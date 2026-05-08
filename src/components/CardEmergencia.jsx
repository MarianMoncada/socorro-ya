import { useNavigate } from 'react-router-dom'

const estilos = {
  critico: {
    contenedor: 'bg-red-50 border-red-300 hover:border-red-500',
    icono:      'bg-red-100',
    titulo:     'text-red-900',
    badge:      'bg-red-200 text-red-800',
    badgeTxt:   'Crítico',
  },
  alto: {
    contenedor: 'bg-orange-50 border-orange-300 hover:border-orange-500',
    icono:      'bg-orange-100',
    titulo:     'text-orange-900',
    badge:      'bg-orange-200 text-orange-800',
    badgeTxt:   'Alto',
  },
  medio: {
    contenedor: 'bg-yellow-50 border-yellow-300 hover:border-yellow-500',
    icono:      'bg-yellow-100',
    titulo:     'text-yellow-900',
    badge:      'bg-yellow-200 text-yellow-800',
    badgeTxt:   'Medio',
  },
}

export default function CardEmergencia({ id, titulo, icono, urgencia, disponible }) {
  const navigate = useNavigate()
  const e = estilos[urgencia] || estilos.medio

  return (
    <button
      onClick={() => disponible && navigate(`/emergencia/${id}`)}
      disabled={!disponible}
      className={[
        'w-full p-4 rounded-2xl border-2 transition-all duration-200',
        'flex flex-col items-center gap-3 text-center',
        disponible
          ? `${e.contenedor} hover:shadow-lg hover:-translate-y-1 cursor-pointer`
          : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed',
      ].join(' ')}
    >
      <div className={[
        'w-14 h-14 rounded-full flex items-center justify-center text-3xl',
        disponible ? e.icono : 'bg-gray-100',
      ].join(' ')}>
        {icono}
      </div>

      <div>
        <p className={[
          'font-semibold text-sm leading-tight',
          disponible ? e.titulo : 'text-gray-500',
        ].join(' ')}>
          {titulo}
        </p>

        {disponible ? (
          <span className={`text-xs px-2 py-0.5 rounded-full ${e.badge} mt-1 inline-block font-medium`}>
            {e.badgeTxt}
          </span>
        ) : (
          <span className="text-xs text-gray-400 mt-1 inline-block">
            Próximamente
          </span>
        )}
      </div>
    </button>
  )
}
