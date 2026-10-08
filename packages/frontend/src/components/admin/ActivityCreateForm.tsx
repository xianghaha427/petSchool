import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { uploadPhoto } from '@/services/fileService';
import { compressImage } from '@/utils/image';
import { useToast } from '@/components/ui/Toast';
import {
  ACTIVITY_THEME_KEYS,
  ACTIVITY_THEME_LABELS,
  DEFAULT_ACTIVITY_THEME,
  activityGradient,
} from '@/utils/activityTheme';
import type { ActivityTheme } from '@/utils/activityTheme';
import type { ActivityCreatePayload } from '@/types/activity';

interface ActivityCreateFormProps {
  onSubmit: (payload: ActivityCreatePayload) => Promise<void>;
}

interface ActivityCreateFormData {
  title: string;
  description: string;
  location: string;
  /** <input type="datetime-local"> 的值，形如 '2026-03-15T14:00'（只到分钟） */
  startAt: string;
  endAt: string;
  theme: ActivityTheme;
}

// 与后端 LocalFileStorageService 的扩展名白名单保持一致，提前拦掉 .gif 等
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
// 与 spring.servlet.multipart.max-file-size 同一个 5MB 边界
const MAX_COVER_BYTES = 5 * 1024 * 1024;

/**
 * datetime-local 的值只到分钟（'2026-03-15T14:00'），而后端 ActivityCreateDTO 上的
 * @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") 要求带秒。不补这一下，
 * 提交会被 Jackson 解析失败挡回来，报的还是"参数格式错误"这种看不出原因的信息。
 */
function toLocalIsoSeconds(value: string): string {
  if (!value) return '';
  return value.length === 16 ? `${value}:00` : value;
}

/** 从 apiClient 抛出的错误里取后端中文提示 */
function backendMessageOf(error: unknown): string | null {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || null;
}

export function ActivityCreateForm({ onSubmit }: ActivityCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ActivityCreateFormData>({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      startAt: '',
      endAt: '',
      theme: DEFAULT_ACTIVITY_THEME,
    },
  });

  // 实时预览选中的渐变色，跟首页卡片用同一份映射
  const selectedTheme = watch('theme');

  const handleCoverChange = async (file: File | null) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      const message = `封面图仅支持 ${ALLOWED_EXTENSIONS.join(' / ')} 格式`;
      setCoverError(message);
      showToast(message, 'error');
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      const message = '封面图不能超过 5MB';
      setCoverError(message);
      showToast(message, 'error');
      return;
    }

    // 先本地预览，不等上传完（压缩失败时 compressImage 会原样返回原文件，不抛错）
    setCoverPreview(URL.createObjectURL(file));
    setCoverError(null);
    setUploading(true);
    setCoverUrl(null);

    try {
      const compressed = await compressImage(file, 1280, 0.82);
      const result = await uploadPhoto(compressed);
      setCoverUrl(result.url);
    } catch (error) {
      console.error('封面上传失败:', error);
      const message = backendMessageOf(error) || '封面上传失败，可稍后重试';
      setCoverError(message);
      showToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClearCover = () => {
    setCoverUrl(null);
    setCoverPreview(null);
    setCoverError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = async (data: ActivityCreateFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        location: data.location.trim(),
        startAt: toLocalIsoSeconds(data.startAt),
        endAt: toLocalIsoSeconds(data.endAt),
        // 封面是选填的；上传中或上传失败时不带 coverUrl，让活动先建出来
        coverUrl: coverUrl || undefined,
        theme: data.theme,
      });
    } catch (error) {
      console.error('创建活动失败:', error);
      showToast(backendMessageOf(error) || '创建活动失败，请稍后重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 标题 */}
      <div>
        <label className={labelClass}>
          活动标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="例如：春季运动会"
          className={inputClass}
          {...register('title', {
            required: '请输入活动标题',
            maxLength: { value: 128, message: '活动标题不能超过 128 字' },
          })}
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* 简介 */}
      <div>
        <label className={labelClass}>活动简介</label>
        <textarea
          rows={3}
          placeholder="简单介绍活动内容，选填"
          className={`${inputClass} resize-none`}
          {...register('description', {
            maxLength: { value: 512, message: '活动简介不能超过 512 字' },
          })}
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      {/* 地点 */}
      <div>
        <label className={labelClass}>
          活动地点 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="例如：中央草坪"
          className={inputClass}
          {...register('location', {
            required: '请输入活动地点',
            maxLength: { value: 128, message: '活动地点不能超过 128 字' },
          })}
        />
        {errors.location && <p className={errorClass}>{errors.location.message}</p>}
      </div>

      {/* 起止时间 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            开始时间 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={inputClass}
            {...register('startAt', { required: '请选择开始时间' })}
          />
          {errors.startAt && <p className={errorClass}>{errors.startAt.message}</p>}
        </div>
        <div>
          <label className={labelClass}>
            结束时间 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={inputClass}
            {...register('endAt', {
              required: '请选择结束时间',
              validate: (value) => {
                const start = getValues('startAt');
                if (!value || !start) return true;
                return (
                  new Date(value).getTime() > new Date(start).getTime() ||
                  '结束时间必须晚于开始时间'
                );
              },
            })}
          />
          {errors.endAt && <p className={errorClass}>{errors.endAt.message}</p>}
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-3">
        开始时间之前用户可以报名；一旦到点，首页的报名按钮会自动变成「活动进行中」。
      </p>

      {/* 封面图 */}
      <div>
        <label className={labelClass}>活动封面（选填）</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
        />
        {coverPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={coverPreview} alt="封面预览" className="w-full h-44 object-cover" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-white/90 text-gray-700 text-sm hover:bg-white"
              >
                更换
              </button>
              <button
                type="button"
                onClick={handleClearCover}
                className="px-3 py-1 rounded-lg bg-white/90 text-red-500 text-sm hover:bg-white"
              >
                移除
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
                上传中...
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-500 transition-colors flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl">🖼</span>
            <span className="text-sm">点击上传封面图</span>
          </button>
        )}
        {coverError && <p className={errorClass}>{coverError}</p>}
        {!coverUrl && !coverError && (
          <p className="text-xs text-gray-400 mt-1">
            不上传也可以创建，卡片会用下方选定的主题渐变兜底。
          </p>
        )}
      </div>

      {/* 配色主题 */}
      <div>
        <label className={labelClass}>卡片配色</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ACTIVITY_THEME_KEYS.map((key) => (
            <label key={key} className="cursor-pointer">
              <input type="radio" value={key} className="peer sr-only" {...register('theme')} />
              <div
                className={`h-12 rounded-lg bg-gradient-to-r ${activityGradient(key)} opacity-60 peer-checked:opacity-100 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-gray-400 transition`}
              />
              <p className="text-center text-xs text-gray-500 mt-1">
                {ACTIVITY_THEME_LABELS[key]}
              </p>
            </label>
          ))}
        </div>
        {/* 选中效果预览，让配色选择所见即所得 */}
        <div className="mt-3 flex items-center gap-3">
          <div
            className={`w-20 h-10 rounded-lg bg-gradient-to-r ${activityGradient(selectedTheme)}`}
          />
          <span className="text-xs text-gray-400">卡片配色预览</span>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting || uploading}
        whileHover={{ y: isSubmitting ? 0 : -2 }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '创建中...' : uploading ? '封面上传中...' : '创建活动'}
      </motion.button>
    </form>
  );
}

export default ActivityCreateForm;
