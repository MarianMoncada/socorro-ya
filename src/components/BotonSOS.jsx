import { useState } from 'react'

export default function BotonSOS({ emergenciaId }) {
  const [confirmando, setConfirmando] = useState(false)

  function obtenerContacto() {
    try { return JSON.parse(localStorage.getItem('socorroya_contacto')) } catch { return null }
  }

  function enviarAlerta(lat, lng) {
    const contacto = obtenerContacto()
    if (!contacto?.telefono) return
    const ubicacion = lat ? `https://maps.google.com/?q=${lat},${lng}` : 'Ubicación no disponible'
    const mensaje = encodeURIComponent(
      `🚨 EMERGENCIA — ${contacto.nombre_usuario || 'Alguien'} necesita ayuda ahora.\nEmergencia: ${emergenciaId || 'desconocida'}\nUbicación: ${ubicacion}`
    )
    window.open(`https://wa.me/${contacto.telefono}?text=${mensaje}`, '_blank')
  }

  function activarSOS() {
    if (!confirmando) { setConfirmando(true); setTimeout(() => setConfirmando(false), 3000); return }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => enviarAlerta(pos.coords.latitude, pos.coords.longitude),
        ()  => enviarAlerta(null, null)
      )
    } else { enviarAlerta(null, null) }
    window.location.href = 'tel:911'
  }

  return (
    <button
      onClick={activarSOS}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-150 ${
        confirmando
          ? 'bg-red-700 text-white scale-95 ring-4 ring-red-400'
          : 'bg-red-600 hover:bg-red-700 text-white'
      }`}
    >
      {confirmando ? '⚠️ Toca de nuevo para llamar al 911' : '🆘 SOS — Llamar al 911'}
    </button>
  )
}
