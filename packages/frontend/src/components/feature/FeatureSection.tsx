import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
  imageUrl: string;
}

function FeatureCard({ title, description, icon, path, imageUrl }: FeatureCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="relative overflow-hidden rounded-2xl cursor-pointer shadow-xl h-[200px]"
    >
      {/* 背景图片 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30" />
      {/* 内容 */}
      <div className="relative p-8 text-white h-full flex flex-col justify-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
    </motion.div>
  );
}

export default function FeatureSection() {
  const features = [
    {
      title: '宠物列表',
      description: '查看我们可爱的宠物学员们',
      icon: '🐾',
      path: '/pets',
      imageUrl: '/images/carousel/petList.jpg',
    },
    {
      title: '宠物登记',
      description: '为你的宠物办理入学手续',
      icon: '📝',
      path: '/register',
      imageUrl: '/images/carousel/petSign.jpg',
    },
    {
      title: '校园地图',
      description: '探索宠物们的活动区域',
      icon: '🗺️',
      path: '/map',
      imageUrl: '/images/carousel/campusMap.jpg',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      {/* 占 3/4 宽度 */}
      <div className="max-w-[75%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[200px]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
