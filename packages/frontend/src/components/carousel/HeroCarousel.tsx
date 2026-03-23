import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 本地轮播图数据 - 从 public/images/carousel 加载
const carouselImages = [
  {
    id: '1',
    url: '/images/carousel/dog.jpg',
    title: '可爱的狗狗们',
    description: '校园里的萌宠日常',
  },
  {
    id: '2',
    url: '/images/carousel/cat.jpg',
    title: '猫咪学园',
    description: '优雅的校园居民',
  },
  {
    id: '3',
    url: '/images/carousel/pets.jpg',
    title: '宠物朋友圈',
    description: '记录美好时光',
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // 手动切换
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      {/* 轮播图 */}
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={carouselImages[currentIndex].url}
            alt={carouselImages[currentIndex].title}
            className="w-full h-full object-cover hero-carousel-img"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.1) saturate(1.1) brightness(1.05)',
            }}
          />
          {/* 玻璃态遮罩 - 降低透明度提高清晰度 */}
          <div className="absolute inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
            <div className="text-center text-white">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg"
              >
                {carouselImages[currentIndex].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl drop-shadow-md"
              >
                {carouselImages[currentIndex].description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 切换按钮 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full text-white hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full text-white hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 指示点 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
