import type { UserData } from './types';
import { todayPlanDay } from './workout';
import { ageFromBirthYear } from './nutrition';

/**
 * Motor do Coach IA — coaching comportamental local.
 * Ele analisa o contexto do usuário (treinos concluídos, sequência,
 * objetivo, evolução de peso) e gera mensagens personalizadas.
 * Funciona 100% offline: nenhum dado sai do navegador.
 */

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function streakOf(data: UserData): number {
  const done = data.completions;
  let streak = 0;
  const d = new Date();
  // Se hoje ainda não treinou, começa contando de ontem
  if (!done[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (done[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // ignora fins de semana (sem treino no plano)
      if (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

export function weekProgress(data: UserData): { done: number; total: number } {
  const planned = data.plan?.days.length ?? 0;
  let done = 0;
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  for (let i = 0; i < 5; i++) {
    if (data.completions[d.toISOString().slice(0, 10)]) done++;
    d.setDate(d.getDate() + 1);
  }
  return { done, total: planned };
}

function weightTrend(data: UserData): 'down' | 'up' | 'stable' | 'none' {
  const w = data.weights;
  if (w.length < 2) return 'none';
  const first = w[0].kg;
  const last = w[w.length - 1].kg;
  const delta = last - first;
  if (Math.abs(delta) < 1) return 'stable';
  return delta < 0 ? 'down' : 'up';
}

export function coachReply(input: string, data: UserData): string {
  const msg = input.toLowerCase();
  const name = data.profile.name.split(' ')[0];
  const streak = streakOf(data);
  const week = weekProgress(data);
  const day = todayPlanDay();
  const todayTitle = day ? data.plan?.days.find((d) => d.day === day)?.title : null;
  const levelLabel =
    data.profile.level === 'iniciante'
      ? 'iniciante'
      : data.profile.level === 'intermediario'
        ? 'intermediário'
        : 'avançado';

  if (/(motiv|desanim|desist|cansad|pregui|sem vontade)/.test(msg)) {
    return pick([
      `${name}, motivação vem DEPOIS do começo, não antes. Faça só o aquecimento — se depois disso quiser parar, a gente conversa. Spoiler: você não vai querer.`,
      `Você já acumulou ${streak} dia(s) seguido(s). Cada treino seu é prova de que versões anteriores de você desistiriam — e a de hoje não vai.`,
      `Não precisa estar 100%. Precisa estar presente. 40 minutos hoje valem mais que 2 horas "segunda-feira que vem". Bora?`,
    ]);
  }

  if (/(progresso|evolu|result|como (estou|vou)|andamento)/.test(msg)) {
    const trend = weightTrend(data);
    const weightPart =
      trend === 'down'
        ? 'Seu peso está caindo — a balança está confirmando o esforço.'
        : trend === 'up'
          ? 'Seu peso subiu: se o objetivo é massa muscular, ótimo sinal; se não, vale revisar as calorias na aba Nutrição.'
          : trend === 'stable'
            ? 'Peso estável — consistência mantida, agora é questão de tempo e ajuste fino.'
            : 'Registre seu peso na aba Evolução para eu acompanhar a tendência com você.';
    return `Resumo da semana: ${week.done} de ${week.total} treinos concluídos, nível ${levelLabel}. ${weightPart} E lembre: a foto de hoje é a comparação do mês que vem.`;
  }

  if (/(treino|hoje|segunda|terça|quarta|quinta|sexta)/.test(msg)) {
    if (day && todayTitle)
      return `Hoje é dia de ${todayTitle}. Foco total: técnica limpa antes de carga. Complete as séries marcando no app e me conte no final — quero comemorar com você.`;
    if (day)
      return `Hoje (${day}) não tem treino planejado no plano atual — mas uma caminhada de 20 minutos mantém a sequência viva. Sábado e domingo são de descanso ativo.`;
    return `Fim de semana é descanso ativo: caminhada, alongamento, sol. Segunda-feira a FORJA reabre as portas pra você, ${name}.`;
  }

  if (/(dor|lesion|machuc|joelho|ombro|coluna)/.test(msg)) {
    return `Dor aguda não é "sentir o músculo" — é sinal de parada. Se a dor for persistente ou articular, procure um profissional de saúde antes de continuar. Enquanto isso, priorize mobilidade e exercícios sem carga no ponto dolorido. Seu corpo agradece a paciência.`;
  }

  if (/(dieta|comida|nutri|caloria|prote[ií]na|carbo)/.test(msg)) {
    return `Regra de ouro: o treino esculpe, a cozinha revela. Use a calculadora na aba Nutrição com suas fórmulas (Mifflin-St Jeor + Harris-Benedict) e mire na proteína diária — é ela que protege seu músculo. Água conta também: 35 ml por kg de peso corporal.`;
  }

  if (/(plataforma|estagn|parado|n[aã]o mudo)/.test(msg)) {
    return `Platôs são normais — o corpo se adapta. Três alavancas: 1) progrida carga ou repetições (mesmo +1 rep por semana); 2) durma 7–9h; 3) confira se está comendo o suficiente da calculadora. Se quiser, suba de nível no próximo plano.`;
  }

  if (/(sono|dormir|descanso|recuper)/.test(msg)) {
    return `Músculo se constrói no descanso, não só na academia. Meta: 7–9 horas de sono. Durma em ambiente escuro e frio e evite telas 30 min antes — seu treino de amanhã agradece.`;
  }

  if (/(obrigad|valeu|top|bom demais|amigo)/.test(msg)) {
    return pick([
      `Por nada, ${name}! Estou aqui exatamente pra isso. Agora fecha o chat e vai brilhar no treino.`,
      `Isso aí! Energia boa é combustível. Me conta depois como foi o treino de hoje.`,
    ]);
  }

  // Resposta genérica com contexto
  const options = [
    `Entendi! Me fala mais: está falando do treino, da nutrição ou da evolução? Assim eu consigo te ajudar direitinho.`,
    `Anotado, ${name}! Enquanto isso: ${streak > 0 ? `sua sequência é de ${streak} dia(s) — proteja ela hoje.` : 'hoje é um ótimo dia pra (re)começar a sequência.'}`,
    `Boa pergunta! Posso te ajudar com motivação, análise do seu progresso, dicas de treino, nutrição ou sono. O que manda?`,
  ];
  return pick(options);
}

export function dailyCoachMessage(data: UserData): string {
  const name = data.profile.name.split(' ')[0];
  const streak = streakOf(data);
  const day = todayPlanDay();
  const planDay = day ? data.plan?.days.find((d) => d.day === day) : null;

  if (day && planDay) {
    if (data.completions[new Date().toISOString().slice(0, 10)])
      return `Treino de hoje concluído, ${name}! ${streak} dia(s) de sequência. Descanse, hidrate e se orgulhe — amanhã tem mais.`;
    return pick([
      `Bom dia, ${name}! Hoje é dia de ${planDay.title}: ${planDay.exercises.length} exercícios te esperando. ${streak > 1 ? `Sua sequência de ${streak} dias está pegando fogo — não deixa apagar.` : 'Um treino hoje já constrói sua sequência.'}`,
      `Hoje o plano é ${planDay.title}. Lembre da regra: técnica primeiro, ego depois. Te vejo no final com o treino completo!`,
    ]);
  }
  if (day) return `Hoje o plano descansa, ${name}. Caminhada leve, água e sono de qualidade — segunda-feira a gente volta com tudo.`;
  return `Fim de semana! Descanso ativo, ${name}: alongue, caminhe, toma sol. A evolução acontece nos dois lados do esforço.`;
}

export const QUICK_PROMPTS = [
  'Preciso de motivação',
  'Como está meu progresso?',
  'Qual meu treino hoje?',
  'Dica de nutrição',
  'Estou com dor',
  'Não estou evoluindo',
];

export { ageFromBirthYear };
