import { motion } from 'framer-motion';
import type { PetHealthAdviceResult } from '@/types/ai';

// 蒂芙尼色主题色（与 AiRecognizePanel 保持一致）
const TIFFANY_BLUE = '#81C7D4';
const TIFFANY_BLUE_DARK = '#5DA9B8';
const TIFFANY_LIGHT = '#E0F2F5';

export type HealthAdviceStatus = 'idle' | 'generating' | 'done' | 'failed';

interface HealthAdvicePanelProps {
  status: HealthAdviceStatus;
  result: PetHealthAdviceResult | null;
  errorMessage?: string;
  onRetry: () => void;
}

/**
 * AI 养护建议结果面板：idle / generating / done / failed 四态。
 *
 * 与识别面板一样，失败只做温和提示：浅黄 info 条 + 重试，不红屏、不弹窗，
 * 更不能影响详情页其它内容的浏览。
 */
export function HealthAdvicePanel({
  status,
  result,
  errorMessage,
  onRetry,
}: HealthAdvicePanelProps) {
  if (status === 'idle') return null;

  // 生成中：先说明要等多久，避免用户在详情页上干等
  if (status === 'generating') {
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
          <p className="font-medium">AI 正在生成养护建议…（约 3~10 秒）</p>
          <p className="opacity-80">页面其它内容不受影响，可以先继续浏览</p>
        </div>
      </motion.div>
    );
  }

  // 失败：浅黄 info 条。养护建议是锦上添花，出问题不该按错误处理
  if (status === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200"
      >
        <span className="text-lg flex-shrink-0">💡</span>
        <div className="text-sm text-amber-800 flex-1 min-w-[12rem]">
          <p className="font-medium">{errorMessage || 'AI 暂时不可用，请稍后再试'}</p>
          <p className="text-amber-700/80">不影响浏览，可以稍后再试</p>
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

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 px-4 py-4 rounded-lg"
      style={{ border: `1px solid ${TIFFANY_BLUE}`, backgroundColor: TIFFANY_LIGHT }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: TIFFANY_BLUE_DARK }}>
          <span>✨</span> AI 养护建议
        </h4>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs px-3 py-1 rounded-lg font-medium bg-white transition-opacity hover:opacity-80"
          style={{ color: TIFFANY_BLUE_DARK, border: `1px solid ${TIFFANY_BLUE}` }}
        >
          重新生成
        </button>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result.advice}</p>

      {/* 免责声明独立渲染：它是后端固定给的常量，正文被截断也删不掉它，不能拼进正文 */}
      <p className="mt-3 pt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        {result.disclaimer}
      </p>

      {result.degraded && (
        <p className="mt-2 text-xs text-amber-700">当前为演示数据（未调用真实模型）</p>
      )}

      {result.model && !result.degraded && (
        <p className="mt-2 text-xs text-gray-400">由 {result.model} 生成</p>
      )}
    </motion.div>
  );
}

export default HealthAdvicePanel;
