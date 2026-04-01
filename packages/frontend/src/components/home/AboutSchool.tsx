import { motion } from 'framer-motion';

const highlights = [
  {
    icon: '🏫',
    title: '专业校区',
    description: '专为宠物设计的活动空间与教学区域',
  },
  {
    icon: '👨‍🏫',
    title: '资深教师',
    description: '经验丰富的宠物行为专家团队',
  },
  {
    icon: '🏥',
    title: '健康保障',
    description: '定期体检与疫苗接种服务',
  },
  {
    icon: '🎮',
    title: '丰富活动',
    description: '社交游戏与技能训练课程',
  },
];

export function AboutSchool() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image Collage */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/carousel/pets.jpg"
                alt="宠物校园"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -right-6 top-1/4 bg-white rounded-2xl p-4 shadow-2xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl">
                  🐾
                </div>
                <div>
                  <div
                    className="text-2xl font-black text-gray-900"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    2026
                  </div>
                  <div className="text-xs text-gray-500">正式运营</div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-teal-100 rounded-2xl -z-10" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-100 rounded-full -z-10" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-4"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              关于我们
            </span>
            <h2
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
            >
              欢迎来到<br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                宠物校园
              </span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              宠物校园是一个专为宠物打造的温馨社区，我们致力于为每一位毛孩子提供最好的照顾、教育和社交机会。在这里，您的宠物可以结交新朋友、学习新技能、享受快乐的校园生活。
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4
                      className="font-bold text-gray-900 mb-0.5"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
