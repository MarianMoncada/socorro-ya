import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ContactoEmergencia() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', telefono: '', nombre_usuario: '' })
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('socorroya_contacto'))
      if (c) setForm(c)
    } catch {}
  }, [])

  function guardar() {
    if (!form.nombre || !form.telefono) return
    localStorage.setItem('socorroya_contacto', JSON.stringify(form))
    setGuardado(true)
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm">← Inicio</button>
          <h1 className="text-lg font-bold text-gray-800">Contacto de emergencia</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm font-semibold mb-1">¿Para qué sirve esto?</p>
          <p className="text-red-700 text-xs leading-relaxed">
            Cuando actives el SOS, además de llamar al 911 se enviará un mensaje de WhatsApp a esta persona con tu ubicación exacta.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
            <input
              type="text" placeholder="Ej: María García"
              value={form.nombre_usuario}
              onChange={e => setForm(p => ({...p, nombre_usuario: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del contacto</label>
            <input
              type="text" placeholder="Ej: Juan (mi esposo)"
              value={form.nombre}
              onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (con código de país)</label>
            <input
              type="tel" placeholder="Ej: 5215512345678"
              value={form.telefono}
              onChange={e => setForm(p => ({...p, telefono: e.target.value.replace(/\D/g,'')}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
            <p className="text-xs text-gray-400 mt-1">México: 521 + 10 dígitos. Sin espacios ni guiones.</p>
          </div>
        </div>

        <button
          onClick={guardar}
          disabled={!form.nombre || !form.telefono}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
            guardado ? 'bg-green-600 text-white' :
            (!form.nombre || !form.telefono) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
            'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {guardado ? '✓ Contacto guardado' : 'Guardar contacto'}
        </button>
      </main>
    </div>
  )
}
