import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  color: string;
}

interface ActivityRegisterModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityRegisterModal({ activity, isOpen, onClose }: ActivityRegisterModalProps) {
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    phone: '',
    email: '',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setFormData({ petName: '', ownerName: '', phone: '', email: '', note: '' });
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && activity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className={`relative p-6 bg-gradient-to-r ${activity.color} text-white`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold mb-1">活动报名</h2>
                <p className="opacity-90">{activity.title}</p>
                <div className="mt-3 flex items-center gap-4 text-sm opacity-80">
                  <span>{activity.date}</span>
                  <span>{activity.time}</span>
                  <span>{activity.location}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">报名成功！</h3>
                    <p className="text-gray-500">我们已收到您的报名信息</p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        宠物姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.petName}
                        onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="请输入宠物姓名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        主人姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="请输入您的姓名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        手机号码 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="请输入手机号码"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        电子邮箱
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="选填"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        备注说明
                      </label>
                      <textarea
                        rows={3}
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="选填，如特殊需求、注意事项等"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 ${
                          isSubmitting ? '' : 'hover:shadow-xl hover:-translate-y-0.5'
                        }`}
                        style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))`, backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }}
                        onMouseEnter={(e) => {
                          const colors = activity.color.split(' ');
                          if (colors[1]) {
                            const colorValue = colors[1].replace('to-', '#');
                            e.currentTarget.style.background = `linear-gradient(to right, ${colorValue.includes('orange') ? '#f97316' : colorValue.includes('pink') ? '#ec4899' : '#14b8a6'}, ${colorValue.includes('amber') ? '#f59e0b' : colorValue.includes('rose') ? '#f43f5e' : '#06b6d4'})`;
                          }
                        }}
                      >
                        {isSubmitting ? '提交中...' : '确认报名'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
