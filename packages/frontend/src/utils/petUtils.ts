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
