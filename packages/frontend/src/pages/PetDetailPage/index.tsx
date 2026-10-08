import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { usePetDetail } from '@/hooks/usePetDetail';
import { usePetHealthAdvice } from '@/hooks/usePetHealthAdvice';
import { HealthAdvicePanel } from '@/components/petDetail/HealthAdvicePanel';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { getSpeciesEmoji } from '@/utils/petUtils';

// 蒂芙尼色主题色（与养护建议面板保持一致）
const TIFFANY_BLUE = '#81C7D4';
const TIFFANY_BLUE_DARK = '#5DA9B8';
const TIFFANY_LIGHT = '#E0F2F5';

export default function PetDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pet, isLoading, error } = usePetDetail(id || '');

  // 这两个 hook 必须声明在两个 early return 之前，否则违反 hooks 调用规则
  const { showToast } = useToast();
  const healthAdvice = usePetHealthAdvice(pet, id || '');
  const adviceStatus = healthAdvice.status;
  const adviceError = healthAdvice.errorMessage;

  // 失败时补一个温和的 info 提示。面板本身已经说明了情况，这里只是别让用户漏看
  useEffect(() => {
    if (adviceStatus !== 'failed') return;
    showToast(adviceError || 'AI 暂时不可用，请稍后再试', 'info');
  }, [adviceStatus, adviceError, id, showToast]);

  const handleBack = () => {
    console.log('点击返回按钮, token:', localStorage.getItem('token'));
    navigate('/pets');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-red-500 text-lg">加载失败或宠物不存在</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        {/* 宠物信息卡片 */}
        <div className="glass rounded-2xl overflow-hidden shadow-xl">
          {/* 宠物大图 */}
          <div className="relative h-96">
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{pet.name}</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-sm font-medium">
                  {pet.studentId}
                </span>
              </div>
              <p className="text-lg opacity-90">{pet.description || '暂无简介'}</p>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="p-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mb-2 block">
                  {getSpeciesEmoji(pet.species)}
                </span>
                <span className="text-sm text-gray-600">种类</span>
                <p className="font-medium">{pet.breed || pet.species}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mb-2 block">🎂</span>
                <span className="text-sm text-gray-600">年龄</span>
                <p className="font-medium">{pet.age} 岁</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mb-2 block">⚖️</span>
                <span className="text-sm text-gray-600">体重</span>
                <p className="font-medium">{pet.weight} kg</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mb-2 block">
                  {pet.gender === 1 ? '♂️' : '♀️'}
                </span>
                <span className="text-sm text-gray-600">性别</span>
                <p className="font-medium">{pet.gender === 1 ? '男生' : '女生'}</p>
              </div>
            </div>

            {/* 健康信息 */}
            <div className="border-t pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-xl font-bold">健康信息</h3>
                <button
                  type="button"
                  onClick={() => healthAdvice.generate()}
                  disabled={healthAdvice.isGenerating}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    color: TIFFANY_BLUE_DARK,
                    backgroundColor: TIFFANY_LIGHT,
                    border: `1px solid ${TIFFANY_BLUE}`,
                  }}
                >
                  {healthAdvice.isGenerating ? (
                    <>
                      <span
                        className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                        style={{ borderColor: TIFFANY_BLUE, borderTopColor: 'transparent' }}
                      />
                      生成中…
                    </>
                  ) : (
                    <>✨ {healthAdvice.status === 'done' ? '重新生成养护建议' : 'AI 养护建议'}</>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <span className="text-2xl">{pet.isVaccinated ? '✅' : '⏳'}</span>
                  <div>
                    <p className="text-sm text-gray-600">疫苗接种</p>
                    <p className="font-medium">{pet.isVaccinated ? '已接种' : '未接种'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <span className="text-2xl">{pet.isNeutered ? '✅' : '⏳'}</span>
                  <div>
                    <p className="text-sm text-gray-600">绝育状态</p>
                    <p className="font-medium">{pet.isNeutered ? '已绝育' : '未绝育'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="text-sm text-gray-600">健康状态</p>
                    <p className="font-medium">{pet.healthStatus || '健康'}</p>
                  </div>
                </div>
              </div>

              <HealthAdvicePanel
                status={healthAdvice.status}
                result={healthAdvice.advice}
                errorMessage={healthAdvice.errorMessage}
                onRetry={() => healthAdvice.generate()}
              />
            </div>

            {/* 主人信息 */}
            {pet.ownerName && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-bold mb-4">主人信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">姓名</p>
                    <p className="font-medium">{pet.ownerName}</p>
                  </div>
                  {pet.ownerContact && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">联系方式</p>
                      <p className="font-medium">{pet.ownerContact}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
