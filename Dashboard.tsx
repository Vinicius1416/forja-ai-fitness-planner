import { BotMessageSquare, ChevronRight, Clock, Flame, Zap } from 'lucide-react';
import type { UserData } from '@/lib/types';
import { dailyCoachMessage, streakOf, weekProgress } from '@/lib/coach';
import { todayPlanDay } from '@/lib/workout';
import type { View } from './AppShell';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  data: UserData;
  onNavigate: (v: View) => void;
}

const DAY_LETTERS: Record<string, string> = {
  Seg: 'S',
  Ter: 'T',
  Qua: 'Q',
  Qui: 'Q',
  Sex: 'S',
};

export default function Dashboard({ data, onNavigate }: DashboardProps) {
  const today = todayPlanDay();
  const todayWorkout = today ? data.plan?.days.find((d) => d.day === today) : null;
  const streak = streakOf(data);
  const week = weekProgress(data);
  const coachMsg = dailyCoachMessage(data);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = data.profile.name.split(' ')[0];

  // Datas seg–sex da semana corrente
  const weekDates: { day: string; label: string; date: string; isToday: boolean }[] = [];
  {
    const d = new Date();
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
    d.setDate(d.getDate() + diff);
    const names = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    for (let i = 0; i < 5; i++) {
      const key = d.toISOString().slice(0, 10);
      weekDates.push({
        day: names[i],
        label: DAY_LETTERS[names[i]] ?? names[i][0],
        date: key,
        isToday: key === new Date().toISOString().slice(0, 10),
      });
      d.setDate(d.getDate() + 1);
    }
  }

  const estMinutes = todayWorkout
    ? Math.max(
        25,
        Math.round(
          todayWorkout.exercises.reduce((acc, e) => acc + e.sets * (e.restSec / 60 + 1.7), 0)
        )
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="label-caps entrance">{greeting}, atleta</p>
        <h1 className="font-display entrance text-3xl font-bold tracking-tight sm:text-4xl" style={{ ['--stagger' as string]: 1 }}>
          {firstName}. Hoje é dia de{' '}
          <span className="text-primary">{todayWorkout ? todayWorkout.title : 'descanso ativo'}.</span>
        </h1>
      </div>

      {/* Mensagem do coach */}
      <section
        className="entrance glass rounded-2xl p-5"
        style={{ ['--stagger' as string]: 2 }}
        aria-label="Mensagem do coach"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <BotMessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="label-caps">Coach IA</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{coachMsg}</p>
            <button
              onClick={() => onNavigate('coach')}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Conversar com o coach <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Faixa da semana */}
      <section className="entrance" style={{ ['--stagger' as string]: 3 }} aria-label="Progresso da semana">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="label-caps">Semana atual</p>
          <p className="stat-numeral text-sm font-bold text-primary">
            {week.done}/{week.total}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {weekDates.map((wd) => {
            const done = !!data.completions[wd.date];
            return (
              <div
                key={wd.date}
                className={`flex flex-col items-center gap-2 rounded-2xl border py-3 transition-colors ${
                  wd.isToday
                    ? 'border-primary/60 bg-accent'
                    : done
                      ? 'border-border bg-card'
                      : 'border-border/60 bg-card/50'
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${wd.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {wd.day}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    done
                      ? 'bg-primary text-primary-foreground'
                      : wd.isToday
                        ? 'border-2 border-dashed border-primary/60 text-primary'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                  aria-label={done ? `${wd.day}: treino concluído` : `${wd.day}: pendente`}
                >
                  {done ? '✓' : wd.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Estatísticas */}
      <section className="grid grid-cols-3 gap-3" aria-label="Estatísticas">
        {[
          { icon: Flame, value: String(streak), label: 'dias de sequência', color: 'text-orange-400' },
          { icon: Zap, value: String(data.xp), label: 'pontos XP', color: 'text-yellow-300' },
          { icon: Clock, value: todayWorkout ? `${estMinutes}min` : '—', label: 'duração estimada', color: 'text-primary' },
        ].map((s, i) => (
          <div
            key={s.label}
            className="entrance rounded-2xl border border-border bg-card p-4"
            style={{ ['--stagger' as string]: 4 + i }}
          >
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <p className="stat-numeral mt-2 text-3xl font-bold">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Card do treino de hoje */}
      {todayWorkout && (
        <section className="entrance rounded-2xl border border-primary/30 bg-gradient-to-br from-accent/60 to-card p-5" style={{ ['--stagger' as string]: 7 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="label-caps">Treino de hoje — {todayWorkout.day}</p>
              <p className="font-display mt-1 text-2xl font-bold">{todayWorkout.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {todayWorkout.exercises.length} exercícios · {todayWorkout.focus}
              </p>
            </div>
            <Button onClick={() => onNavigate('treinos')} className="rounded-xl">
              Abrir treino <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
