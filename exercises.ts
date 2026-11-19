import type { Exercise, Muscle } from './types';

/**
 * Base de exercícios compilada a partir de diretrizes clássicas de
 * treinamento resistido (progressão de carga, amplitude completa,
 * priorização de movimentos compostos) — versões para academia e casa.
 */

const e = (
  id: string,
  name: string,
  muscle: Muscle,
  equipment: string,
  minLevel: Exercise['minLevel'] = 'iniciante',
  tip?: string
): Exercise => ({ id, name, muscle, equipment, minLevel, tip });

export const GYM: Exercise[] = [
  // Peito
  e('g-sup-reto', 'Supino reto com barra', 'peito', 'Barra', 'intermediario', 'Escápulas retraídas e pés firmes no chão.'),
  e('g-sup-halteres', 'Supino reto com halteres', 'peito', 'Halteres'),
  e('g-sup-inclinado', 'Supino inclinado com halteres', 'peito', 'Banco + halteres'),
  e('g-crucifixo', 'Crucifixo reto com halteres', 'peito', 'Halteres', 'iniciante', 'Cotovelos levemente flexionados, sem trancar.'),
  e('g-crucifixo-incl', 'Crucifixo inclinado', 'peito', 'Banco inclinado + halteres', 'intermediario'),
  e('g-crossover', 'Crossover na polia', 'peito', 'Polia', 'intermediario'),
  e('g-flexao', 'Flexão de braço (peso corporal)', 'peito', 'Peso corporal'),
  e('g-voador', 'Voador (peck deck)', 'peito', 'Máquina', 'iniciante', 'Controle a fase excêntrica por 2-3 segundos.'),
  // Costas
  e('g-puxada-frente', 'Puxada frontal na polia', 'costas', 'Polia', 'iniciante', 'Puxe com os cotovelos, não com as mãos.'),
  e('g-puxada-triangulo', 'Puxada com triângulo', 'costas', 'Polia'),
  e('g-remada-curvada', 'Remada curvada com barra', 'costas', 'Barra', 'avancado', 'Coluna neutra o tempo todo.'),
  e('g-remada-unilat', 'Remada unilateral (serrote)', 'costas', 'Halter + banco', 'intermediario'),
  e('g-remada-maquina', 'Remada na máquina', 'costas', 'Máquina', 'iniciante'),
  e('g-barra-fixa', 'Barra fixa (pull-up)', 'costas', 'Barra fixa', 'avancado', 'Se não conseguir, use faixa de assistência.'),
  e('g-pulldown', 'Pulldown com pegada aberta', 'costas', 'Polia', 'intermediario'),
  // Pernas
  e('g-agachamento', 'Agachamento livre com barra', 'pernas', 'Barra + rack', 'intermediario', 'Desça até as coxas ficarem paralelas ao chão.'),
  e('g-leg-press', 'Leg press 45°', 'pernas', 'Máquina', 'iniciante'),
  e('g-afundo', 'Afundo (avanço) com halteres', 'pernas', 'Halteres', 'iniciante', 'Tronco ereto e passo longo o suficiente.'),
  e('g-cadeira-ext', 'Cadeira extensora', 'pernas', 'Máquina'),
  e('g-mesa-flex', 'Mesa flexora', 'pernas', 'Máquina', 'iniciante'),
  e('g-stiff', 'Stiff com barra ou halteres', 'pernas', 'Barra/halteres', 'intermediario', 'Empurre o quadril para trás, joelhos semi-flexionados.'),
  e('g-elevacao-pelvica', 'Elevação pélvica (hip thrust)', 'pernas', 'Banco + barra', 'intermediario', 'Contraia o glúteo 1s no topo.'),
  e('g-panturrilha', 'Elevação de panturrilha em pé', 'pernas', 'Máquina/halteres', 'iniciante', 'Amplitude completa, pausa no topo.'),
  e('g-leg-press-unilat', 'Leg press unilateral', 'pernas', 'Máquina', 'intermediario'),
  // Ombros
  e('g-desenvolvimento', 'Desenvolvimento militar com halteres', 'ombros', 'Halteres', 'intermediario', 'Não arqueie as costas; core firme.'),
  e('g-desenvolvimento-maquina', 'Desenvolvimento na máquina', 'ombros', 'Máquina', 'iniciante'),
  e('g-elev-lateral', 'Elevação lateral', 'ombros', 'Halteres', 'iniciante', 'Cotovelos guiando o movimento, sem impulso.'),
  e('g-elev-frontal', 'Elevação frontal', 'ombros', 'Halteres/barra'),
  e('g-crucifixo-inv', 'Crucifixo inverso (posterior)', 'ombros', 'Halteres', 'intermediario', 'Essencial para saúde dos ombros.'),
  e('g-arnold', 'Desenvolvimento Arnold', 'ombros', 'Halteres', 'avancado'),
  e('g-facepull', 'Face pull na polia', 'ombros', 'Polia + corda', 'intermediario', 'Ótimo para postura e deltoides posterior.'),
  // Bíceps
  e('g-rosca-direta', 'Rosca direta com barra', 'biceps', 'Barra W', 'iniciante'),
  e('g-rosca-halteres', 'Rosca com halteres (simultânea)', 'biceps', 'Halteres', 'iniciante'),
  e('g-rosca-martelo', 'Rosca martelo', 'biceps', 'Halteres', 'iniciante', 'Trabalha também o braquial.'),
  e('g-rosca-inclinado', 'Rosca inclinado (alongamento máximo)', 'biceps', 'Banco inclinado + halteres', 'intermediario'),
  e('g-rosca-scott', 'Rosca Scott (banco 45°)', 'biceps', 'Barra W/banco', 'intermediario'),
  // Tríceps
  e('g-triceps-corda', 'Tríceps na polia com corda', 'triceps', 'Polia', 'iniciante', 'Abra a corda no final do movimento.'),
  e('g-triceps-testa', 'Tríceps testa (francês)', 'triceps', 'Barra/halteres', 'intermediario', 'Cotovelos fixos, sem abrir.'),
  e('g-triceps-unilat', 'Tríceps unilateral no banco', 'triceps', 'Peso corporal', 'iniciante', 'O clássico "mergulho no banco".'),
  e('g-triceps-frances', 'Tríceps francês com halter', 'triceps', 'Halter', 'intermediario'),
  // Core
  e('g-prancha', 'Prancha isométrica', 'core', 'Peso corporal', 'iniciante', 'Quadril alinhado, não deixe cair.'),
  e('g-abdominal-supra', 'Abdominal supra no solo', 'core', 'Peso corporal'),
  e('g-elevacao-pernas', 'Elevação de pernas suspensa', 'core', 'Barra fixa', 'intermediario'),
  e('g-rosca-pernas', 'Abdominal na polia (rosca de pernas)', 'core', 'Polia', 'intermediario'),
  e('g-pallof', 'Pallof press na polia', 'core', 'Polia', 'intermediario', 'Anti-rotação: resista ao puxão.'),
  // Cardio
  e('g-corrida', 'Corrida na esteira', 'cardio', 'Esteira'),
  e('g-bike', 'Bicicleta ergométrica', 'cardio', 'Bike'),
  e('g-pular-corda', 'Pular corda', 'cardio', 'Corda'),
];

