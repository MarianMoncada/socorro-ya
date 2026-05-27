import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const URGENCIAS     = ['critico', 'alto', 'medio']
const TIPOS         = ['autoatendible', 'necesita-ayuda', 'solo-911']
const TIPOS_LABEL   = { 'autoatendible':'Tú puedes', 'necesita-ayuda':'Con ayuda', 'solo-911':'Solo 911' }
const SECCIONES     = [{ v: 1, l: 'Sección 1 — Emergencias físicas' }, { v: 2, l: 'Sección 2 — Signos vitales' }]

function Campo({ label, children, nota }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {children}
      {nota && <p className="text-xs text-gray-500 mt-1">{nota}</p>}
    </div>
  )
}

function Input({ value, onChange, ...props }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} {...props}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
                 text-white text-sm focus:outline-none focus:border-red-500 transition-colors" />
  )
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
                 text-white text-sm focus:outline-none focus:border-red-500">
      {children}
    </select>
  )
}

function Textarea({ value, onChange, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
                 text-white text-sm focus:outline-none focus:border-red-500 resize-none" />
  )
}

// ── Editor de un protocolo ────────────────────────────────────
function EditorProtocolo({ clave, protocolo, onChange, onEliminar }) {
  function actualizarPaso(i, campo, valor) {
    const pasos = [...protocolo.pasos]
    pasos[i] = { ...pasos[i], [campo]: campo === 'timer' ? (valor === '' ? null : Number(valor)) : valor }
    onChange({ ...protocolo, pasos })
  }

  function agregarPaso() {
    onChange({ ...protocolo, pasos: [...protocolo.pasos, { n: protocolo.pasos.length + 1, texto: '', timer: null }] })
  }

  function eliminarPaso(i) {
    const pasos = protocolo.pasos.filter((_, idx) => idx !== i)
      .map((p, idx) => ({ ...p, n: idx + 1 }))
    onChange({ ...protocolo, pasos })
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">{clave}</span>
          {protocolo.pantalla_ayudante && (
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Para ayudante</span>
          )}
        </div>
        <button onClick={onEliminar}
          className="text-xs text-red-400 hover:text-red-300 transition-colors">
          Eliminar protocolo
        </button>
      </div>

      <Campo label="Nombre del protocolo">
        <Input value={protocolo.nombre || ''} onChange={v => onChange({ ...protocolo, nombre: v })}
          placeholder="ej: Maniobra de Heimlich" />
      </Campo>

      {protocolo.pantalla_ayudante && (
        <Campo label="Mensaje para el ayudante" nota="Aparece en la pantalla roja que se muestra al transeúnte">
          <Input value={protocolo.mensaje_ayudante || ''}
            onChange={v => onChange({ ...protocolo, mensaje_ayudante: v })}
            placeholder="Esta persona necesita que le hagas la maniobra de Heimlich" />
        </Campo>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-300">Pasos ({protocolo.pasos.length})</p>
          <button onClick={agregarPaso}
            className="text-xs text-red-400 hover:text-red-300 transition-colors">
            + Agregar paso
          </button>
        </div>

        <div className="space-y-3">
          {protocolo.pasos.map((paso, i) => (
            <div key={i} className="bg-gray-750 border border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Paso {i + 1}</span>
                {protocolo.pasos.length > 1 && (
                  <button onClick={() => eliminarPaso(i)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                    Eliminar
                  </button>
                )}
              </div>
              <Textarea value={paso.texto || ''} onChange={v => actualizarPaso(i, 'texto', v)} rows={2} />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 whitespace-nowrap">Timer (segundos)</label>
                <input
                  type="number" min="0"
                  value={paso.timer ?? ''}
                  onChange={e => actualizarPaso(i, 'timer', e.target.value)}
                  placeholder="Sin timer"
                  className="w-28 bg-gray-700 border border-gray-600 rounded px-2 py-1
                             text-white text-xs focus:outline-none focus:border-red-500" />
                {paso.timer && (
                  <span className="text-xs text-gray-500">
                    = {Math.floor(paso.timer/60) > 0 ? `${Math.floor(paso.timer/60)} min ` : ''}{paso.timer%60 > 0 ? `${paso.timer%60} seg` : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Editor de preguntas ───────────────────────────────────────
function EditorPreguntas({ preguntas, protocolosKeys, onChange }) {
  function actualizarPregunta(i, campo, valor) {
    const arr = [...preguntas]
    arr[i] = { ...arr[i], [campo]: valor }
    onChange(arr)
  }

  function actualizarOpcion(pi, oi, campo, valor) {
    const arr = [...preguntas]
    const opts = [...arr[pi].opciones]
    opts[oi] = { ...opts[oi], [campo]: valor }
    arr[pi] = { ...arr[pi], opciones: opts }
    onChange(arr)
  }

  function agregarOpcion(pi) {
    const arr = [...preguntas]
    arr[pi].opciones = [...arr[pi].opciones, { respuesta: '', siguiente: '' }]
    onChange(arr)
  }

  function eliminarOpcion(pi, oi) {
    const arr = [...preguntas]
    arr[pi].opciones = arr[pi].opciones.filter((_, i) => i !== oi)
    onChange(arr)
  }

  function agregarPregunta() {
    const id = `p${preguntas.length + 1}`
    onChange([...preguntas, { id, texto: '', opciones: [{ respuesta: '', siguiente: '' }] }])
  }

  function eliminarPregunta(i) {
    onChange(preguntas.filter((_, idx) => idx !== i))
  }

  const destinos = [
    ...preguntas.map(p => ({ v: p.id, l: `→ Pregunta: ${p.id}` })),
    ...protocolosKeys.map(k => ({ v: k, l: `→ Protocolo: ${k}` }))
  ]

  return (
    <div className="space-y-4">
      {preguntas.map((preg, pi) => (
        <div key={pi} className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">{preg.id}</span>
            {preguntas.length > 1 && (
              <button onClick={() => eliminarPregunta(pi)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Eliminar pregunta
              </button>
            )}
          </div>

          <Campo label="Texto de la pregunta">
            <Textarea value={preg.texto} onChange={v => actualizarPregunta(pi, 'texto', v)} rows={2} />
          </Campo>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400">Opciones de respuesta</p>
              <button onClick={() => agregarOpcion(pi)}
                className="text-xs text-red-400 hover:text-red-300">+ Opción</button>
            </div>
            <div className="space-y-2">
              {preg.opciones.map((op, oi) => (
                <div key={oi} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <input value={op.respuesta}
                      onChange={e => actualizarOpcion(pi, oi, 'respuesta', e.target.value)}
                      placeholder="Texto de la respuesta"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5
                                 text-white text-xs focus:outline-none focus:border-red-500" />
                    <select value={op.siguiente}
                      onChange={e => actualizarOpcion(pi, oi, 'siguiente', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5
                                 text-white text-xs focus:outline-none focus:border-red-500">
                      <option value="">— Selecciona destino —</option>
                      {destinos.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
                    </select>
                  </div>
                  {preg.opciones.length > 1 && (
                    <button onClick={() => eliminarOpcion(pi, oi)}
                      className="text-gray-500 hover:text-red-400 text-lg leading-none mt-1">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button onClick={agregarPregunta}
        className="w-full py-2.5 border border-dashed border-gray-600 rounded-xl
                   text-gray-400 hover:text-white hover:border-gray-400 text-sm transition-colors">
        + Agregar pregunta
      </button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function EditarEmergencia() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const esNueva   = id === 'nueva'

  const [form,       setForm]       = useState(null)
  const [cargando,   setCargando]   = useState(true)
  const [guardando,  setGuardando]  = useState(false)
  const [error,      setError]      = useState(null)
  const [guardado,   setGuardado]   = useState(false)
  const [tabActiva,  setTabActiva]  = useState('general')

  useEffect(() => {
    if (esNueva) {
      setForm({
        id: '', titulo: '', urgencia: 'alto', llamar_911: false,
        tipo_protocolo: 'autoatendible', seccion: 1, icono: '🚨',
        activo: true, fuente: '',
        preguntas: [{ id: 'p1', texto: '', opciones: [{ respuesta: '', siguiente: '' }] }],
        protocolos: { protocolo_1: { nombre: '', pasos: [{ n: 1, texto: '', timer: null }] } },
        campos_extra: {}
      })
      setCargando(false)
      return
    }
    supabase.from('emergencias').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setForm(data)
      })
      .finally(() => setCargando(false))
  }, [id])

  async function guardar() {
    setGuardando(true)
    setError(null)
    try {
      const payload = {
        titulo:         form.titulo,
        urgencia:       form.urgencia,
        llamar_911:     form.llamar_911,
        tipo_protocolo: form.tipo_protocolo,
        seccion:        form.seccion,
        icono:          form.icono,
        activo:         form.activo,
        fuente:         form.fuente,
        preguntas:      form.preguntas,
        protocolos:     form.protocolos,
        campos_extra:   form.campos_extra || {},
      }
      if (esNueva) {
        if (!form.id) throw new Error('El campo ID es obligatorio')
        const { error } = await supabase.from('emergencias').insert({ ...payload, id: form.id })
        if (error) throw error
        navigate(`/admin/emergencias/${form.id}`)
      } else {
        const { error } = await supabase.from('emergencias').update(payload).eq('id', id)
        if (error) throw error
      }
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar "${form.titulo}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('emergencias').delete().eq('id', id)
    navigate('/admin')
  }

  function addProtocolo() {
    const clave = `protocolo_${Object.keys(form.protocolos).length + 1}`
    setForm(f => ({ ...f, protocolos: { ...f.protocolos, [clave]: { nombre: '', pasos: [{ n: 1, texto: '', timer: null }] } } }))
  }

  function updateProtocolo(clave, valor) {
    setForm(f => ({ ...f, protocolos: { ...f.protocolos, [clave]: valor } }))
  }

  function removeProtocolo(clave) {
    if (Object.keys(form.protocolos).length <= 1) return
    const p = { ...form.protocolos }
    delete p[clave]
    setForm(f => ({ ...f, protocolos: p }))
  }

  if (cargando) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const TABS = [
    { id: 'general',    label: 'General' },
    { id: 'preguntas',  label: `Preguntas (${form.preguntas?.length || 0})` },
    { id: 'protocolos', label: `Protocolos (${Object.keys(form.protocolos || {}).length})` },
  ]

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white text-sm transition-colors">← Volver</button>
            <h1 className="text-white font-bold truncate max-w-xs">
              {esNueva ? 'Nueva emergencia' : (form.titulo || id)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!esNueva && (
              <button onClick={eliminar}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-800
                           text-red-400 hover:text-red-300 hover:border-red-600 transition-colors">
                Eliminar
              </button>
            )}
            <button onClick={guardar} disabled={guardando}
              className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                guardado ? 'bg-green-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
              }`}>
              {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setTabActiva(tab.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tabActiva === tab.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Tab: General */}
        {tabActiva === 'general' && (
          <div className="space-y-4">
            {esNueva && (
              <Campo label="ID único" nota="Solo minúsculas y guiones. Ej: dolor-espalda. No se puede cambiar después.">
                <Input value={form.id} onChange={v => setForm(f => ({ ...f, id: v.toLowerCase().replace(/\s+/g, '-') }))}
                  placeholder="ej: dolor-espalda" />
              </Campo>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Ícono (emoji)">
                <Input value={form.icono} onChange={v => setForm(f => ({ ...f, icono: v }))} placeholder="🚨" />
              </Campo>
              <Campo label="Sección">
                <Select value={form.seccion} onChange={v => setForm(f => ({ ...f, seccion: Number(v) }))}>
                  {SECCIONES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                </Select>
              </Campo>
            </div>
            <Campo label="Título (en primera persona)">
              <Input value={form.titulo} onChange={v => setForm(f => ({ ...f, titulo: v }))}
                placeholder="ej: Creo que me estoy atragantando" />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nivel de urgencia">
                <Select value={form.urgencia} onChange={v => setForm(f => ({ ...f, urgencia: v }))}>
                  {URGENCIAS.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
              </Campo>
              <Campo label="Tipo de protocolo">
                <Select value={form.tipo_protocolo} onChange={v => setForm(f => ({ ...f, tipo_protocolo: v }))}>
                  {TIPOS.map(t => <option key={t} value={t}>{TIPOS_LABEL[t]}</option>)}
                </Select>
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Llamar al 911">
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setForm(f => ({ ...f, llamar_911: !f.llamar_911 }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.llamar_911 ? 'bg-green-600' : 'bg-gray-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.llamar_911 ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-300">{form.llamar_911 ? 'Sí — botón SOS siempre visible' : 'No'}</span>
                </div>
              </Campo>
              <Campo label="Activa en la app">
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.activo ? 'bg-green-600' : 'bg-gray-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.activo ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-300">{form.activo ? 'Visible' : 'Oculta'}</span>
                </div>
              </Campo>
            </div>
            <Campo label="Fuente bibliográfica">
              <Input value={form.fuente || ''} onChange={v => setForm(f => ({ ...f, fuente: v }))}
                placeholder="ej: Cruz Roja Internacional, Primeros Auxilios 2023" />
            </Campo>
          </div>
        )}

        {/* Tab: Preguntas */}
        {tabActiva === 'preguntas' && (
          <EditorPreguntas
            preguntas={form.preguntas || []}
            protocolosKeys={Object.keys(form.protocolos || {})}
            onChange={v => setForm(f => ({ ...f, preguntas: v }))}
          />
        )}

        {/* Tab: Protocolos */}
        {tabActiva === 'protocolos' && (
          <div className="space-y-4">
            {Object.entries(form.protocolos || {}).map(([clave, prot]) => (
              <EditorProtocolo key={clave} clave={clave} protocolo={prot}
                onChange={v => updateProtocolo(clave, v)}
                onEliminar={() => removeProtocolo(clave)} />
            ))}
            <button onClick={addProtocolo}
              className="w-full py-3 border border-dashed border-gray-600 rounded-xl
                         text-gray-400 hover:text-white hover:border-gray-400 text-sm transition-colors">
              + Agregar protocolo
            </button>
          </div>
        )}

        {/* Guardar abajo también */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <button onClick={guardar} disabled={guardando}
            className={`w-full py-3 rounded-xl font-bold text-base transition-colors ${
              guardado ? 'bg-green-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
            }`}>
            {guardado ? '✓ Cambios guardados' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </main>
    </div>
  )
}
