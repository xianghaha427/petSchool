import { useState } from 'react';
import { PetGrid } from '@/components/petList/PetGrid';
import { usePets } from '@/hooks/usePets';
import { motion } from 'framer-motion';
import { TIFFY_BLUE, TIFFY_BLUE_DARK } from '@/styles/theme';

export default function PetsPage() {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    species: '',
    gender: undefined as number | undefined,
    sort: 'newest' as 'newest' | 'oldest' | 'name',
  });

  const { pets, isLoading, error, totalPages, currentPage, refetch } = usePets({
    ...searchParams,
    pageNum: 1,
    pageSize: 12,
  });

  const handleSearch = () => {
    refetch();
  };

  const handleClear = () => {
    setSearchParams({
      keyword: '',
      species: '',
      gender: undefined,
      sort: 'newest',
    });
    setTimeout(refetch, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 页面标题 */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            宠物学员列表
          </h1>
          <p className="text-gray-600 text-lg">
            认识一下我们可爱的宠物学员们
          </p>
        </div>
      </section>

      {/* 搜索筛选 */}
      <section className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* 关键词搜索 */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索名称或学号..."
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* 种类筛选 */}
            <select
              value={searchParams.species}
              onChange={(e) => setSearchParams({ ...searchParams, species: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">全部种类</option>
              <option value="狗">🐕 狗</option>
              <option value="猫">🐱 猫</option>
              <option value="其他">其他</option>
            </select>

            {/* 性别筛选 */}
            <select
              value={searchParams.gender ?? ''}
              onChange={(e) => setSearchParams({ ...searchParams, gender: e.target.value ? Number(e.target.value) : undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">全部性别</option>
              <option value="1">♂️ 公</option>
              <option value="2">♀️ 母</option>
            </select>

            {/* 排序 */}
            <select
              value={searchParams.sort}
              onChange={(e) => setSearchParams({ ...searchParams, sort: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">最新</option>
              <option value="oldest">最旧</option>
              <option value="name">名字</option>
            </select>

            {/* 搜索按钮 */}
            <button
              onClick={handleSearch}
              className="px-6 py-2 text-white rounded-lg transition-all"
              style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
            >
              搜索
            </button>

            {/* 清除按钮 */}
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              清除
            </button>
          </div>
        </motion.div>
      </section>

      {/* 宠物网格 */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <PetGrid pets={pets} />
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 text-gray-600">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
