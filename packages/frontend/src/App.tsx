import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import HomePage from '@/pages/HomePage'
import PetsPage from '@/pages/PetsPage'
import PetDetailPage from '@/pages/PetDetailPage'
import RegisterPage from '@/pages/RegisterPage'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 需要登录的页面 */}
          <Route path="/pets" element={
            <ProtectedRoute>
              <PetsPage />
            </ProtectedRoute>
          } />
          <Route path="/pets/:id" element={
            <ProtectedRoute>
              <PetDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-20 text-center">校园地图 - 开发中</div>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
