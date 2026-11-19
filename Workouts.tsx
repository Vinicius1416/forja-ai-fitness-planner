import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Dumbbell,
  FlaskConical,
  Home,
  RefreshCw,
  Repeat,
  Timer,
} from 'lucide-react';
import type { UserData, WorkoutPlan } from '@/lib/types';
import { generatePlan, nextLevel, todayPlanDay } from '@/lib/workout';
import { todayKey } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface WorkoutsProps {
  data: UserData;
  onChange: (data: UserData) => void;
}

const LEVEL_LABEL: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};
const GOAL_LABEL: Record<string, string> = {
  emagrecer: 'Emagrecer',
  manter: 'Manter',
  hipertrofia: 'Hipertrofia',
  condicionamento: 'Condicionamento',
};

export default function Workouts({ data, onChange }: WorkoutsProps) {
  const plan = data.plan;
  const [activeDay, setActiveDay] = useState<string>(todayPlanDay() ?? 'Seg');
  const [showRationale, setShowRationale] = useState(false);
  const today = todayPlanDay();

  if (!plan) return null;

  const day = plan.days.find((d) => d.day === activeDay) ?? plan.days[0];
  const doneCount = day.exercises.filter((e) => e.done).length;
  const allDone = day.exercises.length > 0 && doneCount === day.exercises.length;
  const completedToday = !!data.completions[todayKey()];

  const toggleExercise = (exerciseId: string) => {
    const updated: WorkoutPlan = {
      ...plan,
      days: plan.days.map((d) =>
        d.day === day.day
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.exerciseId === exerciseId ? { ...e, done: !e.done } : e
              ),
            }
          : d
      ),
    };
    onChange({ ...data, plan: updated });
  };

  const completeWorkout = () => {
    const updated: WorkoutPlan = {
      ...plan,
      days: plan.days.map((d) =>
        d.day === day.day
          ? { ...d, exercises: d.exercises.map((e) => ({ ...e, done: true })) }
          : d
      ),
    };
    onChange({
      ...data,
      plan: updated,
      completions: { ...data.completions, [todayKey()]: true },
      xp: data.xp + 100,
    });
  };

  const regenerate = () => {
    const fresh = generatePlan({
      level: data.profile.level,
      place: data.profile.place,
      goal: data.profile.goal,
      daysPerWeek: data.profile.daysPerWeek,
    });
    onChange({ ...data, plan: fresh });
    setActiveDay(fresh.days[0]?.day ?? 'Seg');
  };

  const next = nextLevel(data.profile.level);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">Plano da semana · {plan.weekLabel}</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Seus treinos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 rounded-lg px-3 py-1.5">
            {plan.place === 'academia' ? <Dumbbell className="h-3.5 w-3.5" /> : <Home className="h-3.5 w-3.5" />}
            {plan.place === 'academia' ? 'Academia' : 'Casa'}
          </Badge>
          <Badge variant="secondary" className="rounded-lg px-3 py-1.5">{LEVEL_LABEL[plan.level]}</Badge>
          <Badge variant="secondary" className="rounded-lg px-3 py-1.5">{GOAL_LABEL[plan.goal]}</Badge>
        </div>
      </div>

      {/* Base científica */}
      <section className="card-sheen rounded-2xl border border-border bg-card">
        <button
          onClick={() => setShowRationale((s) => !s)}
          className="flex w-full items-center justify-between p-5 text-left"
          aria-expanded={showRationale}
        >
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Por que esse plano?</p>
              <p className="text-sm text-muted-foreground">Base científica por trás dos treinos</p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${showRationale ? 'rotate-180' : ''}`} />
        </button>
        {showRationale && (
          <ul className="space-y-2.5 border-t border-border px-5 py-4">
            {plan.rationale.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Dias da semana */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Dias do plano">
        {plan.days.map((d) => {
          const dDone = d.exercises.length > 0 && d.exercises.every((e) => e.done);
          const isToday = d.day === today;
          const active = d.day === activeDay;
          return (
            <button
              key={d.day}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveDay(d.day)}
              className={`card-interactive flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'border-primary bg-accent text-accent-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {dDone ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
              {d.day}
              {isToday && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                  hoje
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Exercícios do dia */}
      <section aria-label={`Treino de ${day.day}`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold">{day.title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{day.focus}</p>
          </div>
          <p className="stat-numeral text-sm font-bold text-primary">
            {doneCount}/{day.exercises.length} exercícios
          </p>
        </div>

        <div className="space-y-2.5">
          {day.exercises.map((ex, i) => (
            <button
              key={`${ex.exerciseId}-${i}`}
              onClick={() => toggleExercise(ex.exerciseId)}
              aria-pressed={ex.done}
              style={{ ['--stagger' as string]: i }}
              className={`card-interactive entrance group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                ex.done ? 'border-primary/40 bg-accent/50' : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <span className="mt-0.5">
                {ex.done ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/50 transition-colors group-hover:text-primary/70" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${ex.done ? 'text-muted-foreground line-through decoration-primary/60' : ''}`}>
                  {ex.name}
                </p>
                {ex.tip && <p className="mt-0.5 text-sm text-muted-foreground">{ex.tip}</p>}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="rounded-md gap-1 font-normal">
                    <Repeat className="h-3 w-3" /> {ex.sets} × {ex.reps}
                  </Badge>
                  {ex.restSec > 0 && (
                    <Badge variant="secondary" className="rounded-md gap-1 font-normal">
                      <Timer className="h-3 w-3" /> {ex.restSec}s descanso
                    </Badge>
                  )}
                  <Badge variant="outline" className="rounded-md font-normal capitalize text-muted-foreground">
                    {ex.equipment}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Concluir treino */}
        <div className="mt-5 flex flex-col items-start gap-3">
          {day.day === today ? (
            completedToday ? (
              <p className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
                <CheckCircle2 className="h-5 w-5" /> Treino de hoje concluído. +100 XP no seu bolso.
              </p>
            ) : (
              <Button onClick={completeWorkout} disabled={!allDone} className="rounded-xl" size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Concluir treino de hoje (+100 XP)
              </Button>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Treino de {day.day}. Marque os exercícios e conclua no dia para registrar a sequência.
            </p>
          )}
          {allDone && day.day === today && !completedToday && (
            <p className="text-xs text-muted-foreground">
              Tudo marcado — confirme a conclusão para registrar o dia.
            </p>
          )}
        </div>
      </section>

      {/* Ações do plano */}
      <section className="card-sheen flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="font-semibold">Quer variar?</p>
          <p className="text-sm text-muted-foreground">
            Gere uma nova combinação de exercícios com a mesma estrutura científica.
          </p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <RefreshCw className="h-4 w-4" /> Gerar nova variação
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Gerar nova variação do plano?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os exercícios atuais serão substituídos por uma nova seleção com a mesma divisão e
                  volume. Seu progresso de conclusão semanal será mantido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={regenerate} className="rounded-xl">
                  Sim, gerar novo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {next && (
        <p className="text-center text-sm text-muted-foreground">
          Quando o plano atual ficar fácil, o próximo nível é{' '}
          <span className="font-semibold text-primary">{LEVEL_LABEL[next]}</span> — ajuste no seu
          perfil.
        </p>
      )}
    </div>
  );
}
