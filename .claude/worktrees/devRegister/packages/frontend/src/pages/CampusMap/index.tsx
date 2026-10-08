import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampusSVGMap } from './components/CampusSVGMap';
import { campusAreas, CampusArea } from '@/data/campusAreas';

export default function CampusMap() {
  const [selectedArea, setSelectedArea] = useState<CampusArea | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* 页面标题 */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🗺️ 校园地图
          </h1>
          <p className="text-teal-100 text-lg">
            点击地图上的标识查看详情
          </p>
        </div>
      </section>

      {/* 地图区域 */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">校园平面图</h2>
            <span className="text-sm text-gray-500">点击地图上的标识查看详情</span>
          </div>

          {/* 地图 */}
          <CampusSVGMap onAreaClick={setSelectedArea} />
        </div>

        {/* 地点列表 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {campusAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area)}
              className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <span className="text-sm font-bold text-white">{area.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 区域详情模态框 */}
      <AnimatePresence>
        {selectedArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedArea(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 详情图片 */}
              <div className="relative h-56 bg-gray-100">
                <img
                  src={selectedArea.detailImage || '/images/carousel/campusMap.jpg'}
                  alt={selectedArea.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-3xl font-bold text-white">{selectedArea.name}</h3>
                </div>
              </div>

              {/* 详情内容 */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed mb-6">
                  {selectedArea.description}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setSelectedArea(null)}
                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
