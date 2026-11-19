import type { ReactNode } from 'react';
import {
  Apple,
  BotMessageSquare,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  UserRound,
} from 'lucide-react';

export type View = 'hoje' | 'treinos' | 'nutricao' | 'evolucao' | 'coach' | 'perfil';

export const NAV_ITEMS: { id: View; label: string; icon: typeof Dumbbell }[] = [
  { id: 'hoje', label: 'Hoje', icon: LayoutDashboard },
  { id: 'treinos', label: 'Treinos', icon: Dumbbell },
  { id: 'nutricao', label: 'Nutrição', icon: Apple },
  { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
  { id: 'coach', label: 'Coach IA', icon: BotMessageSquare },
  { id: 'perfil', label: 'Perfil', icon: UserRound },
];

interface AppShellProps {
  view: View;
  onNavigate: (v: View) => void;
  userName: string;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({ view, onNavigate, userName, onLogout, children }: AppShellProps) {
  return (
    <div className="ambient-bg min-h-100dvh bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar-background lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <Dumbbell className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">FORJA</span>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-accent text-accent-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.12)]'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-sidebar-border p-3">
          <div className="px-3.5 py-2">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="label-caps">Atleta FORJA</p>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="h-4.5 w-4.5" /> Sair
          </button>
        </div>
      </aside>

      {/* Top bar mobile */}
      <header className="glass sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-base font-bold">FORJA</span>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sair da conta"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </header>

      {/* Conteúdo */}
      <main className="pb-24 lg:pb-10 lg:pl-60">
        <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:pt-10">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      <nav
        className="glass fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl py-2 lg:hidden"
        aria-label="Navegação principal"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200 ${
                active ? 'bg-primary/12 text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
