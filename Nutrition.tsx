import { useMemo, useState } from 'react';
import { Calculator, History, Info, Save, Scale } from 'lucide-react';
import type { Goal, Sex, UserData } from '@/lib/types';
import {
  ACTIVITIES,
  GOAL_ADJUST,
  ageFromBirthYear,
  fullCalculation,
} from '@/lib/nutrition';
import { uid } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NutritionProps {
  data: UserData;
  onChange: (data: UserData) => void;
}

export default function Nutrition({ data, onChange }: NutritionProps) {
  const p = data.profile;
  const [sex, setSex] = useState<Sex>(p.sex);
  const [weight, setWeight] = useState(String(p.weightKg));
  const [height, setHeight] = useState(String(p.heightCm));
  const [age, setAge] = useState(String(ageFromBirthYear(p.birthYear)));
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState<Goal>(p.goal);

  const valid =
    Number(weight) >= 30 &&
    Number(weight) <= 300 &&
    Number(height) >= 120 &&
    Number(height) <= 230 &&
    Number(age) >= 14 &&
    Number(age) <= 100;

  const result = useMemo(
    () =>
      valid
        ? fullCalculation({
            sex,
            weightKg: Number(weight),
            heightCm: Number(height),
            age: Number(age),
            activity: Number(activity),
            activityLabel: ACTIVITIES.find((a) => a.value === Number(activity))?.label ?? '',
            goal,
          })
        : null,
    [sex, weight, height, age, activity, goal, valid]
  );

  const save = () => {
    if (!result) return;
    const entry = {
      id: uid(),
      date: new Date().toISOString(),
      formula: 'mifflin' as const,
      bmr: result.avgBmr,
      tdee: result.tdeeAvg,
      targetKcal: result.targetKcal,
      proteinG: result.proteinG,
      carbsG: result.carbsG,
      fatG: result.fatG,
      activityLabel: result.activityLabel,
      goal,
    };
    onChange({ ...data, nutrition: [entry, ...data.nutrition].slice(0, 12) });
  };

  const kcalPerGram = { protein: 4, carbs: 4, fat: 9 };
  const macroTotal =
    (result ? result.proteinG * 4 + result.carbsG * 4 + result.fatG * 9 : 0) || 1;
  const macroBars = result
    ? [
        { label: 'Proteína', grams: result.proteinG, kcalXg: kcalPerGram.protein, color: 'bg-primary' },
        { label: 'Carboidrato', grams: result.carbsG, kcalXg: kcalPerGram.carbs, color: 'bg-sky-400' },
        { label: 'Gordura', grams: result.fatG, kcalXg: kcalPerGram.fat, color: 'bg-amber-400' },
      ]
    : [];

  return (
    <div className="max-w-full space-y-6 overflow-x-clip">
      <div>
        <p className="label-caps">Mifflin-St Jeor + Harris-Benedict</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Calculadora de nutrição</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha seus dados e compare as duas fórmulas de metabolismo basal mais usadas por
          nutricionistas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Formulário */}
        <section className="card-sheen min-w-0 space-y-4 overflow-hidden rounded-2xl border border-border bg-card p-5" aria-label="Dados para cálculo">
          <div className="space-y-2">
            <Label>Sexo biológico</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['masculino', 'feminino'] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  aria-pressed={sex === s}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
                    sex === s
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="n-weight">Peso (kg)</Label>
              <Input
                id="n-weight"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, '').slice(0, 5))}
                className="h-11 max-w-full rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-height">Altura (cm)</Label>
              <Input
                id="n-height"
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/\D/g, '').slice(0, 3))}
                className="h-11 max-w-full rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-age">Idade</Label>
              <Input
                id="n-age"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n-activity">Nível de atividade física</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger id="n-activity" className="h-11 w-full max-w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-w-[min(28rem,calc(100vw-2rem))] rounded-xl">
                {ACTIVITIES.map((a) => (
                  <SelectItem key={a.value} value={String(a.value)} className="whitespace-normal rounded-lg py-2">
                    <span className="block min-w-0">
                      <span className="select-option-label block truncate font-semibold">{a.label}</span>
                      <span className="select-option-hint mt-0.5 block whitespace-normal text-xs leading-snug text-muted-foreground sm:text-sm">
                        {a.hint}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n-goal">Objetivo</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
              <SelectTrigger id="n-goal" className="h-11 w-full max-w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-w-[min(28rem,calc(100vw-2rem))] rounded-xl">
                {Object.entries(GOAL_ADJUST).map(([g, cfg]) => (
                  <SelectItem key={g} value={g} className="whitespace-normal rounded-lg py-2">
                    <span className="block min-w-0">
                      <span className="select-option-label block truncate font-semibold">{cfg.label}</span>
                      <span className="select-option-hint mt-0.5 block whitespace-normal text-xs leading-snug text-muted-foreground sm:text-sm">
                        {cfg.kcalNote}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!valid && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">
              Confira os valores: peso 30–300 kg, altura 120–230 cm, idade 14–100 anos.
            </p>
          )}
        </section>

        {/* Resultados */}
        <section className="min-w-0 space-y-4" aria-label="Resultados">
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="label-caps">Mifflin-St Jeor</p>
                  <p className="stat-numeral mt-1.5 text-3xl font-bold text-primary">{result.mifflin}</p>
                  <p className="text-xs text-muted-foreground">kcal em repouso (BMR)</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="label-caps">Harris-Benedict</p>
                  <p className="stat-numeral mt-1.5 text-3xl font-bold">{result.harris}</p>
                  <p className="text-xs text-muted-foreground">kcal em repouso (BMR)</p>
                </div>
              </div>

              <div className="card-sheen rounded-2xl border border-primary/40 bg-gradient-to-br from-accent/70 to-card p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="label-caps">Sua meta diária — {GOAL_ADJUST[goal].label.toLowerCase()}</p>
                    <p className="stat-numeral mt-1 text-5xl font-bold text-primary">
                      {result.targetKcal.toLocaleString('pt-BR')}
                      <span className="ml-2 text-lg font-semibold text-foreground/70">kcal</span>
                    </p>
                    <p className="mt-1 max-w-full break-words text-sm leading-relaxed text-muted-foreground">{GOAL_ADJUST[goal].kcalNote}</p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-xs text-muted-foreground">Gasto total estimado</p>
                    <p className="stat-numeral text-xl font-bold">
                      ~{result.tdeeAvg.toLocaleString('pt-BR')} kcal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.activityLabel} · média das duas fórmulas
                    </p>
                  </div>
                </div>

                {/* Barras de macro segmentadas */}
                <div className="mt-5 space-y-3">
                  {macroBars.map((m) => (
                    <div key={m.label}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-medium">{m.label}</span>
                        <span className="stat-numeral text-muted-foreground">
                          {m.grams} g · {Math.round(((m.grams * m.kcalXg) / macroTotal) * 100)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${m.color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, ((m.grams * m.kcalXg) / macroTotal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={save} variant="secondary" className="mt-5 w-full rounded-xl gap-2">
                  <Save className="h-4 w-4" /> Salvar no meu histórico
                </Button>
              </div>

              <div className="flex gap-2.5 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-primary" />
                <p>
                  As fórmulas estimam o gasto em repouso e variam entre si — por isso usamos a média.
                  Ajustes finos funcionam melhor: pese-se 1x/semana em jejum e adapte as calorias em
                  ±100–200 kcal conforme a tendência. Este cálculo não substitui acompanhamento com
                  nutricionista.
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <Calculator className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Preencha os dados ao lado para ver as fórmulas em ação.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Histórico */}
      {data.nutrition.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-label="Histórico de cálculos">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-primary" />
            <p className="font-semibold">Cálculos salvos</p>
          </div>
          <div className="space-y-2">
            {data.nutrition.map((n) => (
              <div key={n.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  {new Date(n.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  <span className="text-border">|</span> {n.activityLabel} · {GOAL_ADJUST[n.goal].label}
                </div>
                <p className="stat-numeral min-w-0 text-sm font-bold break-words text-primary">
                  {n.targetKcal.toLocaleString('pt-BR')} kcal
                  <span className="ml-2 font-medium text-muted-foreground">
                    P {n.proteinG}g · C {n.carbsG}g · G {n.fatG}g
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
