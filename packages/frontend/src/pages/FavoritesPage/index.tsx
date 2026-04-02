import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { petService, Pet } from '@/services/petService';
import { PetCard } from '@/components/petCard/PetCard';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await petService.getFavorites();
      setPets(data);
    } catch (error) {
      console.error('获取收藏失败', error);
    }
    setLoading(false);
  };

  const handleUnfavorite = async (petId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要取消收藏吗？')) {
      try {
        await petService.removeFavorite(petId);
        setPets(pets.filter((p) => p.id !== petId));
      } catch (error) {
        alert('取消收藏失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">我的收藏</h1>

        {pets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-xl text-gray-600 mb-6">还没有收藏任何萌宠</h2>
            <button
              onClick={() => navigate('/pets')}
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              去逛逛
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <PetCard pet={pet} />
                <button
                  onClick={(e) => handleUnfavorite(pet.id, e)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                  title="取消收藏"
                >
                  ❤️
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
