import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { petService, Pet } from '@/services/petService';
import { PetCard } from '@/components/petCard/PetCard';
import { TIFFY_BLUE, TIFFY_BLUE_DARK } from '@/styles/theme';

export default function MyPetsPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const data = await petService.getMyPets();
      setPets(data);
    } catch (error) {
      console.error('获取我的萌宠失败', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这只萌宠吗？')) {
      try {
        await petService.deleteMyPet(id);
        setPets(pets.filter((p) => p.id !== id));
      } catch (error) {
        alert('删除失败');
      }
    }
    setDeleteId(null);
  };

  const handleEdit = (id: number) => {
    navigate(`/pets/${id}/edit`);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">我的萌宠</h1>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 text-white rounded-lg transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
          >
            + 添加萌宠
          </button>
        </div>

        {pets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-xl text-gray-600 mb-6">还没有添加萌宠</h2>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 text-white rounded-lg transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
            >
              立即添加
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
                <PetCard pet={pet} showActions />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(pet.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 text-blue-500 transition-colors"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteId(pet.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>

                {/* 删除确认弹窗 */}
                {deleteId === pet.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl p-6 w-full max-w-sm"
                    >
                      <h3 className="text-lg font-bold text-gray-800 mb-4">确认删除</h3>
                      <p className="text-gray-600 mb-6">确定要删除 "{pet.name}" 吗？此操作不可恢复。</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleDelete(pet.id)}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          删除
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
