import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import type { PetRegisterFormData } from '@/types/pet';
import type { PetRecognitionResult } from '@/types/ai';
import { AI_ERROR_CODES, aiErrorCodeOf, aiErrorMessageOf } from '@/types/ai';
import { useToast } from '@/components/ui/Toast';
import { AiRecognizePanel } from './AiRecognizePanel';
import type { AiRecognizeStatus } from './AiRecognizePanel';
import { uploadPhoto } from '@/services/fileService';
import { recognizePet, generateDescription } from '@/services/aiService';
import { compressImage } from '@/utils/image';
import { mapRecognitionToForm, ageToMonths, RECOGNITION_FIELD_LABELS } from '@/utils/aiMapping';
import { genderStringToNumber } from '@/utils/petUtils';

interface PetRegisterFormProps {
  onSubmit: (data: PetRegisterFormData) => Promise<void>;
}

// 蒂芙尼色主题色
const TIFFANY_BLUE = '#81C7D4';
const TIFFANY_BLUE_DARK = '#5DA9B8';
const TIFFANY_LIGHT = '#E0F2F5';

// 与后端 LocalFileStorageService 的扩展名白名单保持一致，提前拦掉 .gif 等
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
// 与 spring.servlet.multipart.max-file-size、pet.upload.max-bytes 同一个 5MB 边界
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function PetRegisterForm({ onSubmit }: PetRegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // ===== AI 识别 / 照片上传相关状态 =====
  const [recognizing, setRecognizing] = useState(false);
  const [recognizeResult, setRecognizeResult] = useState<PetRecognitionResult | null>(null);
  const [recognizeError, setRecognizeError] = useState<string | null>(null);
  const [filledFields, setFilledFields] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  // 上传失败的具体原因，提交被拦下时要告诉用户为什么
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  // 提交时可 await 的上传 Promise（用来拿到最终可用的照片 URL）
  const uploadPromiseRef = useRef<Promise<string | null> | null>(null);
  // 上一次已发起识别的原始 File，保证同一个 File 只识别一次，避免重复消耗 AI 额度
  const lastProcessedFileRef = useRef<File | null>(null);
  // 真正送去上传/识别的文件（压缩后的）
  const processFileRef = useRef<File | null>(null);
  // 处理轮次令牌：换照片/删照片后自增，用于丢弃过期请求的回写
  const processTokenRef = useRef(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields },
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

  // dirtyFields 的最新值镜像：识别是异步的（约 3~10 秒），
  // 完成时闭包里捕获的 dirtyFields 可能已过期，直接用它判断会误覆盖用户刚手填的内容
  const dirtyFieldsRef = useRef<Record<string, boolean | undefined>>({});
  useEffect(() => {
    dirtyFieldsRef.current = dirtyFields as unknown as Record<string, boolean | undefined>;
  }, [dirtyFields]);

  // 面板状态：识别中优先，其次有结果，再其次失败
  const recognizeStatus: AiRecognizeStatus = recognizing
    ? 'recognizing'
    : recognizeResult
      ? 'done'
      : recognizeError
        ? 'failed'
        : 'idle';

  // 后端业务错误的中文 message 优先展示，拿不到（网络错误等）再退回本地兜底文案。
  // 原先用 `instanceof AiServiceError` 恒为 false：apiClient 的拦截器在 body.code !== 200 时
  // 先 reject 了 ApiError，aiService 里那句 throw new AiServiceError 根本执行不到，
  // 于是后端返回的中文提示一直被丢掉。
  const backendMessageOf = (error: unknown): string => aiErrorMessageOf(error);

  // AI 失败/没帮上忙的统一收尾（面板 failed 态 + 温和 info 提示）
  const setRecognizeFailed = (message: string) => {
    setRecognizeResult(null);
    setFilledFields([]);
    setRecognizeError(message);
    showToast(message, 'info');
  };

  // AI 没帮上忙（1004/1005）不算"错误"，统一走温和的 info 提示，不用 error 红字。
  // 文案优先用后端返回的中文 message，拿不到（网络错误等）再退回本地兜底文案。
  const handleRecognizeFailure = (error: unknown) => {
    const fallback =
      aiErrorCodeOf(error) === AI_ERROR_CODES.RECOGNIZE_FAILED
        ? 'AI 没能识别出宠物，请手动填写或换一张照片'
        : 'AI 暂时不可用，请手动填写';
    setRecognizeFailed(backendMessageOf(error) || fallback);
  };

  // 把识别结果写回表单；用户已手动填过的字段不覆盖
  const applyRecognition = (result: PetRecognitionResult) => {
    if (!result.isPet) {
      setRecognizeFailed('AI 没能识别出宠物，请手动填写或换一张照片');
      return;
    }

    const { values } = mapRecognitionToForm(result);
    const dirty = dirtyFieldsRef.current;
    const appliedKeys: string[] = [];

    if (values.species !== undefined && !dirty.species) {
      setValue('species', values.species, { shouldDirty: false, shouldValidate: true });
      appliedKeys.push('species');
    }
    if (values.breed !== undefined && !dirty.breed) {
      setValue('breed', values.breed, { shouldDirty: false, shouldValidate: true });
      appliedKeys.push('breed');
    }
    if (values.gender !== undefined && !dirty.gender) {
      setValue('gender', values.gender, { shouldDirty: false, shouldValidate: true });
      appliedKeys.push('gender');
    }
    // 用户填过年龄或改过单位就都不动，避免把"3 个月"改成"3 岁"
    if (values.age !== undefined && !dirty.age && !dirty.ageUnit) {
      setValue('age', values.age, { shouldDirty: false, shouldValidate: true });
      appliedKeys.push('age');
      if (values.ageUnit !== undefined) {
        setValue('ageUnit', values.ageUnit, { shouldDirty: false, shouldValidate: true });
        appliedKeys.push('ageUnit');
      }
    }

    setRecognizeResult(result);
    setRecognizeError(null);
    setFilledFields(
      Array.from(new Set(appliedKeys.map((key) => RECOGNITION_FIELD_LABELS[key]).filter(Boolean)))
    );
  };

  // 上传照片（可单独重试）
  const runUpload = (file: File, token: number) => {
    setUploading(true);
    const task = uploadPhoto(file)
      .then((result) => {
        // 期间用户换/删了照片，丢弃这次结果
        if (processTokenRef.current !== token) return null;
        setUploadedUrl(result.url);
        setUploadError(null);
        return result.url;
      })
      .catch((error) => {
        console.error('照片上传失败:', error);
        if (processTokenRef.current === token) {
          const message = backendMessageOf(error) || '照片上传失败，请重新上传';
          setUploadError(message);
          // 照片是必填项，这里不能再说"可直接提交"，否则用户点了才发现被拦
          showToast(message, 'error');
        }
        return null;
      })
      .finally(() => {
        if (processTokenRef.current === token) setUploading(false);
      });
    uploadPromiseRef.current = task;
    return task;
  };

  // AI 识别（可单独重试）
  const runRecognize = (file: File, token: number) => {
    setRecognizing(true);
    setRecognizeError(null);
    return recognizePet(file)
      .then((result) => {
        if (processTokenRef.current !== token) return null;
        applyRecognition(result);
        return result;
      })
      .catch((error) => {
        if (processTokenRef.current !== token) return null;
        handleRecognizeFailure(error);
        return null;
      })
      .finally(() => {
        if (processTokenRef.current === token) setRecognizing(false);
      });
  };

  // 压缩后并发发起"上传"和"识别"，两者各自软失败，互不影响
  const startProcessPhoto = async (file: File, token: number) => {
    // 压缩失败时 compressImage 会原样返回原文件，不会抛错，因此不会阻断流程
    const compressed = await compressImage(file);
    if (processTokenRef.current !== token) return;
    processFileRef.current = compressed;
    void runUpload(compressed, token);
    void runRecognize(compressed, token);
  };

  // 失败重试：缺照片就补上传，同时重试识别
  const handleRetry = () => {
    const file = processFileRef.current;
    if (!file) {
      showToast('请重新选择照片后再试', 'info');
      return;
    }
    const token = processTokenRef.current;
    if (!uploadedUrl && !uploading) void runUpload(file, token);
    void runRecognize(file, token);
  };

  // 仅重试上传
  const handleRetryUpload = () => {
    const file = processFileRef.current;
    if (!file) return;
    void runUpload(file, processTokenRef.current);
  };

  // 重置所有与照片相关的状态（换照片 / 删除照片时）
  const resetPhotoState = () => {
    processTokenRef.current += 1;
    uploadPromiseRef.current = null;
    processFileRef.current = null;
    setUploading(false);
    setUploadedUrl(null);
    setUploadError(null);
    setRecognizeResult(null);
    setRecognizeError(null);
    setFilledFields([]);
  };

  // 处理图片选择
  const handlePhotoChange = (file: File | null) => {
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }

    // 验证扩展名：后端只收 jpg/jpeg/png/webp，.gif 这类在这里就拦下，
    // 否则要等传到后端才以 400 弹回来（compressImage 对 GIF 也是原样放行）
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showToast(`仅支持 ${ALLOWED_EXTENSIONS.join(' / ').toUpperCase()} 格式的图片`, 'error');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > MAX_PHOTO_BYTES) {
      showToast(`图片大小不能超过 ${MAX_PHOTO_BYTES / 1024 / 1024}MB`, 'error');
      return;
    }

    // 即时预览（保持原有体验）
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 同一个 File 只识别一次，防止 onChange 抖动导致重复调用烧掉 AI 额度
    if (lastProcessedFileRef.current === file) return;
    lastProcessedFileRef.current = file;

    resetPhotoState();
    const token = processTokenRef.current;
    void startProcessPhoto(file, token);
  };

  // 用当前已填信息生成简介
  const handleGenerateDescription = async () => {
    setGeneratingDesc(true);
    try {
      const gender = watch('gender');
      const text = await generateDescription({
        name: watch('name') || undefined,
        species: watch('species') || undefined,
        breed: watch('breed') || undefined,
        ageMonths: ageToMonths(watch('age'), watch('ageUnit')),
        gender: gender ? genderStringToNumber(gender) : undefined,
        color: recognizeResult?.color || undefined,
        keywords: watch('description') || undefined,
      });

      if (text) {
        setValue('description', text, { shouldDirty: true, shouldValidate: true });
      } else {
        showToast('AI 没能生成简介，请手动填写', 'info');
      }
    } catch (error) {
      console.error('生成简介失败:', error);
      showToast(backendMessageOf(error) || 'AI 暂时不可用，请手动填写简介', 'info');
    } finally {
      setGeneratingDesc(false);
    }
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
      // 使用真实上传返回的 URL；若上传还在进行中就等它结束
      let photoUrl = uploadedUrl;
      if (!photoUrl && uploadPromiseRef.current) {
        photoUrl = await uploadPromiseRef.current;
      }
      // 照片必填：没有可用的上传结果就不提交。
      // 原先这里是 photoUrl || data.photoUrl || '' —— 而 photoUrl 从未被 register()
      // 进表单，恒为 undefined，所以兜底只等于"允许存一条没有照片的记录"，
      // 而 pet.photo_url 是 NOT NULL，列表页/详情页又是无条件 <img src>，会渲染成裂图。
      if (!photoUrl) {
        showToast(uploadError || '照片尚未上传成功，请点「重新上传」后再提交', 'error');
        return;
      }
      await onSubmit({ ...data, photoUrl });
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
          <span>📷</span> 宠物照片 <span className="text-red-500">*</span>
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
            accept="image/jpeg,image/png,image/webp"
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
                  lastProcessedFileRef.current = null;
                  resetPhotoState();
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
              <p className="text-gray-500 text-sm mb-4">支持 JPG、PNG、WEBP 格式，最大 5MB</p>
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

        {/* 照片上传状态 */}
        {photoFile && uploading && (
          <p className="mt-3 text-sm text-gray-500">照片上传中…</p>
        )}
        {photoFile && !uploading && uploadedUrl && (
          <p className="mt-3 text-sm" style={{ color: TIFFANY_BLUE_DARK }}>
            照片已上传 ✓
          </p>
        )}
        {photoFile && !uploading && !uploadedUrl && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-red-600">{uploadError || '照片上传失败'}，请重新上传后再提交</span>
            <button
              type="button"
              onClick={handleRetryUpload}
              className="text-xs px-2.5 py-1 rounded-lg font-medium bg-white"
              style={{ color: TIFFANY_BLUE_DARK, border: `1px solid ${TIFFANY_BLUE}` }}
            >
              重新上传
            </button>
          </div>
        )}

        {/* AI 识别结果 / 状态 */}
        <AiRecognizePanel
          status={recognizeStatus}
          result={recognizeResult}
          filledFields={filledFields}
          errorMessage={recognizeError || undefined}
          onRetry={handleRetry}
        />
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              简介
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDesc}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                backgroundColor: TIFFANY_LIGHT,
                color: TIFFANY_BLUE_DARK,
                border: `1px solid ${TIFFANY_BLUE}`,
              }}
            >
              {generatingDesc ? '生成中…' : '✨ AI 生成'}
            </button>
          </div>
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
          disabled={isSubmitting || uploading || (!!photoFile && !uploadedUrl)}
          className="w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: TIFFANY_BLUE, color: 'white' }}
        >
          {isSubmitting ? '提交中...' : uploading ? '照片上传中...' : '提交登记'}
        </button>
        {!!photoFile && !uploadedUrl && !uploading && (
          <p className="mt-2 text-center text-sm text-red-600">
            照片尚未上传成功，请点「重新上传」后再提交
          </p>
        )}
      </div>
    </form>
  );
}