export const HOME: Exercise[] = [
  // Peito
  e('h-flexao', 'Flexão de braço', 'peito', 'Peso corporal', 'iniciante', 'Ajoelhe-se se precisar — técnica primeiro.'),
  e('h-flexao-inclinada', 'Flexão com pés elevados', 'peito', 'Banco/cadeira', 'intermediario'),
  e('h-flexao-larga', 'Flexão com pegada larga', 'peito', 'Peso corporal'),
  e('h-flexao-diamante', 'Flexão diamante (tríceps)', 'triceps', 'Peso corporal', 'intermediario'),
  // Costas
  e('h-remada-mochila', 'Remada com mochila carregada', 'costas', 'Mochila + livros', 'iniciante', 'Incline o tronco a 45° com apoio.'),
  e('h-scapula', 'Retração escapular (superman)', 'costas', 'Peso corporal', 'iniciante'),
  e('h-remada-toalha', 'Remada isométrica com toalha', 'costas', 'Toalha', 'intermediario', 'Puxe a toalha com força por 10-15s.'),
  // Pernas
  e('h-agachamento', 'Agachamento livre', 'pernas', 'Peso corporal', 'iniciante', 'Pés na largura dos ombros, peito aberto.'),
  e('h-agachamento-salto', 'Agachamento com salto', 'pernas', 'Peso corporal', 'avancado', 'Aterrissagem macia.'),
  e('h-afundo', 'Afundo alternado', 'pernas', 'Peso corporal/mochila', 'iniciante'),
  e('h-poliomenoro', 'Agachamento búlgaro (pé no sofá)', 'pernas', 'Banco/sofá', 'intermediario'),
  e('h-ponte-gluteo', 'Ponte de glúteo', 'pernas', 'Peso corporal', 'iniciante', 'Aperte o glúteo 2s no topo.'),
  e('h-ponte-unilat', 'Ponte de glúteo unilateral', 'pernas', 'Peso corporal', 'intermediario'),
  e('h-panturrilha', 'Elevação de panturrilha em pé', 'pernas', 'Peso corporal', 'iniciante'),
  e('h-agachamento-parede', 'Agachamento estático na parede', 'pernas', 'Parede', 'iniciante'),
  e('h-step-up', 'Subida no degrau (step-up)', 'pernas', 'Escada/degrau', 'iniciante'),
  // Ombros
  e('h-pike-pushup', 'Pike push-up (ombro em casa)', 'ombros', 'Peso corporal', 'intermediario', 'Quadril alto, cabeça entre os braços.'),
  e('h-elev-lateral', 'Elevação lateral com garrafas/mochila', 'ombros', 'Garrafas/mochila', 'iniciante'),
  e('h-circunducao', 'Circundução de ombros com toalha', 'ombros', 'Toalha', 'iniciante'),
  // Bíceps/Tríceps
  e('h-rosca-garrafa', 'Rosca com garrafas/mochila', 'biceps', 'Garrafas/mochila', 'iniciante'),
  e('h-triceps-banco', 'Mergulho no banco (tríceps)', 'triceps', 'Cadeira firme', 'iniciante', 'Ombros longe das orelhas.'),
  // Core
  e('h-prancha', 'Prancha', 'core', 'Peso corporal', 'iniciante'),
  e('h-prancha-lateral', 'Prancha lateral', 'core', 'Peso corporal', 'iniciante'),
  e('h-abdominal', 'Abdominal crunch', 'core', 'Peso corporal'),
  e('h-bicicleta', 'Abdominal bicicleta', 'core', 'Peso corporal', 'iniciante'),
  e('h-mountain', 'Mountain climber', 'core', 'Peso corporal', 'iniciante', 'Quadril baixo, ritmo constante.'),
  e('h-superman', 'Superman (lombar)', 'core', 'Peso corporal', 'iniciante'),
  // Cardio
  e('h-burpee', 'Burpee', 'cardio', 'Peso corporal', 'intermediario'),
  e('h-jumping-jack', 'Jumping jack', 'cardio', 'Peso corporal', 'iniciante'),
  e('h-polichinelo-alto', 'Corrida estacionária (joelho alto)', 'cardio', 'Peso corporal', 'iniciante'),
  e('h-corda-imaginaria', 'Pular corda (simulado)', 'cardio', 'Peso corporal', 'iniciante'),
  e('h-sprint-subida', 'Subir e descer escada', 'cardio', 'Escada', 'intermediario'),
];

export function byId(id: string): Exercise | undefined {
  return [...GYM, ...HOME].find((x) => x.id === id);
}
