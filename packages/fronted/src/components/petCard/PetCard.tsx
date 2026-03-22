import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Pet } from '@/types/pet';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={cn(
        'group relative rounded-2xl overflow-hidden',
        'bg-white shadow-lg hover:shadow-2xl',
        'transition-all duration-300 cursor-pointer'
      )}
    >
      <Link to={`/pets/${pet.id}`} className="block">
        {/* 宠物照片 */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* 信息卡片 */}
        <div className="p-5">
          {/* 姓名和学号 */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
              {pet.name}
            </h3>
            <span className="px-3 py-1 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-full">
              {pet.studentId}
            </span>
          </div>

          {/* 简略信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-lg">
                {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
              </span>
              <span>
                {pet.breed || pet.species}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>🎂</span>
              <span>{pet.age}岁</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚖️</span>
              <span>{pet.weight}kg</span>
            </div>
          </div>

          {/* 性别标识 */}
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                pet.gender === 'male'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-pink-100 text-pink-600'
              )}
            >
              {pet.gender === 'male' ? '♂️ 男生' : '♀️ 女生'}
            </span>
            {pet.isVaccinated && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-600">
                ✅ 已疫苗
              </span>
            )}
          </div>
        </div>
      </Link>

      {/*  glow-border 效果 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
    </motion.div>
  );
}
