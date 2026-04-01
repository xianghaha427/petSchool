import { motion } from 'framer-motion';

const stats = [
  { value: '2,847', label: '注册宠物', icon: '🐾' },
  { value: '1,562', label: '幸福家庭', icon: '🏠' },
  { value: '38', label: '校园分区', icon: '📍' },
  { value: '99.8%', label: '满意度', icon: '⭐' },
];

export function StatsBar() {
  return (
    <section className="relative -mt-20 z-10 mb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                className="text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div
                  className="text-3xl md:text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1"
                  style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm font-medium tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
