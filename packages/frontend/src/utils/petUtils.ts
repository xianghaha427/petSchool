// 宠物相关的工具函数

// 性别常量
export const Gender = {
  MALE: 1,
  FEMALE: 2,
} as const;

export type GenderType = 1 | 2;

/**
 * 将后端性别数字转换为前端显示标签
 */
export function getGenderLabel(gender: number | undefined): string {
  if (gender === Gender.MALE) return '公';
  if (gender === Gender.FEMALE) return '母';
  return '未知';
}

/**
 * 将后端性别数字转换为 emoji 符号
 */
export function getGenderEmoji(gender: number | undefined): string {
  if (gender === Gender.MALE) return '♂️';
  if (gender === Gender.FEMALE) return '♀️';
  return '⚥';
}

/**
 * 将表单性别字符串转换为后端数字
 */
export function genderStringToNumber(gender: 'male' | 'female' | string): number {
  if (gender === 'male' || gender === '1') return Gender.MALE;
  if (gender === 'female' || gender === '2') return Gender.FEMALE;
  return Gender.MALE; // 默认值
}

/**
 * 将后端性别数字转换为表单字符串
 */
export function genderNumberToString(gender: number): 'male' | 'female' {
  return gender === Gender.FEMALE ? 'female' : 'male';
}

/**
 * 把库里的历史写法归一到表单/接口统一使用的 dog / cat / other。
 *
 * 早期手工登记的数据存的是中文「狗」「猫」，后来登记表单和 AI 识别统一成了
 * dog/cat，库里因此一度两种写法并存。这里只负责把已知的中文别名映射过去，
 * 认不出来的值原样返回——不擅自改写成 other，免得把兔子之类静默标错。
 */
export function normalizeSpeciesValue(species: string | undefined): string {
  if (!species) return '';
  const v = species.trim().toLowerCase();
  if (v === 'dog' || v === '狗' || v === '犬') return 'dog';
  if (v === 'cat' || v === '猫') return 'cat';
  if (v === 'other' || v === '其他' || v === '其它') return 'other';
  return species;
}

/**
 * 获取物种 emoji
 */
export function getSpeciesEmoji(species: string | undefined): string {
  if (!species) return '🐾';
  const speciesLower = species.toLowerCase();
  if (speciesLower === 'dog' || speciesLower === '狗') return '🐕';
  if (speciesLower === 'cat' || speciesLower === '猫') return '🐱';
  if (speciesLower === 'rabbit' || speciesLower === '兔') return '🐰';
  if (speciesLower === 'hamster' || speciesLower === '仓鼠') return '🐹';
  return '🐾';
}
