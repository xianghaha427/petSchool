import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ActivityCreateForm } from '@/components/admin/ActivityCreateForm';
import { activityService } from '@/services/activityService';
import { useToast } from '@/components/ui/Toast';
import type { ActivityCreatePayload } from '@/types/activity';

/**
 * 创建校园活动（仅管理员）
 *
 * 权限由 App.tsx 的 <ProtectedRoute requireAdmin> 把守，后端
 * /admin/activities 还会再校验一次 role=1 —— 前端这道只是把非管理员挡在门外，
 * 不是安全边界。
 */
export default function CreateActivityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const handleSubmit = async (payload: ActivityCreatePayload) => {
    await activityService.createActivity(payload);

    // 首页读的是 ['activities']，不失效的话用户点回首页还是旧列表，
    // 会以为没建成功
    await queryClient.invalidateQueries({ queryKey: ['activities'] });

    showToast('活动创建成功！', 'success');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">创建校园活动</h1>
              <p className="text-gray-500 text-sm mt-1">
                创建后活动会立刻出现在首页的「校园活动」区，用户即可报名
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm"
            >
              返回
            </button>
          </div>

          <ActivityCreateForm onSubmit={handleSubmit} />
        </motion.div>
      </div>
    </div>
  );
}
