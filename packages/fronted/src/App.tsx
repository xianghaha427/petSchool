import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import HomePage from '@/pages/HomePage'
import PetsPage from '@/pages/PetsPage'
import PetDetailPage from '@/pages/PetDetailPage'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />
          <Route path="/register" element={<div className="container mx-auto px-4 py-20 text-center">宠物登记页面 - 开发中</div>} />
          <Route path="/map" element={<div className="container mx-auto px-4 py-20 text-center">校园地图 - 开发中</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
