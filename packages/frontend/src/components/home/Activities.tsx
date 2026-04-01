import { useState } from 'react';
import { motion } from 'framer-motion';
import { ActivityRegisterModal } from './ActivityRegisterModal';

const activities = [
  {
    id: 1,
    title: '春季运动会',
    date: '3月15日',
    time: '14:00 - 17:00',
    location: '中央草坪',
    participants: 86,
    image: '/images/carousel/dog.jpg',
    color: 'from-orange-500 to-amber-500',
    tag: '即将开始',
  },
  {
    id: 2,
    title: '宠物美妆日',
    date: '3月20日',
    time: '10:00 - 16:00',
    location: '美容中心',
    participants: 45,
    image: '/images/carousel/cat.jpg',
    color: 'from-pink-500 to-rose-500',
    tag: '报名中',
  },
  {
    id: 3,
    title: '亲子互动课',
    date: '3月22日',
    time: '09:00 - 11:00',
    location: '教学区A',
    participants: 32,
    image: '/images/pets/3.jpg',
    color: 'from-teal-500 to-cyan-500',
    tag: '进行中',
  },
  {
    id: 4,
    title: '小狗游泳比赛',
    date: '4月5日',
    time: '10:00 - 12:00',
    location: '游泳馆',
    participants: 28,
    image: '/images/carousel/dog.jpg',
    color: 'from-blue-500 to-cyan-500',
    tag: '报名中',
  },
  {
    id: 5,
    title: '小狗拔河比赛',
    date: '4月12日',
    time: '15:00 - 17:00',
    location: '体育场',
    participants: 56,
    image: '/images/carousel/dog.jpg',
    color: 'from-red-500 to-orange-500',
    tag: '即将开始',
  },
  {
    id: 6,
    title: '小狗识物大比拼',
    date: '4月18日',
    time: '14:00 - 16:00',
    location: '教学楼B',
    participants: 40,
    image: '/images/carousel/dog.jpg',
    color: 'from-purple-500 to-pink-500',
    tag: '报名中',
  },
];

export function Activities() {
  const [selectedActivity, setSelectedActivity] = useState<(typeof activities)[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const sortedActivities = [
    ...activities.filter((a) => a.tag === '报名中'),
    ...activities.filter((a) => a.tag !== '报名中'),
  ];

  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(0, 3);

  const handleRegisterClick = (activity: typeof activities[0]) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-transparent">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            精彩活动
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
            style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
          >
            校园活动
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            丰富的活动让宠物们的校园生活更加精彩
          </p>
        </motion.div>

        {/* Activities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Image Header */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${activity.color} opacity-60`} />

                {/* Tag */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-gray-800 text-xs font-bold shadow-lg">
                  {activity.tag}
                </div>

                {/* Activity Title Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3
                    className="text-xl font-bold text-white drop-shadow-lg"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    {activity.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Date & Time */}
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{activity.date}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm">{activity.time}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{activity.location}</span>
                </div>

                {/* Participants Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                        >
                          🐾
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{activity.participants} 只宠物已报名</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleRegisterClick(activity)}
                  className={`w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r ${activity.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}
                >
                  立即报名
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
          >
            <span>{showAll ? '收起活动' : '查看全部活动'}</span>
            <svg
              className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Activity Registration Modal */}
      <ActivityRegisterModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
