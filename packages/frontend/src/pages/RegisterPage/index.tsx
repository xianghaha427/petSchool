import { useState } from 'react';
import { motion } from 'framer-motion';
import { PetRegisterForm } from '@/components/petRegister/PetRegisterForm';
import { petService } from '@/services/petService';
import { useToast } from '@/components/ui/Toast';
import type { PetRegisterFormData } from '@/types/pet';
import { genderStringToNumber } from '@/utils/petUtils';

// 蒂芙尼色主题
const TIFFANY_BLUE = '#81C7D4';
const TIFFANY_BLUE_DARK = '#5DA9B8';
const TIFFANY_LIGHT = '#E0F2F5';

// Mock 数据存储（后期替换为 API 调用）
const mockPetData: PetRegisterFormData[] = [];

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const { showToast } = useToast();

  const handleSubmit = async (data: PetRegisterFormData) => {
    try {
      // 转换表单数据为 API 格式
      const apiData = {
        name: data.name,
        studentId: data.studentId,
        species: data.species,
        breed: data.breed,
        age: data.ageUnit === 'year' ? data.age * 12 : data.age, // 转换为月
        weight: data.weight,
        gender: genderStringToNumber(data.gender),
        photoUrl: data.photoUrl || '/images/pets/default.jpg',
        description: data.description,
        ownerName: data.ownerName,
        ownerContact: data.ownerContact,
        isVaccinated: data.isVaccinated ? 1 : 0,
        vaccinationDate: data.vaccinationDate,
        isNeutered: data.isNeutered ? 1 : 0,
        healthStatus: data.healthStatus,
      };

      await petService.createPet(apiData);

      // 存储到 mock 数据用于本地显示
      mockPetData.push(data);
      showToast('宠物登记成功！', 'success');
      // 切换到列表视图
      setActiveTab('list');
      console.log('宠物登记数据:', apiData);
    } catch (error) {
      console.error('提交失败:', error);
      showToast(error instanceof Error ? error.message : '提交失败，请稍后重试', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 页面标题 */}
      <section className="py-12" style={{ backgroundColor: TIFFANY_LIGHT }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: TIFFANY_BLUE_DARK }}>
            宠物登记
          </h1>
          <p className="text-gray-600 text-lg">
            为您的爱宠办理入学手续
          </p>
        </div>
      </section>

      {/* 选项卡 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'form'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === 'form' ? { backgroundColor: TIFFANY_BLUE } : {}}
            >
              📝 填写登记表
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'list'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === 'list' ? { backgroundColor: TIFFANY_BLUE } : {}}
            >
              📋 登记记录
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'form' ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                {/* 说明卡片 */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: TIFFANY_LIGHT, border: `1px solid ${TIFFANY_BLUE}` }}>
                  <h3 className="font-medium mb-2" style={{ color: TIFFANY_BLUE_DARK }}>📌 登记须知</h3>
                  <ul className="text-sm space-y-1" style={{ color: TIFFANY_BLUE_DARK, opacity: 0.9 }}>
                    <li>• 请确保填写的信息真实有效</li>
                    <li>• 联系电话用于紧急情况联系，请保持畅通</li>
                    <li>• 疫苗接种证明可在审核时补交</li>
                    <li>• 审核结果将通过电话通知</li>
                  </ul>
                </div>

                <PetRegisterForm onSubmit={handleSubmit} />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  登记记录
                </h2>
                {mockPetData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500">暂无登记记录</p>
                    <button
                      onClick={() => setActiveTab('form')}
                      className="mt-4 px-4 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: TIFFANY_BLUE }}
                    >
                      去登记 →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockPetData.map((pet, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border flex gap-4"
                        style={{ backgroundColor: TIFFANY_LIGHT, borderColor: TIFFANY_BLUE }}
                      >
                        {/* 照片 */}
                        {pet.photoUrl ? (
                          <img
                            src={pet.photoUrl}
                            alt={pet.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl flex-shrink-0" style={{ backgroundColor: 'rgba(129, 199, 212, 0.3)' }}>
                            🐾
                          </div>
                        )}
                        {/* 信息 */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-gray-800">
                              {pet.name}
                              <span className="ml-2 text-sm text-gray-500">
                                ({pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                                {pet.gender === 'male' ? '♂️' : '♀️'})
                              </span>
                            </h3>
                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                              待审核
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            品种：{pet.breed || '未填写'} | 年龄：{pet.age}{pet.ageUnit === 'year' ? '岁' : '个月'} | 体重：{pet.weight}kg
                          </p>
                          <p className="text-sm text-gray-600">
                            主人：{pet.ownerName} | 联系方式：{pet.ownerContact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
