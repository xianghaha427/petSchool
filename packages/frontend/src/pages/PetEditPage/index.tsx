import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { petService, Pet } from '@/services/petService';
import { TIFFY_BLUE, TIFFY_BLUE_DARK, TIFFY_LIGHT } from '@/styles/theme';

const TIFFANY_BLUE = TIFFY_BLUE;
const TIFFANY_BLUE_DARK = TIFFY_BLUE_DARK;
const TIFFANY_LIGHT = TIFFY_LIGHT;

export default function PetEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pet, setPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: 0,
    weight: 0,
    gender: 1,
    photoUrl: '',
    description: '',
    ownerName: '',
    ownerContact: '',
    isVaccinated: 0,
    isNeutered: 0,
    healthStatus: '',
  });

  useEffect(() => {
    loadPet();
  }, [id]);

  const loadPet = async () => {
    if (!id) return;
    try {
      const data = await petService.getPetById(Number(id));
      setPet(data);
      setFormData({
        name: data.name || '',
        species: data.species || '',
        breed: data.breed || '',
        age: data.age || 0,
        weight: Number(data.weight) || 0,
        gender: data.gender || 1,
        photoUrl: data.photoUrl || '',
        description: data.description || '',
        ownerName: data.ownerName || '',
        ownerContact: data.ownerContact || '',
        isVaccinated: data.isVaccinated || 0,
        isNeutered: data.isNeutered || 0,
        healthStatus: data.healthStatus || '',
      });
    } catch (error) {
      console.error('获取宠物信息失败', error);
      setMsg('获取宠物信息失败');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      await petService.updateMyPet(Number(id), formData);
      setMsg('更新成功');
      setTimeout(() => navigate('/my-pets'), 1500);
    } catch (error) {
      setMsg('更新失败');
    }
    setSaving(false);
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
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">编辑萌宠</h1>
            <button
              onClick={() => navigate('/my-pets')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 返回
            </button>
          </div>

          {msg && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-lg text-center">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 照片预览 */}
            {formData.photoUrl && (
              <div className="flex justify-center">
                <img
                  src={formData.photoUrl}
                  alt={formData.name}
                  className="w-32 h-32 object-cover rounded-full"
                />
              </div>
            )}

            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">宠物姓名 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">种类 *</label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="狗">🐕 狗</option>
                  <option value="猫">🐱 猫</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品种</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性别 *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={1}>♂️ 公</option>
                  <option value={2}>♀️ 母</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年龄（月）</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">体重（kg）</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">照片URL</label>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* 主人信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主人姓名</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系方式</label>
                <input
                  type="text"
                  name="ownerContact"
                  value={formData.ownerContact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* 健康信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">是否已接种疫苗</label>
                <select
                  name="isVaccinated"
                  value={formData.isVaccinated}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>否</option>
                  <option value={1}>是</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">是否已绝育</label>
                <select
                  name="isNeutered"
                  value={formData.isNeutered}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>否</option>
                  <option value={1}>是</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">健康状况</label>
              <input
                type="text"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 text-white rounded-lg transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-pets')}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
