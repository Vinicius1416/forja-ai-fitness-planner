import type { FormEvent } from 'react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BotMessageSquare, Send, UserRound } from 'lucide-react';

const Mascot3D = lazy(() => import('./Mascot3D'));
import type { UserData } from '@/lib/types';
import { coachReply, dailyCoachMessage, QUICK_PROMPTS } from '@/lib/coach';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CoachProps {
  data: UserData;
  onChange: (data: UserData) => void;
}

export default function Coach({ data, onChange }: CoachProps) {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [pulse, setPulse] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = data.chat;
  const hasGreeted = messages.length > 0;

  useEffect(() => {
    if (!hasGreeted) {
      onChange({
        ...data,
        chat: [{ role: 'coach', text: dailyCoachMessage(data), ts: new Date().toISOString() }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    setPulse((p) => p + 1);
    const userMsg = { role: 'user' as const, text: clean, ts: new Date().toISOString() };
    onChange({ ...data, chat: [...data.chat, userMsg] });
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply = {
        role: 'coach' as const,
        text: coachReply(clean, data),
        ts: new Date().toISOString(),
      };
      const latest = { ...data, chat: [...data.chat, userMsg, reply] };
      onChange(latest);
      setThinking(false);
    }, 650);
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    send(input);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="min-w-0 space-y-4">
        <div>
          <p className="label-caps">Motivação + análise do seu contexto</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Coach IA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ele conhece seus treinos, sua sequência e seu objetivo — e funciona offline, direto no
            navegador.
          </p>
        </div>

        {/* Chat */}
        <div className="flex h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    m.role === 'user' ? 'bg-secondary' : 'bg-primary/15'
                  }`}
                >
                  {m.role === 'user' ? (
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <BotMessageSquare className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-tr-md bg-secondary text-foreground'
                      : 'rounded-tl-md bg-accent text-accent-foreground'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <BotMessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-accent px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sugestões */}
          <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Desabafe, pergunte, peça motivação…"
              className="h-11 rounded-xl"
              maxLength={300}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={!input.trim() || thinking} aria-label="Enviar mensagem">
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Mascote ao lado (desktop) / acima (mobile) */}
      <div className="relative order-first hidden min-h-[380px] overflow-hidden rounded-2xl border border-border lg:order-last lg:block" aria-hidden="true">
        <Suspense fallback={<div className="holo-ring absolute inset-0" aria-hidden="true" />}>
          <Mascot3D pulse={pulse} className="absolute inset-0" />
        </Suspense>
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-card to-transparent p-4 pt-10 text-center text-xs text-muted-foreground">
          FORJA-BOT · seu treinador pessoal holográfico
        </p>
      </div>
    </div>
  );
}
