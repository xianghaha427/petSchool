import { PetCard } from '@/components/petCard/PetCard';
import { motion } from 'framer-motion';
import type { Pet } from '@/types/pet';

interface PetGridProps {
  pets: Pet[];
}

export function PetGrid({ pets }: PetGridProps) {
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
    </div>
  );
}
