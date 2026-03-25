import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '@/services/userService'
import { TIFFY_BLUE, TIFFY_BLUE_DARK } from '@/styles/theme'

interface LoginForm {
  userName: string
  password: string
}

interface RegisterForm {
  userName: string
  password: string
  email: string
  phone: string
}

const LoginPage = () => {
  const navigate = useNavigate()
  const [loginForm, setLoginForm] = useState<LoginForm>({
    userName: '',
    password: ''
  })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    userName: '',
    password: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRegister, setShowRegister] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await userService.login(loginForm)
      // 保存 token 和用户信息
      localStorage.setItem('token', res.token)
      localStorage.setItem('userId', String(res.id))
      localStorage.setItem('username', res.userName)

      // 跳转到首页
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 校验手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(registerForm.phone)) {
      setError('手机号格式不正确')
      return
    }

    // 校验邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.email)) {
      setError('邮箱格式不正确')
      return
    }

    try {
      await userService.register(registerForm)
      alert('注册成功，请登录')
      setShowRegister(false)
      setRegisterForm({ userName: '', password: '', email: '', phone: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败')
    }
  }

  // 浅紫色
  const LIGHT_PURPLE = '#B89FE8'

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: `linear-gradient(135deg, #E0F2F5 0%, #B8E6ED 100%)`
    }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: TIFFY_BLUE_DARK }}>
            PetSchool
          </h1>
          <p className="text-gray-500 mt-2">
            {showRegister ? '用户注册' : '宠物学校管理系统 - 登录'}
          </p>
        </div>

        {showRegister ? (
          // 注册表单
          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={registerForm.userName}
                onChange={(e) => setRegisterForm({ ...registerForm, userName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
                style={{ '--tw-ring-color': LIGHT_PURPLE } as React.CSSProperties}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
                style={{ '--tw-ring-color': LIGHT_PURPLE } as React.CSSProperties}
                placeholder="请输入密码"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
                style={{ '--tw-ring-color': LIGHT_PURPLE } as React.CSSProperties}
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
                style={{ '--tw-ring-color': LIGHT_PURPLE } as React.CSSProperties}
                placeholder="请输入手机号"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition transform hover:scale-105"
              style={{
                backgroundColor: LIGHT_PURPLE
              }}
            >
              注册
            </button>

            <button
              type="button"
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => {
                setShowRegister(false)
                setError('')
              }}
            >
              返回登录
            </button>
          </form>
        ) : (
          // 登录表单
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={loginForm.userName}
                onChange={(e) => setLoginForm({ ...loginForm, userName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
                style={{ '--tw-ring-color': TIFFY_BLUE } as React.CSSProperties}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
                style={{ '--tw-ring-color': TIFFY_BLUE } as React.CSSProperties}
                placeholder="请输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition transform hover:scale-105"
              style={{
                backgroundColor: loading ? TIFFY_BLUE_DARK : TIFFY_BLUE,
                opacity: loading ? 0.8 : 1
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition transform hover:scale-105"
              style={{
                backgroundColor: LIGHT_PURPLE
              }}
              onClick={() => {
                setShowRegister(true)
                setError('')
              }}
            >
              注册
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginPage
