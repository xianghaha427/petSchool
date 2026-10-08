import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { canRegister, formatActivityDate, getActivityStatus } from '@/utils/activityStatus';
import { activityGradient } from '@/utils/activityTheme';
import { activityService } from '@/services/activityService';
import type { Activity } from '@/types/activity';

interface ActivityRegisterModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  /** 报名成功后的回调，由首页用来刷新列表与报名状态 */
  onSuccess?: () => void | Promise<void>;
}

const EMPTY_FORM = { petName: '', ownerName: '', phone: '', email: '', note: '' };

/** 优先取后端返回的中文 message（业务失败时 apiClient 已把 code!=200 转成 ApiError） */
function errorMessageOf(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || '报名失败，请稍后重试';
}

export function ActivityRegisterModal({
  activity,
  isOpen,
  onClose,
  onSuccess,
}: ActivityRegisterModalProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetAndClose = () => {
    onClose();
    setIsSuccess(false);
    setErrorMessage(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    // 兜底：卡片上的按钮已经挡住了过期活动，但提交路径自己也要把住门，
    // 否则一旦别处再调用这个弹窗，过期活动照样能"报名成功"。
    // 后端 1009 是第二道防线（真正的判定在服务端）。
    if (!canRegister(getActivityStatus(activity.startAt, activity.endAt))) {
      resetAndClose();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await activityService.signup(activity.id, {
        petName: formData.petName.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        // 空串是表单默认值，转成 undefined 让后端 @Email 不必面对空串
        email: formData.email.trim() || undefined,
        note: formData.note.trim() || undefined,
      });

      await onSuccess?.();
      setIsSuccess(true);

      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (error) {
      // 后端的中文提示（如「你已报名该活动」「活动已开始或已结束，无法报名」）
      // 直接展示在表单里，比一个 toast 更容易被看到
      console.error('活动报名失败', error);
      setErrorMessage(errorMessageOf(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渐变色从主题键映射而来，与首页卡片同一份定义。
  // （原先这里用 activity.color.split(' ') 去猜十六进制色值，就为了给内联 style 用；
  //  现在直接用完整类名，猜测逻辑整段删除。）
  const gradient = activityGradient(activity?.theme);

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
            onClick={resetAndClose}
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
              <div className={`relative p-6 bg-gradient-to-r ${gradient} text-white`}>
                <button
                  onClick={resetAndClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold mb-1">活动报名</h2>
                <p className="opacity-90">{activity.title}</p>
                <div className="mt-3 flex items-center gap-4 text-sm opacity-80">
                  <span>{formatActivityDate(activity.startAt, activity.endAt).date}</span>
                  <span>{formatActivityDate(activity.startAt, activity.endAt).time}</span>
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
                        maxLength={64}
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
                        maxLength={64}
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
                        maxLength={32}
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
                        maxLength={128}
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
                        maxLength={256}
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="选填，如特殊需求、注意事项等"
                      />
                    </div>

                    {/* 后端返回的失败原因（重复报名 / 报名窗口已关等） */}
                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 bg-gradient-to-r ${gradient} ${
                          isSubmitting ? '' : 'hover:shadow-xl hover:-translate-y-0.5'
                        }`}
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
