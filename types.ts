export type Sex = 'masculino' | 'feminino';
export type Level = 'iniciante' | 'intermediario' | 'avancado';
export type Goal = 'emagrecer' | 'manter' | 'hipertrofia' | 'condicionamento';
export type Place = 'academia' | 'casa';

export interface Profile {
  name: string;
  email: string;
  sex: Sex;
  birthYear: number;
  heightCm: number; // cm
  weightKg: number; // kg
  level: Level;
  goal: Goal;
  place: Place;
  daysPerWeek: number; // 3 a 5 (seg a sex)
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: string;
  /** Nível mínimo recomendado para a execução segura */
  minLevel: Level;
  /** Dica técnica curta exibida no card */
  tip?: string;
}

export type Muscle =
  | 'peito'
  | 'costas'
  | 'pernas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio';

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  muscle: Muscle;
  equipment: string;
  sets: number;
  reps: string;
  restSec: number;
  tip?: string;
  done: boolean;
}

export interface WorkoutDay {
  day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex';
  title: string;
  focus: string;
  exercises: PlannedExercise[];
}

export interface WorkoutPlan {
  id: string;
  createdAt: string;
  weekLabel: string;
  level: Level;
  place: Place;
  goal: Goal;
  days: WorkoutDay[];
  /** Justificativa científica exibida ao usuário */
  rationale: string[];
}

export interface PhotoEntry {
  id: string;
  date: string; // ISO
  image: string; // base64 JPEG comprimido
  weightKg?: number;
  note?: string;
}

export interface WeightLog {
  date: string; // ISO
  kg: number;
}

export interface NutritionResult {
  id: string;
  date: string;
  formula: 'mifflin' | 'harris';
  bmr: number;
  tdee: number;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  activityLabel: string;
  goal: Goal;
}

export interface ChatMessage {
  role: 'user' | 'coach';
  text: string;
  ts: string;
}

/** Dados persistentes de um usuário (chave forja_data_<email>) */
export interface UserData {
  profile: Profile;
  plan: WorkoutPlan | null;
  photos: PhotoEntry[];
  weights: WeightLog[];
  nutrition: NutritionResult[];
  chat: ChatMessage[];
  /** Treinos concluídos: dateISO (dia) -> true */
  completions: Record<string, boolean>;
  /** XP acumulado para gamificação */
  xp: number;
}
