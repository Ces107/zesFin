import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { setTokenFromCallback } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setTokenFromCallback(token).then(() => navigate('/', { replace: true }))
    } else {
      navigate('/login', { replace: true })
    }
  }, [searchParams, setTokenFromCallback, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
