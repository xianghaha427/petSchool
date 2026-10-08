import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '@/services/adminService';
import type { PetPending } from '@/services/petService';
import { useToast } from '@/components/ui/Toast';
import { TIFFY_BLUE, TIFFY_BLUE_DARK, TIFFY_LIGHT } from '@/styles/theme';
import { getSpeciesEmoji } from '@/utils/petUtils';

// 取出错误信息：优先用后端返回的 message，其次用 Error.message（业务失败由 adminService 抛出）
const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
};

// 后端 LocalDateTime 会序列化成数组 [2026,4,6,19,44,24]，这里统一格式化
const formatDateTime = (value: unknown) => {
  if (!value) return '-';
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0] = value as number[];
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}`;
  }
  return new Date(value as string).toLocaleString();
};

export default function AdminPendingPage() {
  const [list, setList] = useState<PetPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  // 正在提交的记录 id，用于禁用按钮防止重复点击
  const [actingId, setActingId] = useState<number | null>(null);
  // 拒绝弹窗
  const [rejectTarget, setRejectTarget] = useState<PetPending | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { showToast } = useToast();

  const loadList = async () => {
    try {
      const data = await adminService.getAllPending();
      setList(data);
    } catch (error) {
      console.error('获取登记列表失败', error);
      showToast(getErrorMessage(error, '获取登记列表失败'), 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (item: PetPending) => {
    if (!window.confirm(`确认通过「${item.name}」的登记申请？通过后将写入宠物档案并生成学号。`)) {
      return;
    }
    setActingId(item.id);
    try {
      await adminService.approvePending(item.id);
      showToast('审核已通过', 'success');
      await loadList();
    } catch (error) {
      console.error('审核通过失败', error);
      showToast(getErrorMessage(error, '审核通过失败'), 'error');
    }
    setActingId(null);
  };

  const openRejectModal = (item: PetPending) => {
    setRejectTarget(item);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      showToast('请填写拒绝原因', 'error');
      return;
    }
    setActingId(rejectTarget.id);
    try {
      await adminService.rejectPending(rejectTarget.id, reason);
      showToast('已拒绝该登记', 'success');
      setRejectTarget(null);
      setRejectReason('');
      await loadList();
    } catch (error) {
      console.error('拒绝失败', error);
      showToast(getErrorMessage(error, '拒绝失败'), 'error');
    }
    setActingId(null);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">待审核</span>;
      case 1:
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">已通过</span>;
      case 2:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">已拒绝</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">未知</span>;
    }
  };

  const filteredList = list.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 0;
    if (filter === 'approved') return item.status === 1;
    if (filter === 'rejected') return item.status === 2;
    return true;
  });

  const statusCounts = {
    all: list.length,
    pending: list.filter((p) => p.status === 0).length,
    approved: list.filter((p) => p.status === 1).length,
    rejected: list.filter((p) => p.status === 2).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">宠物登记审核</h1>
            <p className="text-gray-500 text-sm mt-1">通过后登记信息将写入宠物档案并自动生成学号</p>
          </div>
          <button
            onClick={loadList}
            className="px-4 py-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            🔄 刷新
          </button>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'pending', label: '待审核', count: statusCounts.pending },
            { key: 'approved', label: '已通过', count: statusCounts.approved },
            { key: 'rejected', label: '已拒绝', count: statusCounts.rejected },
            { key: 'all', label: '全部', count: statusCounts.all },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === tab.key
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              style={filter === tab.key ? { background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` } : {}}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl text-gray-600">暂无记录</h2>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* 照片 */}
                  <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl"
                        style={{ backgroundColor: TIFFY_LIGHT }}
                      >
                        🐾
                      </div>
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {item.name}
                          <span className="ml-2 text-sm text-gray-500">
                            ({getSpeciesEmoji(item.species)}
                            {item.gender === 1 ? '♂️' : '♀️'})
                          </span>
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {item.species} {item.breed && `· ${item.breed}`}
                          {item.username && ` · 提交人：${item.username}`}
                        </p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">年龄</p>
                        <p className="text-gray-700">{item.age} 个月</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">体重</p>
                        <p className="text-gray-700">{item.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">主人 / 联系方式</p>
                        <p className="text-gray-700">
                          {item.ownerName || '-'} / {item.ownerContact || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">登记时间</p>
                        <p className="text-gray-700">{formatDateTime(item.createTime)}</p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-4">简介：{item.description}</p>
                    )}

                    {item.status === 2 && item.rejectReason && (
                      <div className="mb-4 p-4 bg-red-50 rounded-lg">
                        <p className="text-red-600 text-sm">
                          <span className="font-semibold">拒绝原因：</span>
                          {item.rejectReason}
                        </p>
                      </div>
                    )}

                    {item.status === 1 && (
                      <div className="mb-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-green-600 text-sm">已通过审核，宠物档案已建立</p>
                      </div>
                    )}

                    {/* 仅待审核记录可操作 */}
                    {item.status === 0 && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={actingId === item.id}
                          className="px-5 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: TIFFY_BLUE_DARK }}
                        >
                          {actingId === item.id ? '处理中...' : '✓ 通过'}
                        </button>
                        <button
                          onClick={() => openRejectModal(item)}
                          disabled={actingId === item.id}
                          className="px-5 py-2 rounded-lg bg-white text-red-500 font-medium border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          ✕ 拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 拒绝原因弹窗 */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setRejectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                拒绝「{rejectTarget.name}」的登记
              </h3>
              <p className="text-sm text-gray-500 mb-4">请填写拒绝原因，用户可在审核状态中看到</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="例如：照片不清晰，请重新上传"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={actingId === rejectTarget.id}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actingId === rejectTarget.id ? '提交中...' : '确认拒绝'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
