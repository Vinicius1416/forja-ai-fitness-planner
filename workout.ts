import { GYM, HOME } from './exercises';
import type {
  Exercise,
  Goal,
  Level,
  Muscle,
  Place,
  PlannedExercise,
  WorkoutDay,
  WorkoutPlan,
} from './types';
import { uid } from './storage';

/**
 * Gerador de treinos — princípios aplicados (consenso da literatura de
 * treinamento resistido, ex.: revisões sistemáticas sobre hipertrofia):
 * - 10 a 20 séries semanais efetivas por grupo muscular
 * - Cada musculatura trabalhada ~2x/semana
 * - Amplitude de movimento completa e progressão de carga ao longo das semanas
 * - Iniciantes: volume menor (2 séries), mais repetições controladas e foco em técnica
 * - Intervalos de descanso por nível (90-120s iniciante; 60-90s avançado)
 * - Finalizadores de cardio para objetivos de emagrecimento/condicionamento
 */

interface LevelCfg {
  sets: number;
  accessorySets: number;
  rest: number;
  restAccessory: number;
  repsCompound: string;
  repsAccessory: string;
  /** Níveis de exercício liberados */
  allowed: Level[];
  perMuscle: number;
}

const LEVEL_CFG: Record<Level, LevelCfg> = {
  iniciante: {
    sets: 2,
    accessorySets: 2,
    rest: 90,
    restAccessory: 60,
    repsCompound: '12–15',
    repsAccessory: '12–15',
    allowed: ['iniciante'],
    perMuscle: 2,
  },
  intermediario: {
    sets: 3,
    accessorySets: 3,
    rest: 75,
    restAccessory: 60,
    repsCompound: '8–12',
    repsAccessory: '10–15',
    allowed: ['iniciante', 'intermediario'],
    perMuscle: 3,
  },
  avancado: {
    sets: 4,
    accessorySets: 3,
    rest: 90,
    restAccessory: 60,
    repsCompound: '6–10',
    repsAccessory: '10–12',
    allowed: ['iniciante', 'intermediario', 'avancado'],
    perMuscle: 3,
  },
};

interface DayTemplate {
  day: WorkoutDay['day'];
  title: string;
  focus: string;
  muscles: Muscle[];
  /** exercícios compostos priorizados (selecionados em primeiro lugar) */
  compounds: string[];
  cardioFinisher?: boolean;
}

const GYM_SPLIT: DayTemplate[] = [
  {
    day: 'Seg',
    title: 'Peito + Tríceps',
    focus: 'Empurrar — membros superiores',
    muscles: ['peito', 'triceps', 'core'],
    compounds: ['g-sup-halteres', 'g-sup-reto', 'g-flexao'],
  },
  {
    day: 'Ter',
    title: 'Costas + Bíceps',
    focus: 'Puxar — membros superiores',
    muscles: ['costas', 'biceps'],
    compounds: ['g-puxada-frente', 'g-puxada-triangulo', 'g-remada-maquina'],
  },
  {
    day: 'Qua',
    title: 'Pernas completas',
    focus: 'Membros inferiores + glúteos',
    muscles: ['pernas'],
    compounds: ['g-leg-press', 'g-agachamento', 'g-afundo'],
  },
  {
    day: 'Qui',
    title: 'Ombros + Core',
    focus: 'Deltoides, estabilidade e postura',
    muscles: ['ombros', 'core'],
    compounds: ['g-desenvolvimento-maquina', 'g-desenvolvimento'],
  },
  {
    day: 'Sex',
    title: 'Full body + Cardio',
    focus: 'Corpo inteiro em compostos + finalização',
    muscles: ['peito', 'costas', 'pernas', 'core'],
    compounds: ['g-leg-press', 'g-puxada-frente', 'g-sup-halteres'],
    cardioFinisher: true,
  },
];

const HOME_SPLIT: DayTemplate[] = [
  {
    day: 'Seg',
    title: 'Peito + Core',
    focus: 'Empurrar em casa',
    muscles: ['peito', 'triceps', 'core'],
    compounds: ['h-flexao'],
  },
  {
    day: 'Ter',
    title: 'Costas + Ombros',
    focus: 'Puxar e elevar em casa',
    muscles: ['costas', 'ombros'],
    compounds: ['h-remada-mochila', 'h-pike-pushup'],
  },
  {
    day: 'Qua',
    title: 'Pernas em casa',
    focus: 'Membros inferiores com peso corporal',
    muscles: ['pernas'],
    compounds: ['h-agachamento', 'h-poliomenoro'],
  },
  {
    day: 'Qui',
    title: 'Full body leve',
    focus: 'Corpo inteiro, ritmo controlado',
    muscles: ['peito', 'costas', 'pernas', 'core'],
    compounds: ['h-flexao', 'h-remada-mochila', 'h-agachamento'],
  },
  {
    day: 'Sex',
    title: 'Cardio + Core',
    focus: 'Queima e estabilidade',
    muscles: ['cardio', 'core'],
    compounds: ['h-jumping-jack', 'h-polichinelo-alto'],
    cardioFinisher: true,
  },
];

