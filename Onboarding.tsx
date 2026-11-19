import { lazy, Suspense, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Flame,
  Home,
  Mountain,
  Ruler,
  Scale,
  Sparkles,
  Target,
  Waves,
  Weight,
} from 'lucide-react';

const Mascot3D = lazy(() => import('./Mascot3D'));
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePlan } from '@/lib/workout';
import type { Goal, Level, Place, Sex, UserData } from '@/lib/types';
import { emptyUserData, saveUserData } from '@/lib/storage';

interface OnboardingProps {
  email: string;
  name: string;
  onComplete: (data: UserData) => void;
}

const LEVELS: { value: Level; label: string; desc: string }[] = [
  {
    value: 'iniciante',
    label: 'Iniciante',
    desc: 'Menos de 6 meses de treino. Plano mais tranquilo, foco total na técnica, 2 séries por exercício.',
  },
  {
    value: 'intermediario',
    label: 'Intermediário',
    desc: '6 meses a 2 anos treinando. Divisão clássica seg–sex, 3–4 séries, carga progressiva.',
  },
  {
    value: 'avancado',
    label: 'Avançado',
    desc: 'Mais de 2 anos. Volume maior, faixas de força e intensidade com finalizações.',
  },
];

const GOALS: { value: Goal; label: string; desc: string; icon: typeof Flame }[] = [
  { value: 'emagrecer', label: 'Emagrecer', desc: 'Déficit calórico + finalização cardiovascular', icon: Flame },
  { value: 'hipertrofia', label: 'Ganhar massa muscular', desc: 'Superávit leve + faixas de 6–12 reps', icon: Weight },
  { value: 'condicionamento', label: 'Condicionamento', desc: 'Resistência, fôlego e circuitos', icon: Waves },
  { value: 'manter', label: 'Manter a forma', desc: 'Manutenção com consistência', icon: Target },
];

export default function Onboarding({ email, name, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState<Sex>('masculino');
  const [birthYear, setBirthYear] = useState(String(new Date().getFullYear() - 25));
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [place, setPlace] = useState<Place>('academia');
  const [days, setDays] = useState(5);
  const [pulse, setPulse] = useState(0);

  const stepValid = () => {
    if (step === 0) {
      const by = Number(birthYear);
      const h = Number(height);
      const w = Number(weight);
      return (
        by >= 1930 &&
        by <= new Date().getFullYear() - 10 &&
        h >= 120 &&
        h <= 230 &&
        w >= 30 &&
        w <= 300
      );
    }
    if (step === 1) return level !== null;
    if (step === 2) return goal !== null;
    return true;
  };

  const finish = () => {
    const profile = {
      name,
      email,
      sex,
      birthYear: Number(birthYear),
      heightCm: Number(height),
      weightKg: Number(weight),
      level: level ?? 'iniciante',
      goal: goal ?? 'manter',
      place,
      daysPerWeek: days,
      createdAt: new Date().toISOString(),
    };
    const data = emptyUserData(profile);
    data.plan = generatePlan({ level: profile.level, place, goal: profile.goal, daysPerWeek: days });
    data.weights.push({ date: new Date().toISOString(), kg: profile.weightKg });
    saveUserData(email, data);
    setPulse((p) => p + 1);
    onComplete(data);
  };

  const steps = ['Seu corpo', 'Seu nível', 'Seu objetivo', 'Onde treina'];

  return (
    <div className="min-h-100dvh bg-background lg:grid lg:grid-cols-[1fr_1.3fr]">
      {/* Lado do mascote */}
      <div className="relative hidden lg:block">
        <Suspense fallback={<div className="holo-ring absolute inset-0" aria-hidden="true" />}>
          <Mascot3D pulse={pulse} className="absolute inset-0" />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-8">
          <p className="label-caps">Configuração do atleta</p>
          <p className="font-display mt-2 max-w-sm text-3xl font-bold leading-tight">
            {Math.round((step / steps.length) * 100)}% pronto para forjar.
          </p>
        </div>
      </div>

      {/* Formulário em etapas */}
      <div className="flex min-h-100dvh flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-lg space-y-8">
          <div className="space-y-3">
            <p className="label-caps">
              Passo {step + 1} de {steps.length} — {steps[step]}
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Sexo biológico</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['masculino', 'feminino'] as Sex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      aria-pressed={sex === s}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-all duration-200 ${
                        sex === s
                          ? 'border-primary bg-accent text-accent-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Usado nas fórmulas de metabolismo basal (necessário para os cálculos fisiológicos).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="byear">Nascimento</Label>
                  <Input
                    id="byear"
                    inputMode="numeric"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1999"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <div className="relative">
                    <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="height"
                      inputMode="numeric"
                      value={height}
                      onChange={(e) => setHeight(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="h-12 rounded-xl pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <div className="relative">
                    <Scale className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="weight"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, '').slice(0, 5))}
                      className="h-12 rounded-xl pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  aria-pressed={level === l.value}
                  className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
                    level === l.value
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <p className="font-display text-lg font-bold">{l.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  aria-pressed={goal === g.value}
                  className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                    goal === g.value
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <g.icon className="h-6 w-6 text-primary" />
                  <p className="font-display mt-3 font-bold">{g.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { value: 'academia' as Place, label: 'Academia', icon: Dumbbell, desc: 'Aparelhos, barras e halteres' },
                    { value: 'casa' as Place, label: 'Em casa', icon: Home, desc: 'Peso corporal e cargas improvisadas' },
                  ]
                ).map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlace(p.value)}
                    aria-pressed={place === p.value}
                    className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                      place === p.value
                        ? 'border-primary bg-accent'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <p.icon className="h-6 w-6 text-primary" />
                    <p className="font-display mt-3 font-bold">{p.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <Label>Dias de treino por semana</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { n: 3, label: '3x — seg/qua/sex' },
                    { n: 4, label: '4x — seg/ter/qua/sex' },
                    { n: 5, label: '5x — seg a sex' },
                  ].map((d) => (
                    <button
                      key={d.n}
                      type="button"
                      onClick={() => setDays(d.n)}
                      aria-pressed={days === d.n}
                      className={`rounded-xl border px-3 py-3 text-xs font-semibold leading-snug transition-all duration-200 ${
                        days === d.n
                          ? 'border-primary bg-accent text-accent-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mountain className="h-3.5 w-3.5 shrink-0 text-primary" />
                  Sábado e domingo ficam livres para descanso ativo.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid()} className="rounded-xl">
                Avançar <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} className="rounded-xl font-semibold">
                <Sparkles className="mr-1.5 h-4 w-4" /> Gerar meu plano
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
