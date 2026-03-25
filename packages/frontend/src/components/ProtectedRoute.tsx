import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 检查是否登录（从 localStorage 获取 token）
  const token = localStorage.getItem('token')

  if (!token) {
    // 未登录，跳转到登录页
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