const DAYS_BY_FREQ: Record<number, WorkoutDay['day'][]> = {
  3: ['Seg', 'Qua', 'Sex'],
  4: ['Seg', 'Ter', 'Qua', 'Sex'],
  5: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
};

/** Quantidade padronizada de exercícios exibidos em cada dia */
export const WORKOUT_EXERCISES_PER_DAY = 6;

/** Distribuição fixa para manter sempre 6 exercícios, sem dias muito maiores que outros */
const DAY_QUOTAS: Record<string, Partial<Record<Muscle, number>>> = {
  'academia:Seg': { peito: 3, triceps: 2, core: 1 },
  'academia:Ter': { costas: 4, biceps: 2 },
  'academia:Qua': { pernas: 6 },
  'academia:Qui': { ombros: 4, core: 2 },
  'academia:Sex': { peito: 1, costas: 1, pernas: 1, ombros: 1, core: 1, cardio: 1 },
  'casa:Seg': { peito: 2, triceps: 2, core: 2 },
  'casa:Ter': { costas: 3, ombros: 3 },
  'casa:Qua': { pernas: 6 },
  'casa:Qui': { peito: 1, costas: 1, pernas: 1, ombros: 1, core: 1, cardio: 1 },
  'casa:Sex': { cardio: 4, core: 2 },
};

const FALLBACK_ORDER: Muscle[] = [
  'pernas',
  'peito',
  'costas',
  'ombros',
  'biceps',
  'triceps',
  'core',
  'cardio',
];

/** RNG simples com seed para plano reproduzível (e variedade ao regenerar) */
function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pickExercises(
  pool: Exercise[],
  muscle: Muscle,
  cfg: LevelCfg,
  compounds: string[],
  rand: () => number,
  limit: number
): Exercise[] {
  const allowed = pool.filter(
    (x) => x.muscle === muscle && cfg.allowed.includes(x.minLevel)
  );
  const priority = allowed.filter((x) => compounds.includes(x.id));
  const rest = allowed
    .filter((x) => !compounds.includes(x.id))
    .sort(() => rand() - 0.5);
  const chosen = [...priority, ...rest];
  return chosen.slice(0, Math.max(0, Math.min(limit, chosen.length)));
}

function planExercise(
  ex: Exercise,
  cfg: LevelCfg,
  compounds: string[],
  goal: Goal,
  index: number,
  cardioCount: number
): PlannedExercise {
  if (ex.muscle === 'cardio') {
    const intervalCardio = cardioCount > 1;
    return {
      exerciseId: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      equipment: ex.equipment,
      sets: intervalCardio ? 3 : 1,
      reps: intervalCardio
        ? '40s trabalho / 20s descanso'
        : goal === 'hipertrofia'
          ? '15–20 min leve'
          : '20–30 min moderado',
      restSec: intervalCardio ? 20 : 0,
      tip: ex.tip,
      done: false,
    };
  }

  const core = ex.muscle === 'core';
  const compound = compounds.includes(ex.id) || index === 0;
  return {
    exerciseId: ex.id,
    name: ex.name,
    muscle: ex.muscle,
    equipment: ex.equipment,
    sets: core ? Math.max(2, cfg.sets - 1) : compound ? cfg.sets : cfg.accessorySets,
    reps: core ? '30–45s' : compound ? cfg.repsCompound : cfg.repsAccessory,
    restSec: core ? 45 : compound ? cfg.rest : cfg.restAccessory,
    tip: ex.tip,
    done: false,
  };
}

