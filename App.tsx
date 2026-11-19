import { useCallback, useEffect, useState } from 'react';
import { normalizeWorkoutPlan } from './lib/workout';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import AppShell from './components/AppShell';
import type { View } from './components/AppShell';
import Dashboard from './components/Dashboard';
import Workouts from './components/Workouts';
import Nutrition from './components/Nutrition';
import Progress from './components/Progress';
import Coach from './components/Coach';
import Profile from './components/Profile';
import type { UserData } from './lib/types';
import {
  currentSessionEmail,
  emptyUserData,
  findUser,
  loadUserData,
  saveUserData,
} from './lib/storage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [email, setEmail] = useState<string | null>(() => currentSessionEmail());
  const [data, setData] = useState<UserData | null>(null);
  const [view, setView] = useState<View>('hoje');
  const [hydrated, setHydrated] = useState(false);

  // Hidrata os dados da sessão atual
  useEffect(() => {
    if (email) {
      const loaded = loadUserData(email);
      // Usuário antigo sem dados (ex.: cadastro interrompido) — cria base mínima
      if (!loaded && findUser(email)) {
        const u = findUser(email)!;
        setData(emptyUserData({
          name: u.name,
          email: u.email,
          sex: 'masculino',
          birthYear: new Date().getFullYear() - 25,
          heightCm: 170,
          weightKg: 70,
          level: 'iniciante',
          goal: 'manter',
          place: 'academia',
          daysPerWeek: 5,
          createdAt: new Date().toISOString(),
        }));
      } else {
        setData(loaded);
      }
    } else {
      setData(null);
    }
    setHydrated(true);
  }, [email]);

  const handleAuth = useCallback(() => {
    setEmail(currentSessionEmail());
    setView('hoje');
  }, []);

  const handleLogout = useCallback(() => {
    setEmail(null);
    setData(null);
    setView('hoje');
  }, []);

  const updateData = useCallback(
    (next: UserData) => {
      setData(next);
      if (email) {
        const ok = saveUserData(email, next);
        if (!ok) {
          toast.warning('Espaço do navegador quase cheio — fotos antigas foram removidas do histórico.');
        }
      }
    },
    [email]
  );

  // Plano antigo salvo localmente: converte automaticamente para 6 exercícios por dia
  useEffect(() => {
    if (!email || !data?.plan) return;
    const normalizedPlan = normalizeWorkoutPlan(data.plan);
    if (normalizedPlan !== data.plan) {
      updateData({ ...data, plan: normalizedPlan });
    }
  }, [email, data, updateData]);

  if (!hydrated) {
    return (
      <div className="flex min-h-100dvh items-center justify-center bg-background">
        <p className="font-display animate-pulse text-lg font-bold text-primary">FORJA</p>
      </div>
    );
  }

  if (!email) return <AuthScreen onAuth={handleAuth} />;

  if (!data) return null;

  // Cadastro feito mas onboarding ainda não — perfil recém-criado acima tem flag createdAt == agora?
  // Onboarding é mostrado quando o usuário ainda não possui plano NENHUM e acabou de se cadastrar.
  const needsOnboarding = data.plan === null && !data.weights.length && !data.photos.length;

  if (needsOnboarding) {
    return <Onboarding email={email} name={data.profile.name} onComplete={updateData} />;
  }

  const views: Record<View, React.ReactNode> = {
    hoje: <Dashboard data={data} onNavigate={setView} />,
    treinos: <Workouts data={data} onChange={updateData} />,
    nutricao: <Nutrition data={data} onChange={updateData} />,
    evolucao: <Progress data={data} onChange={updateData} />,
    coach: <Coach data={data} onChange={updateData} />,
    perfil: <Profile data={data} onChange={updateData} onLogout={handleLogout} />,
  };

  return (
    <>
      <AppShell view={view} onNavigate={setView} userName={data.profile.name} onLogout={handleLogout}>
        <div key={view} className="entrance">
          {views[view]}
        </div>
      </AppShell>
      <Toaster theme="dark" position="top-center" richColors />
    </>
  );
}
