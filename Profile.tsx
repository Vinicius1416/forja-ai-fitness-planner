import { useState } from 'react';
import { AlertTriangle, RefreshCw, Save, ShieldAlert } from 'lucide-react';
import type { Goal, Level, Place, UserData } from '@/lib/types';
import { generatePlan } from '@/lib/workout';
import { deleteAccount, logoutUser } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface ProfileProps {
  data: UserData;
  onChange: (data: UserData) => void;
  onLogout: () => void;
}

const LEVELS: { value: Level; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];
const GOALS: { value: Goal; label: string }[] = [
  { value: 'emagrecer', label: 'Emagrecer' },
  { value: 'manter', label: 'Manter peso' },
  { value: 'hipertrofia', label: 'Ganhar massa' },
  { value: 'condicionamento', label: 'Condicionamento' },
];

export default function Profile({ data, onChange, onLogout }: ProfileProps) {
  const p = data.profile;
  const [name, setName] = useState(p.name);
  const [weight, setWeight] = useState(String(p.weightKg));
  const [height, setHeight] = useState(String(p.heightCm));
  const [birthYear, setBirthYear] = useState(String(p.birthYear));
  const [level, setLevel] = useState<Level>(p.level);
  const [goal, setGoal] = useState<Goal>(p.goal);
  const [place, setPlace] = useState<Place>(p.place);
  const [days, setDays] = useState(p.daysPerWeek);
  const [saved, setSaved] = useState(false);

  const planNeedsUpdate =
    level !== p.level || goal !== p.goal || place !== p.place || days !== p.daysPerWeek;

  const save = () => {
    const profile = {
      ...p,
      name: name.trim() || p.name,
      weightKg: Number(weight) || p.weightKg,
      heightCm: Number(height) || p.heightCm,
      birthYear: Number(birthYear) || p.birthYear,
      level,
      goal,
      place,
      daysPerWeek: days,
    };
    onChange({ ...data, profile });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const rebuildPlan = () => {
    const profile = { ...p, level, goal, place, daysPerWeek: days };
    const plan = generatePlan({ level, place, goal, daysPerWeek: days });
    onChange({ ...data, profile, plan });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const memberSince = new Date(p.createdAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="label-caps">Atleta desde {memberSince}</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Seu perfil</h1>
      </div>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-5" aria-label="Dados pessoais">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-name">Nome</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email">E-mail</Label>
            <Input id="p-email" value={p.email} disabled className="h-11 rounded-xl opacity-60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-weight">Peso (kg)</Label>
            <Input id="p-weight" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, ''))} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-height">Altura (cm)</Label>
            <Input id="p-height" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-year">Ano de nascimento</Label>
            <Input id="p-year" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))} className="h-11 rounded-xl" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5" aria-label="Configurações de treino">
        <p className="font-semibold">Treino</p>
        <div className="space-y-2">
          <Label>Nível</Label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                aria-pressed={level === l.value}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  level === l.value
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGoal(g.value)}
                aria-pressed={goal === g.value}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  goal === g.value
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Local</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['academia', 'casa'] as Place[]).map((pl) => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => setPlace(pl)}
                  aria-pressed={place === pl}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
                    place === pl
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pl}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dias por semana</Label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  aria-pressed={days === d}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    days === d
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {planNeedsUpdate && (
          <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-accent/60 p-4">
            <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Seu plano mudou</p>
              <p className="text-sm text-muted-foreground">
                As configurações de treino foram alteradas. Salve para atualizar o perfil ou gere um
                novo plano agora.
              </p>
              <Button onClick={rebuildPlan} className="mt-3 rounded-xl gap-2" size="sm">
                <RefreshCw className="h-4 w-4" /> Salvar e gerar novo plano
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={save} variant="secondary" className="rounded-xl gap-2">
            <Save className="h-4 w-4" /> Salvar alterações
          </Button>
          {saved && <p className="text-sm font-semibold text-primary">Salvo!</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-destructive/30 bg-card p-5" aria-label="Zona de perigo">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-destructive" />
          <p className="font-semibold">Sessão e dados</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Versão de demonstração: tudo fica salvo neste navegador apenas. Limpar os dados do
          navegador apaga sua conta e histórico.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              logoutUser();
              onLogout();
            }}
            className="rounded-xl"
          >
            Sair da conta
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="rounded-xl">
                Excluir conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Seus treinos, fotos de evolução, histórico de peso e conversas serão apagados
                  deste navegador. Não há como desfazer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deleteAccount(data.profile.email);
                    onLogout();
                  }}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sim, excluir tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
