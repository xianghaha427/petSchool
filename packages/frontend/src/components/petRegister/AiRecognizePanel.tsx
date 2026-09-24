import { motion } from 'framer-motion';
import type { PetRecognitionResult } from '@/types/ai';

// 蒂芙尼色主题色（与 PetRegisterForm 保持一致）
const TIFFANY_BLUE = '#81C7D4';
const TIFFANY_BLUE_DARK = '#5DA9B8';
const TIFFANY_LIGHT = '#E0F2F5';

export type AiRecognizeStatus = 'idle' | 'recognizing' | 'done' | 'failed';

interface AiRecognizePanelProps {
  status: AiRecognizeStatus;
  result: PetRecognitionResult | null;
  filledFields: string[];
  errorMessage?: string;
  onRetry: () => void;
}

const SPECIES_LABELS: Record<string, string> = {
  dog: '狗',
  cat: '猫',
  other: '其他',
};

interface InfoRow {
  label: string;
  value: string;
}

// 组装展示行，空值不展示
function buildRows(result: PetRecognitionResult): InfoRow[] {
  const rows: InfoRow[] = [];

  const speciesText = result.speciesLabel || SPECIES_LABELS[result.species] || '';
  if (speciesText) rows.push({ label: '种类', value: speciesText });

  if (result.breed) rows.push({ label: '品种', value: result.breed });

  const genderText =
    result.genderLabel || (result.gender === 1 ? '公' : result.gender === 2 ? '母' : '');
  if (genderText) rows.push({ label: '性别', value: genderText });

  if (result.color) rows.push({ label: '毛色', value: result.color });

  const ageText =
    result.ageStage ||
    (typeof result.ageMonths === 'number' ? `约 ${result.ageMonths} 个月` : '');
  if (ageText) rows.push({ label: '年龄段', value: ageText });

  return rows;
}

/**
 * AI 识别结果面板：idle / recognizing / done / failed 四态。
 * 任何失败都只做温和提示，不遮挡表单、不弹窗。
 */
export function AiRecognizePanel({
  status,
  result,
  filledFields,
  errorMessage,
  onRetry,
}: AiRecognizePanelProps) {
  if (status === 'idle') return null;

  // 识别中：明确告知耗时，并强调可以同时手动填写，避免用户干等
  if (status === 'recognizing') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ backgroundColor: TIFFANY_LIGHT, border: `1px solid ${TIFFANY_BLUE}` }}
      >
        <span
          className="flex-shrink-0 w-4 h-4 rounded-full border-2 animate-spin"
          style={{ borderColor: TIFFANY_BLUE, borderTopColor: 'transparent' }}
        />
        <div className="text-sm" style={{ color: TIFFANY_BLUE_DARK }}>
          <p className="font-medium">AI 识别中…（约 3~10 秒）</p>
          <p className="opacity-80">照片同步上传中，您也可以直接手动填写下方信息</p>
        </div>
      </motion.div>
    );
  }

  // 失败：浅黄 info 条，不红屏、不弹窗
  if (status === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200"
      >
        <span className="text-lg flex-shrink-0">💡</span>
        <div className="text-sm text-amber-800 flex-1 min-w-[12rem]">
          <p className="font-medium">{errorMessage || 'AI 暂时不可用，请手动填写'}</p>
          <p className="text-amber-700/80">不影响提交，手动填写即可</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
        >
          重试
        </button>
      </motion.div>
    );
  }

  // 成功
  if (!result) return null;
  const rows = buildRows(result);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 px-4 py-3 rounded-lg"
      style={{ border: `1px solid ${TIFFANY_BLUE}`, backgroundColor: TIFFANY_LIGHT }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: TIFFANY_BLUE_DARK }}>
          <span>✨</span> AI 识别结果
        </h4>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs px-3 py-1 rounded-lg font-medium bg-white transition-opacity hover:opacity-80"
          style={{ color: TIFFANY_BLUE_DARK, border: `1px solid ${TIFFANY_BLUE}` }}
        >
          重新识别
        </button>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          {rows.map((row) => (
            <span key={row.label}>
              <span className="text-gray-500">{row.label}：</span>
              <span className="font-medium">{row.value}</span>
            </span>
          ))}
        </div>
      )}

      {filledFields.length > 0 && (
        <p className="mt-2 text-xs" style={{ color: TIFFANY_BLUE_DARK }}>
          已回填：{filledFields.join('、')}（已手动填写的字段不会被覆盖）
        </p>
      )}

      {result.degraded && (
        <p className="mt-2 text-xs text-amber-700">AI 服务当前处于降级状态，结果可能不够准确</p>
      )}

      {result.tips && <p className="mt-2 text-xs text-gray-600">{result.tips}</p>}

      <p className="mt-2 text-xs text-gray-500">AI 识别结果仅供参考，请核对后提交</p>

      {result.model && (
        <p className="mt-1 text-xs text-gray-400">
          由 {result.model} 识别
          {typeof result.confidence === 'number'
            ? ` · 置信度 ${Math.round(result.confidence * 100)}%`
            : ''}
        </p>
      )}
    </motion.div>
  );
}

export default AiRecognizePanel;
