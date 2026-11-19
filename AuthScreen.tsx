import type { FormEvent } from 'react';
import { lazy, Suspense, useState } from 'react';
import { Dumbbell, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

const Mascot3D = lazy(() => import('./Mascot3D'));

function MascotFallback({ className }: { className?: string }) {
  return <div className={`holo-ring ${className ?? ''}`} aria-hidden="true" />;
}
import { loginUser, registerUser } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthScreenProps {
  onAuth: () => void;
}

const MARQUEE_ITEMS = [
  'TREINO SEG–SEX',
  'PLANO POR NÍVEL',
  'EM CASA OU ACADEMIA',
  'NUTRIÇÃO COM CIÊNCIA',
  'COACH IA',
  'EVOLUÇÃO EM FOTOS',
];

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(0);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!email.includes('@')) {
      setError('Digite um e-mail válido.');
      return;
    }
    setLoading(true);
    const result =
      mode === 'login'
        ? await loginUser(email, password)
        : await registerUser(name, email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Algo deu errado. Tente de novo.');
      return;
    }
    setPulse((p) => p + 1);
    onAuth();
  };

  return (
    <div className="min-h-100dvh bg-background lg:grid lg:grid-cols-[1.15fr_1fr]">
      {/* Lado esquerdo — mascote 3D + marca */}
      <div className="relative hidden overflow-hidden lg:block">
        <Suspense fallback={<MascotFallback className="absolute inset-0" />}>
          <Mascot3D pulse={pulse} className="absolute inset-0" />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-3 p-8">
          <div className="glass flex h-11 w-11 items-center justify-center rounded-xl">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-display text-xl font-bold leading-none tracking-tight">FORJA</p>
            <p className="label-caps mt-1">Seu corpo, forjado por você</p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-6 p-8">
          <h1 className="font-display max-w-md text-4xl font-bold leading-tight text-balance">
            Treinos inteligentes, nutrição com ciência e um coach que não te deixa desistir.
          </h1>
          <div className="overflow-hidden border-y border-border/60 py-3" aria-hidden="true">
            <div
              className="marquee-track gap-8"
              style={{ ['--marquee-duration' as string]: '26s' }}
            >
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 gap-8">
                  {MARQUEE_ITEMS.map((item) => (
                    <span
                      key={`${copy}-${item}`}
                      className="label-caps whitespace-nowrap text-foreground/70"
                    >
                      {item} <span className="ml-6 text-primary">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex min-h-100dvh flex-col justify-center px-5 py-10 sm:px-10 lg:min-h-0">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="glass flex h-11 w-11 items-center justify-center rounded-xl">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-none">FORJA</p>
              <p className="label-caps mt-1">Seu corpo, forjado por você</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Entre para continuar de onde parou. Segunda a sexta, sem atalhos.'
                : 'Cadastro rápido — em seguida montamos seu plano de treino.'}
            </p>
          </div>

          {/* Alternador login/cadastro */}
          <div className="glass grid grid-cols-2 rounded-xl p-1" role="tablist" aria-label="Acesso">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    className="h-12 rounded-xl pl-10"
                    required
                    minLength={2}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo de 6 caracteres' : 'Sua senha'}
                  className="h-12 rounded-xl pl-10 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="h-12 w-full rounded-xl font-semibold" disabled={loading}>
              {loading
                ? 'Aguarde…'
                : mode === 'login'
                  ? 'Entrar na FORJA'
                  : 'Criar conta e começar'}
            </Button>
          </form>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Versão de demonstração: seus dados ficam salvos apenas neste navegador
            (não sincronizam entre dispositivos).
          </p>
        </div>
      </div>
    </div>
  );
}
