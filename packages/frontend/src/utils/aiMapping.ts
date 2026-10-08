// AI 识别结果 -> 登记表单字段 的映射（纯函数，无副作用，便于单独推理与测试）

import type { PetRecognitionResult, PetHealthAdvicePayload } from '@/types/ai';
import type { Pet, PetRegisterFormData } from '@/types/pet';

/**
 * 表单字段 -> 中文标签。
 * 面板展示"已回填了哪些"时按实际写入的字段取名，避免标签散落多处。
 */
export const RECOGNITION_FIELD_LABELS: Record<string, string> = {
  species: '种类',
  breed: '品种',
  gender: '性别',
  age: '年龄',
  ageUnit: '年龄',
};

export interface RecognitionMapping {
  values: Partial<PetRegisterFormData>;
  filledFields: string[];
}

/**
 * 把 AI 识别结果映射为表单可用的值。
 *
 * 只输出 AI 靠得住的字段（种类/品种/性别/年龄）；
 * 值为 null/undefined/空字符串的字段既不会进 values，也不会出现在 filledFields 里。
 * 注意表单里 gender 是字符串 'male'|'female'，而 AI 返回的是数字 1|2。
 */
export function mapRecognitionToForm(result: PetRecognitionResult): RecognitionMapping {
  const values: Partial<PetRegisterFormData> = {};
  const filledFields: string[] = [];

  // 没识别到宠物就什么都不回填
  if (!result || !result.isPet) {
    return { values, filledFields };
  }

  const species = normalizeSpecies(result.species);
  if (species) {
    values.species = species;
    filledFields.push('种类');
  }

  const breed = typeof result.breed === 'string' ? result.breed.trim() : '';
  if (breed) {
    values.breed = breed;
    filledFields.push('品种');
  }

  if (result.gender === 1 || result.gender === 2) {
    values.gender = result.gender === 1 ? 'male' : 'female';
    filledFields.push('性别');
  }

  const age = monthsToAgeInput(result.ageMonths);
  if (age) {
    values.age = age.age;
    values.ageUnit = age.ageUnit;
    filledFields.push('年龄');
  }

  return { values, filledFields };
}

/**
 * 月份数 -> 表单的 age + ageUnit。
 * < 12 个月用"个月"，>= 12 个月换算成"岁"并保留 1 位小数（表单年龄输入框是 step=0.1）。
 */
export function monthsToAgeInput(
  ageMonths: number | null | undefined
): { age: number; ageUnit: 'month' | 'year' } | null {
  if (ageMonths === null || ageMonths === undefined) return null;
  if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;

  const months = Math.round(ageMonths);
  if (months < 12) {
    // 不足 1 个月按 1 个月计，避免回填出 0
    return { age: Math.max(1, months), ageUnit: 'month' };
  }
  return { age: Math.round((months / 12) * 10) / 10, ageUnit: 'year' };
}

/**
 * 表单的 age + ageUnit -> 月份数（生成简介时用）。
 * 输入为空或非法时返回 undefined。
 */
export function ageToMonths(
  age: number | null | undefined,
  ageUnit: 'month' | 'year' | undefined
): number | undefined {
  if (age === null || age === undefined) return undefined;
  if (typeof age !== 'number' || !Number.isFinite(age) || age <= 0) return undefined;
  return Math.max(1, Math.round(ageUnit === 'month' ? age : age * 12));
}

/**
 * 宠物档案 -> 养护建议请求体。
 *
 * 三个要点：
 * 1. `ageMonths` 原样取 `pet.age`，不做任何换算。库里 age 的单位就是月；
 *    详情页把它当「岁」显示是一个已记录的显示缺陷，不能顺着那个错误再除以 12。
 * 2. `isVaccinated` / `isNeutered` 是三态（1=是，0=否，undefined=未填写），
 *    只在确实是数字时才带上，让后端能区分「没填」和「否」。
 * 3. `species` 不做前端归一化，原样交给后端——那边会用同一套归一化逻辑兜底，
 *    在这里丢弃未知取值反而会白白少一条信息。
 */
export function buildHealthAdvicePayload(pet: Pet | null | undefined): PetHealthAdvicePayload {
  const payload: PetHealthAdvicePayload = {};
  if (!pet) return payload;

  const asText = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  };
  const asPositive = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;

  const name = asText(pet.name);
  if (name) payload.name = name;

  const species = asText(pet.species);
  if (species) payload.species = species;

  const breed = asText(pet.breed);
  if (breed) payload.breed = breed;

  const ageMonths = asPositive(pet.age);
  if (ageMonths !== undefined) payload.ageMonths = Math.round(ageMonths);

  if (pet.gender === 1 || pet.gender === 2) payload.gender = pet.gender;

  const weight = asPositive(pet.weight);
  if (weight !== undefined) payload.weight = weight;

  if (typeof pet.isVaccinated === 'number') payload.isVaccinated = pet.isVaccinated;
  if (typeof pet.isNeutered === 'number') payload.isNeutered = pet.isNeutered;

  const healthStatus = asText(pet.healthStatus);
  if (healthStatus) payload.healthStatus = healthStatus;

  return payload;
}

/**
 * 归一化种类。契约上 AI 只会返回 'dog'|'cat'|'other'，
 * 这里额外兼容中文标签；无法识别时返回 null（不回填，而不是瞎猜成"其他"）。
 */
function normalizeSpecies(species: string | null | undefined): 'dog' | 'cat' | 'other' | null {
  if (!species) return null;
  const value = species.trim().toLowerCase();
  if (value === 'dog' || value === '狗') return 'dog';
  if (value === 'cat' || value === '猫') return 'cat';
  if (value === 'other' || value === '其他') return 'other';
  return null;
}

export default mapRecognitionToForm;
