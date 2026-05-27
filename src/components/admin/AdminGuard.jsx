import { useAdmin } from '../../lib/useAdmin'
import { Navigate } from 'react-router-dom'

export default function AdminGuard({ children }) {
  const { admin, cargando } = useAdmin()

  if (cargando) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}
