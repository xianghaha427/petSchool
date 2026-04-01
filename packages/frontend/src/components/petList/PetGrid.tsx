import { PetCard } from '@/components/petCard/PetCard';
import { usePets } from '@/hooks/usePets';
import { motion } from 'framer-motion';

export function PetGrid() {
  const { pets, isLoading, error, totalPages, currentPage } = usePets({ page: 1, limit: 12 });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">加载失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div>
      {/* 宠物网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        {pets.map((pet, index) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PetCard pet={pet} />
          </motion.div>
        ))}
      </div>

      {/* 空状态 */}
      {pets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">暂无宠物数据</p>
        </div>
      )}

      {/* 分页指示器 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <span className="text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
        </div>
      )}
    </div>
  );
}
