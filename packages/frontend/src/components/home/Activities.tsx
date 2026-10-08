import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ActivityRegisterModal } from './ActivityRegisterModal';
import { useActivities } from '@/hooks/useActivities';
import { useMyActivitySignups } from '@/hooks/useMyActivitySignups';
import { activityService } from '@/services/activityService';
import { useToast } from '@/components/ui/Toast';
import { activityGradient } from '@/utils/activityTheme';
import {
  canRegister,
  CLOSED_REASON,
  formatActivityDate,
  getActivityStatus,
  STATUS_ORDER,
} from '@/utils/activityStatus';
import type { ActivityWithStatus } from '@/types/activity';

/**
 * 首页「校园活动」区。
 *
 * 这里的数据来自 GET /activities（免登录放行），不再是写死的数组：
 *   - 改动前 6 条活动硬编码在文件里，报名人数永远不变，管理员加活动要改代码重新部署
 *   - 现在 participants 是数据库实时统计，管理员创建后立刻出现在这里
 *
 * 状态（报名中/即将开始/进行中/已结束）仍然**不落库**，由 activityStatus.ts
 * 拿当前时间实时算——落库会立刻过期。
 */
export function Activities() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  // 正在取消报名的活动 id，防止重复点击
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const { activities, isLoading, error } = useActivities();
  const signedUpIds = useMyActivitySignups();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 一次渲染里只取一个"现在"，避免排序和按钮各自取时间、恰好跨过边界时对不上
  const now = new Date();
  const withStatus: ActivityWithStatus[] = activities.map((a) => ({
    ...a,
    status: getActivityStatus(a.startAt, a.endAt, now),
  }));

  // 可报名的排在前面，已结束的沉到最后；同状态下按开始时间由近及远
  const sortedActivities = [...withStatus].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
  });

  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(0, 3);

  const handleRegisterClick = (activity: ActivityWithStatus) => {
    // 列表接口是公开的，未登录也能看到活动；要点报名才需要登录。
    // 不在登录页跳转，把用户带回首页会丢上下文，所以打完招呼直接去登录页。
    if (!localStorage.getItem('token')) {
      showToast('请先登录后再报名活动', 'info');
      navigate('/login');
      return;
    }
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCancelSignup = async (activity: ActivityWithStatus) => {
    if (!window.confirm(`确认取消报名「${activity.title}」？取消后需要重新报名。`)) {
      return;
    }
    setCancelingId(activity.id);
    try {
      await activityService.cancelSignup(activity.id);
      showToast('已取消报名', 'success');
      // 两个 key 都要失效：activities 让报名人数 -1，
      // my-activity-signups 让按钮从「已报名」变回「立即报名」
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
        queryClient.invalidateQueries({ queryKey: ['my-activity-signups'] }),
      ]);
    } catch (err) {
      console.error('取消报名失败', err);
      showToast(err instanceof Error ? err.message : '取消报名失败，请稍后重试', 'error');
    } finally {
      setCancelingId(null);
    }
  };

  /** 报名成功后的回调：刷新列表与报名状态，让数字立刻 +1 */
  const handleSignupSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
      queryClient.invalidateQueries({ queryKey: ['my-activity-signups'] }),
    ]);
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

        {/* 加载中：骨架卡片 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                <div className="h-44 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* 加载失败：给出可重试的出口，不要静默显示成"没有活动" */
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-4">😿</div>
            <h3 className="text-xl text-gray-600 mb-2">{error}</h3>
            <p className="text-gray-400 text-sm">
              活动数据没能加载出来，请检查网络或稍后再试
            </p>
          </div>
        ) : displayedActivities.length === 0 ? (
          /* 空态：运营还没建过活动。不是错误，不要显示成报错 */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-lg mx-auto"
          >
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl text-gray-600 mb-2">暂无活动，敬请期待</h3>
            <p className="text-gray-400 text-sm">
              新的校园活动正在筹备中，过些天再来看看吧
            </p>
          </motion.div>
        ) : (
          <>
            {/* Activities Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayedActivities.map((activity, index) => {
                const gradient = activityGradient(activity.theme);
                const signedUp = signedUpIds.has(activity.id);
                const { date, time } = formatActivityDate(activity.startAt, activity.endAt);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    whileHover={{ y: -6 }}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                  >
                    {/* Image Header */}
                    <div className="relative h-44 overflow-hidden">
                      {activity.coverUrl ? (
                        <img
                          src={activity.coverUrl}
                          alt={activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        /* 没传封面时用主题渐变兜底，而不是留一个破图 */
                        <div
                          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-6xl`}
                        >
                          🐾
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-60`} />

                      {/* Tag */}
                      <div
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          activity.status === '已结束'
                            ? 'bg-gray-700/85 text-white'
                            : 'bg-white/90 text-gray-800'
                        }`}
                      >
                        {activity.status}
                      </div>

                      {/* 已报名角标：卡片收起按钮时也能一眼看出报过名 */}
                      {signedUp && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-emerald-500/95 text-white">
                          ✓ 已报名
                        </div>
                      )}

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
                    <div className="p-5 flex flex-col flex-1">
                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-gray-700 mb-3">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{date}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm">{time}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{activity.location}</span>
                      </div>

                      {/* 简介：后端有就显示，没有就不占位 */}
                      {activity.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {activity.description}
                        </p>
                      )}

                      {/* Participants Bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2">
                          {/* 0 人报名时不摆三个爪印头像，免得和「0 只」自相矛盾 */}
                          {activity.participants > 0 && (
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
                          )}
                          <span className="text-sm text-gray-500">
                            {activity.participants} 只宠物已报名
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {canRegister(activity.status) ? (
                        signedUp ? (
                          <button
                            onClick={() => handleCancelSignup(activity)}
                            disabled={cancelingId === activity.id}
                            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-all duration-300 disabled:opacity-50"
                          >
                            {cancelingId === activity.id ? '取消中...' : '已报名，点击取消'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterClick(activity)}
                            className={`w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0`}
                          >
                            立即报名
                          </button>
                        )
                      ) : (
                        // 不能报名的状态不再藏着：常显并说明原因，
                        // 免得用户以为"没到报名时间"，其实报名早就截止了
                        <button
                          disabled
                          className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                        >
                          {CLOSED_REASON[activity.status]}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* View All Link：超过 3 条才有意义 */}
            {sortedActivities.length > 3 && (
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
            )}
          </>
        )}
      </div>

      {/* Activity Registration Modal */}
      <ActivityRegisterModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSignupSuccess}
      />
    </section>
  );
}
