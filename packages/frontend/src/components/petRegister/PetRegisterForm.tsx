import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import type { PetRegisterFormData } from '@/types/pet';
import { useToast } from '@/components/ui/Toast';

interface PetRegisterFormProps {
  onSubmit: (data: PetRegisterFormData) => Promise<void>;
}

// 蒂芙尼色主题色
const TIFFANY_BLUE = '#81C7D4';
const TIFFANY_BLUE_DARK = '#5DA9B8';
const TIFFANY_LIGHT = '#E0F2F5';

export function PetRegisterForm({ onSubmit }: PetRegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PetRegisterFormData>({
    defaultValues: {
      species: 'dog',
      gender: 'male',
      ageUnit: 'year',
      isVaccinated: false,
      isNeutered: false,
    },
  });

  const species = watch('species');
  const isVaccinated = watch('isVaccinated');

  // 处理图片选择
  const handlePhotoChange = (file: File | null) => {
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB', 'error');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoChange(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = async (data: PetRegisterFormData) => {
    setIsSubmitting(true);
    try {
      const finalData = {
        ...data,
        photoUrl: photoPreview || data.photoUrl || '',
      };
      await onSubmit(finalData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
        style={{ backgroundColor: TIFFANY_LIGHT }}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: TIFFANY_BLUE_DARK }}>登记成功！</h3>
        <p className="text-gray-600 mb-6">您的宠物信息已提交，我们会尽快审核。</p>
        <button
          onClick={() => {
            setSubmitSuccess(false);
            window.location.reload();
          }}
          className="px-6 py-2 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: TIFFANY_BLUE, color: 'white' }}
        >
          继续登记
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 宠物照片上传 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: TIFFANY_BLUE_DARK }}>
          <span>📷</span> 宠物照片
        </h3>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : ''
          }`}
          style={{ borderColor: dragActive ? undefined : TIFFANY_BLUE, backgroundColor: dragActive ? undefined : TIFFANY_LIGHT }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          {photoPreview ? (
            <div className="relative inline-block">
              <img
                src={photoPreview}
                alt="宠物照片预览"
                className="max-h-64 rounded-lg shadow-lg mx-auto"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-gray-700 font-medium mb-2">点击或拖拽上传宠物照片</p>
              <p className="text-gray-500 text-sm mb-4">支持 JPG、PNG 格式，最大 5MB</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: TIFFANY_BLUE, color: 'white' }}
              >
                选择照片
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 基本信息 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: TIFFANY_BLUE_DARK }}>
          <span>🐾</span> 基本信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 宠物姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              宠物姓名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: '请输入宠物姓名' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              placeholder="例如：小白"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 种类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              种类 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('species', { required: '请选择种类' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
            >
              <option value="dog">🐕 狗</option>
              <option value="cat">🐱 猫</option>
              <option value="other">其他</option>
            </select>
            {errors.species && (
              <p className="mt-1 text-sm text-red-500">{errors.species.message}</p>
            )}
          </div>

          {/* 品种 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              品种
            </label>
            <input
              {...register('breed')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              placeholder={species === 'dog' ? '例如：金毛' : species === 'cat' ? '例如：布偶' : '例如：仓鼠'}
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性别 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  {...register('gender', { required: '请选择性别' })}
                  className="w-4 h-4"
                  style={{ color: TIFFANY_BLUE }}
                />
                <span>♂️ 公</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  {...register('gender', { required: '请选择性别' })}
                  className="w-4 h-4"
                  style={{ color: TIFFANY_BLUE }}
                />
                <span>♀️ 母</span>
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>

          {/* 年龄 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年龄 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register('age', {
                  required: '请输入年龄',
                  valueAsNumber: true,
                  min: { value: 0, message: '年龄不能为负数' },
                })}
                type="number"
                min="0"
                step="0.1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
                placeholder="0"
              />
              <Controller
                name="ageUnit"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
                  >
                    <option value="year">岁</option>
                    <option value="month">个月</option>
                  </select>
                )}
              />
            </div>
            {errors.age && (
              <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          {/* 体重 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              体重 (kg) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('weight', {
                required: '请输入体重',
                valueAsNumber: true,
                min: { value: 0, message: '体重不能为负数' },
              })}
              type="number"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              placeholder="0.0"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-500">{errors.weight.message}</p>
            )}
          </div>
        </div>

        {/* 简介 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            简介
          </label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
            placeholder="介绍一下您的宠物吧，比如性格特点、特长等"
          />
        </div>
      </section>

      {/* 主人信息 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: TIFFANY_BLUE_DARK }}>
          <span>👤</span> 主人信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 主人姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主人姓名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('ownerName', { required: '请输入主人姓名' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              placeholder="您的姓名"
            />
            {errors.ownerName && (
              <p className="mt-1 text-sm text-red-500">{errors.ownerName.message}</p>
            )}
          </div>

          {/* 联系方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              联系方式 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('ownerContact', {
                required: '请输入联系方式',
                pattern: {
                  value: /^1[3-9]\d{9}$/,
                  message: '请输入正确的手机号码',
                },
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              placeholder="手机号码"
            />
            {errors.ownerContact && (
              <p className="mt-1 text-sm text-red-500">{errors.ownerContact.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* 健康信息 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: TIFFANY_BLUE_DARK }}>
          <span>💉</span> 健康信息
        </h3>
        <div className="space-y-4">
          {/* 疫苗接种 */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: TIFFANY_LIGHT }}>
            <div>
              <label className="font-medium" style={{ color: TIFFANY_BLUE_DARK }}>是否已接种疫苗</label>
              <p className="text-sm mt-1" style={{ color: TIFFANY_BLUE_DARK, opacity: 0.8 }}>
                接种疫苗有助于保护宠物健康
              </p>
            </div>
            <Controller
              name="isVaccinated"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    field.value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      field.value ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              )}
            />
          </div>

          {/* 疫苗接种日期（仅当已接种时显示） */}
          {isVaccinated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="ml-4"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最近接种日期
              </label>
              <input
                {...register('vaccinationDate')}
                type="date"
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              />
            </motion.div>
          )}

          {/* 绝育状态 */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: TIFFANY_LIGHT }}>
            <div>
              <label className="font-medium" style={{ color: TIFFANY_BLUE_DARK }}>是否已绝育</label>
              <p className="text-sm mt-1" style={{ color: TIFFANY_BLUE_DARK, opacity: 0.8 }}>
                绝育有助于宠物长期健康
              </p>
            </div>
            <Controller
              name="isNeutered"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    field.value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      field.value ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              )}
            />
          </div>

          {/* 健康状况说明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              健康状况说明
            </label>
            <textarea
              {...register('healthStatus')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': TIFFANY_BLUE } as React.CSSProperties}
              placeholder="如有特殊健康状况或需要注意的事项，请在此说明"
            />
          </div>
        </div>
      </section>

      {/* 提交按钮 */}
      <div className="pt-6 border-t" style={{ borderColor: TIFFANY_LIGHT }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: TIFFANY_BLUE, color: 'white' }}
        >
          {isSubmitting ? '提交中...' : '提交登记'}
        </button>
      </div>
    </form>
  );
}
