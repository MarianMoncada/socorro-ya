import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAdmin() {
  const [admin,    setAdmin]    = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAdmin(data.session?.user ?? null)
      setCargando(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setAdmin(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { admin, cargando, login, logout }
}
