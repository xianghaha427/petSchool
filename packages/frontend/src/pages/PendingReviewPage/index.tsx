import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { petService, PetPending } from '@/services/petService';
import { TIFFY_BLUE, TIFFY_BLUE_DARK } from '@/styles/theme';

export default function PendingReviewPage() {
  const [pendingList, setPendingList] = useState<PetPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadPendingList();
  }, []);

  const loadPendingList = async () => {
    try {
      const data = await petService.getMyPendingList();
      setPendingList(data);
    } catch (error) {
      console.error('获取待审核列表失败', error);
    }
    setLoading(false);
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

  const filteredList = pendingList.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 0;
    if (filter === 'approved') return item.status === 1;
    if (filter === 'rejected') return item.status === 2;
    return true;
  });

  const statusCounts = {
    all: pendingList.length,
    pending: pendingList.filter((p) => p.status === 0).length,
    approved: pendingList.filter((p) => p.status === 1).length,
    rejected: pendingList.filter((p) => p.status === 2).length,
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
          <h1 className="text-2xl font-bold text-gray-800">登记审核状态</h1>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '全部', count: statusCounts.all },
            { key: 'pending', label: '待审核', count: statusCounts.pending },
            { key: 'approved', label: '已通过', count: statusCounts.approved },
            { key: 'rejected', label: '已拒绝', count: statusCounts.rejected },
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
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl text-gray-600 mb-6">暂无登记记录</h2>
            <button
              onClick={() => window.location.href = '/register'}
              className="px-6 py-3 text-white rounded-lg transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
            >
              去登记
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* 照片 */}
                  <div className="md:w-48 h-48 md:h-auto">
                    <img
                      src={item.photoUrl || '/default-pet.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                        <p className="text-gray-500 text-sm">
                          {item.species} {item.breed && `· ${item.breed}`}
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
                        <p className="text-gray-400 text-xs">性别</p>
                        <p className="text-gray-700">{item.genderLabel || (item.gender === 1 ? '公' : '母')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">登记时间</p>
                        <p className="text-gray-700">{item.createTime ? new Date(item.createTime).toLocaleDateString() : '-'}</p>
                      </div>
                    </div>

                    {item.status === 2 && item.rejectReason && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <p className="text-red-600 text-sm">
                          <span className="font-semibold">拒绝原因：</span>
                          {item.rejectReason}
                        </p>
                      </div>
                    )}

                    {item.status === 1 && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-green-600 text-sm">
                          恭喜！您的宠物登记已通过审核
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