export function generatePlan(opts: {
  level: Level;
  place: Place;
  goal: Goal;
  daysPerWeek: number;
}): WorkoutPlan {
  const cfg = LEVEL_CFG[opts.level];
  const pool = opts.place === 'academia' ? GYM : HOME;
  const templates = opts.place === 'academia' ? GYM_SPLIT : HOME_SPLIT;
  const activeDays = DAYS_BY_FREQ[Math.min(5, Math.max(3, opts.daysPerWeek))];

  const seed = Date.now() % 2147483647;
  const rand = seededRandom(seed);

  const days: WorkoutDay[] = templates
    .filter((t) => activeDays.includes(t.day))
    .map((t) => {
      const quota = DAY_QUOTAS[`${opts.place}:${t.day}`] ?? {};
      const selected: Exercise[] = [];

      for (const muscle of t.muscles) {
        const amount = quota[muscle] ?? 0;
        if (amount > 0) {
          selected.push(
            ...pickExercises(pool, muscle, cfg, t.compounds, rand, amount)
          );
        }
      }

      // Completa com segurança caso algum grupo tenha menos exercícios que o previsto.
      const used = new Set(selected.map((x) => x.id));
      const fallback = FALLBACK_ORDER.flatMap((muscle) =>
        pool.filter(
          (x) =>
            x.muscle === muscle &&
            cfg.allowed.includes(x.minLevel) &&
            !used.has(x.id)
        )
      ).sort(() => rand() - 0.5);

      while (selected.length < WORKOUT_EXERCISES_PER_DAY && fallback.length > 0) {
        const next = fallback.shift();
        if (next) selected.push(next);
      }

      const cardioCount = selected.filter((x) => x.muscle === 'cardio').length;
      const exercises = selected
        .slice(0, WORKOUT_EXERCISES_PER_DAY)
        .map((ex, index) => planExercise(ex, cfg, t.compounds, opts.goal, index, cardioCount));

      return { day: t.day, title: t.title, focus: t.focus, exercises };
    });

  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day; // segunda da semana corrente
  weekStart.setDate(weekStart.getDate() + diff);

  return {
    id: uid(),
    createdAt: new Date().toISOString(),
    weekLabel: weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    level: opts.level,
    place: opts.place,
    goal: opts.goal,
    days,
    rationale: rationaleFor(opts),
  };
}

/** Corrige planos antigos para o padrão atual de 6 exercícios por dia */
export function normalizeWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  const alreadyStandard =
    plan.days.length > 0 &&
    plan.days.every((day) => day.exercises.length === WORKOUT_EXERCISES_PER_DAY);

  if (alreadyStandard) return plan;

  const fresh = generatePlan({
    level: plan.level,
    place: plan.place,
    goal: plan.goal,
    daysPerWeek: Math.max(3, Math.min(5, plan.days.length || 3)),
  });

  const doneByDay = new Map(
    plan.days.map((day) => [
      day.day,
      new Set(day.exercises.filter((ex) => ex.done).map((ex) => ex.exerciseId)),
    ])
  );

  return {
    ...fresh,
    id: plan.id,
    createdAt: plan.createdAt,
    weekLabel: plan.weekLabel,
    days: fresh.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ({
        ...ex,
        done: doneByDay.get(day.day)?.has(ex.exerciseId) ?? false,
      })),
    })),
  };
}

function rationaleFor(opts: { level: Level; place: Place; goal: Goal }): string[] {
  const base = [
    'Frequência semanal: cada grupo muscular é treinado 2x na semana, dentro da faixa associada a melhores resultados em revisões sistemáticas.',
    'Volume progressivo: o número de séries sobe com o seu nível — iniciantes começam com 2 séries por exercício para dominar a técnica sem fadiga excessiva.',
    'Intervalos de descanso calibrados por nível para equilibrar desempenho e tempo de treino.',
    'Movimentos compostos (agachamento, supino, remada e variantes) vêm primeiro, quando a energia está maior.',
  ];
  if (opts.goal === 'emagrecer')
    base.push('Objetivo de emagrecimento: finalização cardiovascular moderada para aumentar o gasto sem comprometer a força.');
  if (opts.goal === 'hipertrofia')
    base.push('Objetivo de hipertrofia: faixas de 6–12 repetições com proximidade da falha, o padrão mais consistente na literatura para ganho de massa muscular.');
  if (opts.goal === 'condicionamento')
    base.push('Objetivo de condicionamento: circuitos e finalizações metabólicas para VO2 e resistência muscular.');
  if (opts.place === 'casa')
    base.push('Treino em casa: exercícios de peso corporal e cargas improvisadas (mochila, garrafas) — progressão feita por repetições, amplitude e cadência.');
  if (opts.level === 'iniciante')
    base.push('Como você é iniciante: o plano é deliberadamente mais tranquilo — cargas leves, foco total em aprender o movimento certo antes de aumentar intensidade.');
  return base;
}

/** Dia da semana atual mapeado para o plano (seg–sex); fim de semana retorna null */
export function todayPlanDay(): WorkoutDay['day'] | null {
  const map: Record<number, WorkoutDay['day'] | null> = {
    1: 'Seg',
    2: 'Ter',
    3: 'Qua',
    4: 'Qui',
    5: 'Sex',
    0: null,
    6: null,
  };
  return map[new Date().getDay()];
}

/** Próximo nível sugerido (gamificação) */
export function nextLevel(level: Level): Level | null {
  if (level === 'iniciante') return 'intermediario';
  if (level === 'intermediario') return 'avancado';
  return null;
}
