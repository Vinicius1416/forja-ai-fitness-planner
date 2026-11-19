import type { Goal, Sex } from './types';

/**
 * Calculadoras de gasto energético — as duas fórmulas de referência
 * usadas por nutricionistas e no contexto clínico-esportivo.
 */

/** Equação de Mifflin-St Jeor (1990) — hoje a mais recomendada pela Academy of Nutrition and Dietetics */
export function mifflinStJeor(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'masculino' ? base + 5 : base - 161);
}

/** Equação de Harris-Benedict revisada (Roza & Shizgal, 1984) */
export function harrisBenedict(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const male = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  const female = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  return Math.round(sex === 'masculino' ? male : female);
}

export interface ActivityOption {
  value: number;
  label: string;
  hint: string;
}

export const ACTIVITIES: ActivityOption[] = [
  { value: 1.2, label: 'Sedentário', hint: 'Trabalho sentado, pouco ou nenhum exercício' },
  { value: 1.375, label: 'Levemente ativo', hint: 'Treina 1–3x/semana ou caminhadas frequentes' },
  { value: 1.55, label: 'Moderadamente ativo', hint: 'Treina 3–5x/semana' },
  { value: 1.725, label: 'Muito ativo', hint: 'Treina 6–7x/semana ou trabalho físico' },
  { value: 1.9, label: 'Atleta', hint: 'Treino diário intenso + treinos duplos' },
];

/** Ajuste calórico por objetivo, em % sobre o gasto total */
export const GOAL_ADJUST: Record<Goal, { factor: number; label: string; kcalNote: string }> = {
  emagrecer: { factor: 0.8, label: 'Emagrecer', kcalNote: 'Déficit de ~20% — perda sustentável de 0,5 kg/semana' },
  manter: { factor: 1.0, label: 'Manter peso', kcalNote: 'Calorias de manutenção' },
  hipertrofia: { factor: 1.1, label: 'Ganhar massa', kcalNote: 'Superávit leve de ~10% — ganho com mínimo de gordura' },
  condicionamento: { factor: 1.0, label: 'Condicionamento', kcalNote: 'Manutenção + finalizações de cardio nos treinos' },
};

/**
 * Macronutrientes por kg de peso (faixas usadas na prática esportiva):
 * proteína 1,6–2,2 g/kg, gordura 0,8–1,0 g/kg, carboidrato no restante das calorias.
 */
export function macros(goal: Goal, weightKg: number, targetKcal: number) {
  const proteinPerKg = goal === 'emagrecer' ? 2.0 : goal === 'hipertrofia' ? 1.8 : 1.6;
  const proteinG = Math.round(proteinPerKg * weightKg);
  const fatG = Math.round(Math.min(1.0 * weightKg, (targetKcal * 0.3) / 9));
  const carbsG = Math.max(0, Math.round((targetKcal - proteinG * 4 - fatG * 9) / 4));
  return { proteinG, carbsG, fatG };
}

export function fullCalculation(opts: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activity: number;
  activityLabel: string;
  goal: Goal;
}) {
  const { sex, weightKg, heightCm, age, activity, activityLabel, goal } = opts;
  const mifflin = mifflinStJeor(sex, weightKg, heightCm, age);
  const harris = harrisBenedict(sex, weightKg, heightCm, age);
  const avgBmr = Math.round((mifflin + harris) / 2);
  const tdeeMifflin = Math.round(mifflin * activity);
  const tdeeHarris = Math.round(harris * activity);
  const targetKcal = Math.round(avgBmr * activity * GOAL_ADJUST[goal].factor);
  const m = macros(goal, weightKg, targetKcal);
  return {
    mifflin,
    harris,
    avgBmr,
    tdeeMifflin,
    tdeeHarris,
    tdeeAvg: Math.round((tdeeMifflin + tdeeHarris) / 2),
    targetKcal,
    ...m,
    activityLabel,
  };
}

export function ageFromBirthYear(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}
