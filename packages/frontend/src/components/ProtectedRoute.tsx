import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 检查是否登录（从 localStorage 获取 token）
    const token = localStorage.getItem('token')
    console.log('ProtectedRoute检查token:', !!token)
    if (token) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setChecked(true)
  }, [])

  // 如果还没检查过，不渲染任何内容（避免闪烁）
  if (!checked) {
    return null
  }

  if (!isAuthenticated) {
    // 未登录，跳转到登录页
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
