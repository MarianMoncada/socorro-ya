import { useNavigate } from 'react-router-dom'

const terminos = [
  { t: 'Anafilaxia',        d: 'Reacción alérgica grave y repentina que afecta todo el cuerpo. Puede causar dificultad para respirar y es potencialmente mortal sin tratamiento inmediato.' },
  { t: 'Consciencia',       d: 'Estado de estar despierto y capaz de responder a estímulos, como preguntas o contacto físico.' },
  { t: 'Convulsión',        d: 'Movimientos involuntarios del cuerpo causados por actividad eléctrica anormal en el cerebro. Puede durar segundos o minutos.' },
  { t: 'Epinefrina',        d: 'También llamada adrenalina. En forma de autoinyector (EpiPen) es el tratamiento principal de la anafilaxia grave.' },
  { t: 'Fractura',          d: 'Ruptura total o parcial de un hueso. Puede ser cerrada (sin herida) o abierta (con hueso visible).' },
  { t: 'Hemorragia',        d: 'Pérdida de sangre, ya sea interna (sin herida visible) o externa. Se clasifica según su abundancia y velocidad.' },
  { t: 'Heimlich',          d: 'Maniobra de primeros auxilios para desatascar la vía aérea en personas atragantadas, usando compresiones abdominales.' },
  { t: 'Inconsciencia',     d: 'Estado en el que la persona no responde a estímulos y no puede despertar por sí sola.' },
  { t: 'RCP',               d: 'Reanimación Cardiopulmonar. Combina compresiones en el pecho y respiraciones de rescate para mantener flujo de sangre y oxígeno al cerebro.' },
  { t: 'Shock',             d: 'Estado de emergencia en el que el cuerpo no recibe suficiente flujo sanguíneo. Síntomas: piel pálida y fría, confusión, pulso débil.' },
  { t: 'Torniquete',        d: 'Banda ajustada en una extremidad para detener una hemorragia grave. Solo lo retira personal médico.' },
  { t: 'Vía aérea',         d: 'El camino del aire desde nariz y boca hasta los pulmones. Mantenerla abierta es la prioridad número uno en emergencias.' },
]

const fuentes = [
  { autor: 'Cruz Roja Internacional',              titulo: 'Primeros Auxilios y RCP 2023',              url: 'https://www.ifrc.org/es' },
  { autor: 'American Heart Association',           titulo: 'Guía de RCP para el público 2023',          url: 'https://www.heart.org' },
  { autor: 'Organización Mundial de la Salud',     titulo: 'Guía de gestión del calor extremo 2023',    url: 'https://www.who.int/es' },
  { autor: 'Organización Panamericana de la Salud',titulo: 'Manual de primeros auxilios 2022',          url: 'https://www.paho.org/es' },
  { autor: 'Secretaría de Salud de México',        titulo: 'Guía de primeros auxilios 2023',            url: 'https://www.gob.mx/salud' },
]

export default function Glosario() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Inicio
          </button>
          <h1 className="text-lg font-bold text-gray-800">Glosario y fuentes</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Términos médicos
          </h2>
          <div className="space-y-2">
            {terminos.map(item => (
              <div key={item.t} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-800 text-sm mb-1">{item.t}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Fuentes bibliográficas
          </h2>
          <div className="space-y-2">
            {fuentes.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-800 text-sm">{f.autor}</p>
                <p className="text-gray-500 text-sm italic mb-2">{f.titulo}</p>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 text-xs hover:underline break-all"
                >
                  {f.url}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm font-semibold mb-1">Aviso importante</p>
          <p className="text-red-700 text-xs leading-relaxed">
            SocorroYA es una herramienta informativa de primeros auxilios básicos.
            No reemplaza la capacitación profesional ni la atención médica especializada.
            Ante cualquier emergencia grave, llama siempre al 911.
          </p>
        </section>

      </main>
    </div>
  )
}
