import { supabase } from './supabase'

// Cache en memoria para no re-pedir la lista completa en cada navegación
let _cache = null

// Lista completa para la pantalla de inicio (solo campos de display)
export async function getEmergencias() {
  if (_cache) return _cache
  const { data, error } = await supabase
    .from('emergencias')
    .select('id, titulo, urgencia, llamar_911, tipo_protocolo, seccion, icono')
    .eq('activo', true)
    .order('seccion')
  if (error) throw error
  _cache = data
  return data
}

// Una emergencia completa por id (preguntas + protocolos + todo)
export async function getEmergencia(id) {
  const { data, error } = await supabase
    .from('emergencias')
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()
  if (error) throw error
  return data
}

// Registra un evento de uso (no bloquea la UI)
export function logEvento(emergenciaId, tipo, protocoloId = null) {
  supabase.from('eventos_consulta').insert({
    emergencia_id: emergenciaId,
    tipo,
    protocolo_id: protocoloId
  }).then(() => {}) // silencioso, no necesitamos esperar
}
