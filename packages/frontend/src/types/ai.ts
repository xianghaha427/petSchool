// AI 识别与图片上传相关类型定义

/**
 * 图片上传结果，对应后端 com.petschool.vo.FileUploadVO（/api/files/upload）
 */
export interface FileUploadResult {
  /** 可直接用于展示的访问地址，形如 /api/uploads/20260928_ab12cd34.jpg */
  url: string;
  /** 服务端生成的文件名 */
  filename: string;
  /** 文件大小（字节） */
  size: number;
}

// AI 宠物识别结果（/api/ai/pet-recognize）
export interface PetRecognitionResult {
  isPet: boolean;
  species: 'dog' | 'cat' | 'other';
  speciesLabel?: string;
  /** 具体品种名，已是干净值（不含「可能是」这类前缀），可直接回填 */
  breed?: string | null;
  /** breed 是否为推测结果。为 true 时展示成「可能是XX」，但回填的仍是 breed 本身 */
  breedApprox?: boolean;
  gender?: 1 | 2 | null;
  genderLabel?: string | null;
  color?: string | null;
  ageMonths?: number | null;
  ageStage?: string | null;
  confidence?: number | null;
  tips?: string | null;
  model?: string;
  degraded?: boolean;   // AI 服务降级时返回，结果可能不可靠
}

// AI 生成简介请求体（/api/ai/pet-description）
export interface PetDescriptionPayload {
  name?: string;
  species?: string;
  breed?: string;
  ageMonths?: number;
  gender?: number;      // 1-公，2-母
  color?: string;
  keywords?: string;
}

// AI 生成养护建议请求体（/api/ai/pet-health-advice）
export interface PetHealthAdvicePayload {
  name?: string;
  species?: string;
  breed?: string;
  /** 月龄。注意单位是「月」，直接用 pet.age，不要换算成岁 */
  ageMonths?: number;
  gender?: number;        // 1-公，2-母
  weight?: number;        // kg
  /**
   * 三态：1-是，0-否。undefined 表示「未填写」，不是「否」——
   * 后端据此决定要不要把这一条写进提示词，编错了会误导主人。
   */
  isVaccinated?: number;
  isNeutered?: number;
  healthStatus?: string;
}

// AI 养护建议结果（/api/ai/pet-health-advice）
export interface PetHealthAdviceResult {
  /** 建议正文，单段纯文本（后端已压掉换行、剥掉 markdown） */
  advice: string;
  /**
   * 免责声明。由后端固定给出、不经过模型，因此正文被超长截断时它依然完整，
   * 必须独立渲染，不要拼进 advice 里。
   */
  disclaimer: string;
  model?: string;
  /** 后端跑在 mock 客户端上时返回，UI 应标注「当前为演示数据」 */
  degraded?: boolean;
}

/**
 * AI 相关业务错误码。
 * 后端以 HTTP 200 + body.code !== 200 返回，因此这些码不代表"请求失败"，
 * 而是"AI 没帮上忙"，UI 上应使用温和的 info 提示，而非 error。
 */
export const AI_ERROR_CODES = {
  UNAVAILABLE: 1004,
  RECOGNIZE_FAILED: 1005,
  GENERATE_FAILED: 1007,
} as const;

/**
 * 业务错误（code !== 200）的统一异常类型。
 * 因为 apiClient 的响应拦截器不会因业务错误码 reject，各 service 需自行抛出本异常，
 * 调用方可通过 instanceof 判断并区分 AI 的"软失败"与真实错误。
 */
export class AiServiceError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
  }
}

/**
 * 取出错误的业务码；取不到返回 null。
 *
 * 不要用 `instanceof AiServiceError` 判断：apiClient 的响应拦截器在 body.code !== 200 时
 * 已经先 reject 了 ApiError，各 service 里那句 `throw new AiServiceError` 根本执行不到。
 * 这里用鸭子类型同时兼容 ApiError 与 AiServiceError，不依赖具体实现。
 *
 * 同时校验类型是 number：axios 自身的超时/断网错误也有 code，但那是
 * 'ECONNABORTED' / 'ERR_NETWORK' 这类字符串，必须与后端的业务码区分开。
 */
export function aiErrorCodeOf(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'number' ? code : null;
}

/**
 * 是否为 AI 的"软失败"——后端确实回应了，只是 AI 没帮上忙。
 * 这类情况不该按错误处理，应给温和的 info 提示。
 *
 * 1005 也要算进来：它本意是"识别失败"，但 DashScopeAiClient 在空响应和
 * 未预期异常时同样抛 1005，所以不能想当然地按名字归类。
 */
export const AI_SOFT_ERROR_CODES: readonly number[] = [
  AI_ERROR_CODES.UNAVAILABLE,
  AI_ERROR_CODES.RECOGNIZE_FAILED,
  AI_ERROR_CODES.GENERATE_FAILED,
];

export function isAiSoftError(error: unknown): boolean {
  const code = aiErrorCodeOf(error);
  return code !== null && AI_SOFT_ERROR_CODES.includes(code);
}

/**
 * 取后端返回的中文 message；取不到返回空串，由调用方退回自己的兜底文案。
 *
 * 只在拿到数字业务码时才认这句话：超时、断网时 axios 的 message 是
 * "Network Error" 这种英文串，直接展示给用户等于没提示。
 */
export function aiErrorMessageOf(error: unknown): string {
  if (aiErrorCodeOf(error) === null) return '';
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message.trim() : '';
}
