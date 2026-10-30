import { useEffect, useState } from 'react'
import './App.css'
import './features.css'
import './polish.css'
import otherWorldBackground from './assets/outro-mundo-fundo.png'
import clockRoomBackground from './assets/relogio-sala.png'
import clockGuardian from './assets/relogio-vigia-botoes.png'
import doorOpeningScene from './assets/porta-secreta.gif'
import catPinkPalaceScene from './assets/gato-preto-placa.gif'
import diarySecretScene from './assets/diario-secreto.png'
import layverseLogo from './assets/layverse-logo.png'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient.js'

const navigation = [
  ['portal', '◉', 'A Porta Secreta', 'Início'],
  ['diario', '▤', 'O Diário', 'Cronograma'],
  ['chaves', '⚿', 'Sala das Chaves', 'Matérias'],
  ['relogio', '◷', 'O Relógio', 'Sessão'],
  ['mundo', '✦', 'O Outro Mundo', 'Questões'],
  ['gato', '⌁', 'O Gato', 'Progresso'],
]

const pageRoutes = {
  portal: '#inicio',
  diario: '#diario',
  chaves: '#materias',
  relogio: '#sessao',
  mundo: '#outro-mundo',
  gato: '#progresso',
}

function pageFromHash(hash) {
  return Object.entries(pageRoutes).find(([, route]) => route === hash)?.[0] || 'portal'
}

const blueprints = {
  ENEM: {
    subjects: [['Linguagens', 'Português, literatura, idiomas e artes', 'base Enem'], ['Matemática', 'Álgebra, geometria e problemas', 'base Enem'], ['Ciências Humanas', 'História, geografia, filosofia e sociologia', 'base Enem'], ['Ciências da Natureza', 'Biologia, física e química', 'base Enem'], ['Redação', 'Prática, repertório e correção', 'base Enem']],
    tasks: [['Linguagens', 'Interpretação, gêneros textuais e variação linguística', '50 min', false], ['Matemática', 'Porcentagem, razão, proporção e leitura de gráficos', '50 min', false], ['Redação', 'Tese, argumentos e proposta de intervenção', '40 min', false], ['Natureza', 'Ecologia, energia e transformações químicas', '40 min', false]],
    resourceNote: 'Estrutura baseada nas áreas oficiais do Enem.',
    templateLabel: 'Estrutura Enem',
  },
  GCM: {
    subjects: [['Língua Portuguesa', 'Leitura, gramática e interpretação', 'base GCM'], ['Raciocínio Lógico', 'Problemas e matemática básica', 'base GCM'], ['Direito Constitucional', 'Direitos e princípios', 'base GCM'], ['Legislação Municipal', 'Normas do município', 'conferir edital'], ['Conhecimentos Específicos', 'Conteúdo do cargo e edital', 'conferir edital']],
    tasks: [['Português', 'Interpretação, classes de palavras e concordância', '50 min', false], ['Raciocínio Lógico', 'Proposições, porcentagem e problemas lógicos', '50 min', false], ['Legislação', 'Estatuto das Guardas e leis previstas no edital', '40 min', false], ['Questões', 'Simulado por banca, cargo e assunto', '40 min', false]],
    resourceNote: 'Base para GCM. Confirme as matérias, leis e a banca no edital do município.',
    templateLabel: 'Base Guarda Civil Municipal',
  },
  SEFAZ: {
    subjects: [['Língua Portuguesa', 'Interpretação e redação oficial', 'base SEFAZ'], ['Direito Tributário', 'Tributos e legislação fiscal', 'base SEFAZ'], ['Contabilidade', 'Contabilidade geral e pública', 'base SEFAZ'], ['Administração Pública', 'Gestão e legislação', 'base SEFAZ'], ['Conhecimentos Específicos', 'Conteúdo do cargo e edital', 'conferir edital']],
    tasks: [['Direito Tributário', 'Espécies tributárias, crédito e obrigação tributária', '50 min', false], ['Contabilidade', 'Lançamentos, patrimônio e demonstrações', '50 min', false], ['Edital', 'Matérias, pesos e legislação específica do estado', '30 min', false], ['Questões', 'Simulado por cargo, banca e assunto', '40 min', false]],
    resourceNote: 'Base para SEFAZ. O conteúdo muda por estado, cargo e edital; confirme antes de estudar.',
    templateLabel: 'Base Secretaria da Fazenda',
  },
  Concurso: {
    subjects: [['Língua Portuguesa', 'Leitura e interpretação', 'estrutura inicial'], ['Conhecimentos específicos', 'Conferir o edital', 'estrutura inicial'], ['Legislação', 'Normas do cargo ou órgão', 'estrutura inicial'], ['Questões e revisão', 'Erros e pontos pendentes', 'estrutura inicial']],
    tasks: [['Língua Portuguesa', 'Interpretação, gramática e redação oficial', '50 min', false], ['Edital', 'Matérias, pesos e tópicos cobrados', '30 min', false], ['Questões de treino', 'Simulado por cargo, banca e assunto', '40 min', false], ['Revisão', 'Erros recorrentes e dúvidas da semana', '30 min', false]],
    resourceNote: 'Adicione o link do edital para confirmar as matérias deste concurso.',
  },
  Vestibular: {
    subjects: [['Linguagens', 'Português, literatura e idiomas', 'estrutura inicial'], ['Matemática', 'Álgebra, geometria e problemas', 'estrutura inicial'], ['Ciências Humanas', 'História, geografia e filosofia', 'estrutura inicial'], ['Ciências da Natureza', 'Biologia, física e química', 'estrutura inicial'], ['Redação', 'Prática e repertório', 'estrutura inicial']],
    tasks: [['Linguagens', 'Interpretação, literatura e recursos expressivos', '50 min', false], ['Matemática', 'Funções, geometria e problemas', '50 min', false], ['Redação', 'Tese, argumentos e conclusão', '40 min', false], ['Revisão', 'Erros, dúvidas e conteúdos pendentes', '30 min', false]],
    resourceNote: 'Escolha a instituição ou o exame para confirmar a matriz e as provas oficiais.',
  },
  Faculdade: {
    subjects: [['Disciplina principal', 'Adicionar a primeira matéria', 'a personalizar'], ['Leituras', 'Textos e capítulos da semana', 'a personalizar'], ['Trabalhos', 'Prazos e entregas', 'a personalizar'], ['Provas', 'Revisões por disciplina', 'a personalizar']],
    tasks: [['Organização', 'Listar suas disciplinas', '20 min', false], ['Leitura', 'Separar o próximo texto', '50 min', false], ['Revisão', 'Atualizar anotações', '30 min', false]],
    resourceNote: 'Esta área é sua: adicione as disciplinas e materiais da faculdade.',
  },
  Curso: {
    subjects: [['Módulo atual', 'Definir o primeiro módulo', 'a personalizar'], ['Prática', 'Exercícios ou projeto', 'a personalizar'], ['Revisão', 'Retomar pontos difíceis', 'a personalizar']],
    tasks: [['Planejamento', 'Listar módulos do curso', '20 min', false], ['Estudo', 'Começar o próximo módulo', '50 min', false], ['Prática', 'Fazer um exercício', '40 min', false]],
    resourceNote: 'Adicione os módulos e links do curso que você está fazendo.',
  },
  Outro: {
    subjects: [['Primeiro assunto', 'Dê um nome ao que vai estudar', 'a personalizar'], ['Materiais', 'Links, livros ou anotações', 'a personalizar'], ['Revisão', 'O que merece voltar depois', 'a personalizar']],
    tasks: [['Planejamento', 'Escrever seu primeiro passo', '20 min', false]],
    resourceNote: 'Crie os assuntos e materiais que fizerem sentido para este objetivo.',
  },
}

const practiceQuestions = {
  ENEM: { category: 'MATEMÁTICA · QUESTÃO AUTORAL', prompt: 'Uma mochila custa R$ 120,00. Em uma promoção, seu preço recebe desconto de 25%. Qual será o valor final?', alternatives: ['R$ 30,00', 'R$ 75,00', 'R$ 90,00', 'R$ 95,00'], answer: 2, explanation: '25% de R$ 120,00 é R$ 30,00. Então, R$ 120,00 − R$ 30,00 = R$ 90,00.', sourceLabel: 'Referência: Matriz de Referência do Enem — Matemática e suas Tecnologias (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
  GCM: { category: 'GCM · QUESTÃO AUTORAL', prompt: 'De acordo com o Estatuto Geral das Guardas Municipais, qual é a função das guardas municipais?', alternatives: ['Realizar exclusivamente investigação criminal federal.', 'Exercer a proteção municipal preventiva.', 'Substituir integralmente as polícias civis.', 'Atuar apenas na cobrança de tributos municipais.'], answer: 1, explanation: 'A Lei nº 13.022/2014 define as guardas municipais como instituições de caráter civil voltadas à proteção municipal preventiva.', sourceLabel: 'Referência: Lei nº 13.022/2014, art. 2º — Estatuto Geral das Guardas Municipais', sourceUrl: 'https://planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13022.htm' },
  SEFAZ: { category: 'SEFAZ · QUESTÃO AUTORAL', prompt: 'Segundo o Código Tributário Nacional, qual característica faz parte da definição de tributo?', alternatives: ['É uma punição aplicada por ato ilícito.', 'É sempre opcional para o contribuinte.', 'É instituído em lei e cobrado mediante atividade administrativa vinculada.', 'Só pode ser pago em bens, nunca em moeda.'], answer: 2, explanation: 'O art. 3º do CTN define tributo como prestação pecuniária compulsória, instituída em lei, que não constitui sanção de ato ilícito.', sourceLabel: 'Referência: Código Tributário Nacional, art. 3º', sourceUrl: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
  Concurso: { category: 'CONCURSO · QUESTÃO AUTORAL', prompt: 'Qual princípio exige que a administração pública atue de acordo com a lei?', alternatives: ['Princípio da legalidade.', 'Princípio da publicidade.', 'Princípio da eficiência.', 'Princípio da moralidade.'], answer: 0, explanation: 'A legalidade integra os princípios expressos da administração pública no art. 37 da Constituição Federal.', sourceLabel: 'Referência: Constituição Federal, art. 37', sourceUrl: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicaocompilado.htm' },
  Vestibular: { category: 'VESTIBULAR · QUESTÃO AUTORAL', prompt: 'Uma turma com 40 estudantes tem 30 participantes em uma atividade. Qual percentual da turma participou?', alternatives: ['25%', '40%', '70%', '75%'], answer: 3, explanation: '30 dividido por 40 equivale a 0,75, ou 75%.', sourceLabel: 'Referência: Matriz de Referência do Enem — resolução de problemas numéricos (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
  Faculdade: { category: 'FACULDADE · QUESTÃO AUTORAL', prompt: 'Qual prática ajuda mais a identificar o que ainda precisa ser revisado antes de uma prova?', alternatives: ['Ler o mesmo texto sem pausa.', 'Tentar recuperar o conteúdo sem consultar o material.', 'Evitar exercícios para não errar.', 'Estudar apenas na véspera.'], answer: 1, explanation: 'Tentar recordar e resolver exercícios revela lacunas e orienta a revisão.', sourceLabel: 'Questão autoral do Layverse — treino de organização de estudos', sourceUrl: '' },
  Curso: { category: 'CURSO · QUESTÃO AUTORAL', prompt: 'Ao iniciar um módulo novo, qual é um bom primeiro passo?', alternatives: ['Pular direto para o último exercício.', 'Definir o objetivo do módulo e separar o material necessário.', 'Ignorar as partes que parecem difíceis.', 'Estudar sem registrar dúvidas.'], answer: 1, explanation: 'Um objetivo claro e o material separado tornam a sessão mais fácil de começar e acompanhar.', sourceLabel: 'Questão autoral do Layverse — treino de organização de estudos', sourceUrl: '' },
  Outro: { category: 'QUESTÃO AUTORAL', prompt: 'Qual é a forma mais útil de transformar um objetivo amplo em uma tarefa de estudo?', alternatives: ['Esperar ter muitas horas livres.', 'Escrever uma ação pequena e específica para hoje.', 'Estudar vários assuntos ao mesmo tempo.', 'Evitar anotar o que precisa ser feito.'], answer: 1, explanation: 'Uma ação pequena e específica reduz a barreira para começar e deixa claro o próximo passo.', sourceLabel: 'Questão autoral do Layverse — treino de organização de estudos', sourceUrl: '' },
}

const questionSets = {
  ENEM: [
    { id: 'enem-linguagens', subject: 'Linguagens', category: 'LINGUAGENS · QUESTÃO AUTORAL', prompt: 'Em uma campanha de doação, a frase “Uma mochila parada não leva ninguém adiante” procura principalmente:', alternatives: ['informar um dado estatístico.', 'convidar o leitor a agir por meio de uma imagem figurada.', 'explicar uma regra gramatical.', 'relatar um fato histórico.'], answer: 1, explanation: 'A frase usa uma imagem figurada para incentivar a doação e mobilizar o leitor.', sourceLabel: 'Questão autoral do Layverse — referência de habilidade: Matriz do Enem, Linguagens (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
    { id: 'enem-matematica', subject: 'Matemática', category: 'MATEMÁTICA · QUESTÃO AUTORAL', prompt: 'Uma mochila custa R$ 120,00. Em uma promoção, recebe desconto de 25%. Qual será o valor final?', alternatives: ['R$ 30,00', 'R$ 75,00', 'R$ 90,00', 'R$ 95,00'], answer: 2, explanation: '25% de R$ 120,00 é R$ 30,00. Logo, o valor final é R$ 90,00.', sourceLabel: 'Referência: Matriz do Enem — Matemática e suas Tecnologias (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
    { id: 'enem-humanas', subject: 'Ciências Humanas', category: 'CIÊNCIAS HUMANAS · QUESTÃO AUTORAL', prompt: 'Uma fonte histórica deve ser analisada considerando o período e os interesses de quem a produziu porque:', alternatives: ['todo documento é totalmente neutro.', 'o contexto influencia a produção e a interpretação da fonte.', 'somente textos oficiais têm valor histórico.', 'fontes visuais não podem ser estudadas.'], answer: 1, explanation: 'Fontes são produzidas em contextos sociais e políticos, que precisam ser considerados na interpretação.', sourceLabel: 'Questão autoral do Layverse — referência de habilidade: Matriz do Enem, Ciências Humanas (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
    { id: 'enem-natureza', subject: 'Ciências da Natureza', category: 'CIÊNCIAS DA NATUREZA · QUESTÃO AUTORAL', prompt: 'Em uma cadeia alimentar, a diminuição acentuada de produtores tende a afetar os demais níveis porque os produtores:', alternatives: ['são a base de entrada de energia no ecossistema.', 'consomem todos os decompositores.', 'eliminam a necessidade de água.', 'ocupam sempre o último nível trófico.'], answer: 0, explanation: 'Os produtores capturam energia e sustentam, direta ou indiretamente, os demais níveis da cadeia.', sourceLabel: 'Questão autoral do Layverse — referência de habilidade: Matriz do Enem, Ciências da Natureza (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
    { id: 'enem-redacao', subject: 'Redação', category: 'REDAÇÃO · EXERCÍCIO AUTORAL', prompt: 'Ao planejar uma redação argumentativa, qual elemento ajuda a sustentar melhor o ponto de vista?', alternatives: ['Apenas repetir o tema.', 'Apresentar argumentos ligados a repertório e exemplos pertinentes.', 'Usar o maior número possível de palavras difíceis.', 'Evitar qualquer proposta de solução.'], answer: 1, explanation: 'Argumentos desenvolvidos com repertório pertinente fortalecem a defesa de um ponto de vista.', sourceLabel: 'Referência: Cartilha do Participante do Enem (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos' },
  ],
}

const extraEnemQuestions = [
  { id: 'enem-linguagens-2', subject: 'Linguagens', category: 'LINGUAGENS · QUESTÃO AUTORAL', prompt: 'Em um aviso de biblioteca, a expressão “silêncio também é cuidado” associa o silêncio à ideia de:', alternatives: ['isolamento obrigatório.', 'respeito à convivência coletiva.', 'proibição de leitura.', 'falta de comunicação.'], answer: 1, explanation: 'O enunciado usa uma formulação curta para relacionar silêncio e respeito ao espaço compartilhado.', sourceLabel: 'Questão autoral do Layverse — referência: Matriz do Enem, Linguagens (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
  { id: 'enem-matematica-2', subject: 'Matemática', category: 'MATEMÁTICA · QUESTÃO AUTORAL', prompt: 'Um curso custa R$ 150,00 e recebe desconto de 20%. Qual é o preço com desconto?', alternatives: ['R$ 30,00', 'R$ 120,00', 'R$ 130,00', 'R$ 170,00'], answer: 1, explanation: '20% de R$ 150,00 é R$ 30,00. Subtraindo o desconto, o preço é R$ 120,00.', sourceLabel: 'Questão autoral do Layverse — referência: Matriz do Enem, Matemática (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
  { id: 'enem-humanas-2', subject: 'Ciências Humanas', category: 'CIÊNCIAS HUMANAS · QUESTÃO AUTORAL', prompt: 'Quando uma comunidade preserva edifícios, documentos e relatos locais, ela contribui principalmente para:', alternatives: ['apagar interpretações diferentes do passado.', 'preservar referências de memória e patrimônio.', 'substituir toda pesquisa histórica.', 'impedir mudanças culturais.'], answer: 1, explanation: 'Patrimônio e memória preservam referências que ajudam a interpretar experiências coletivas.', sourceLabel: 'Questão autoral do Layverse — referência: Matriz do Enem, Ciências Humanas (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
  { id: 'enem-natureza-2', subject: 'Ciências da Natureza', category: 'CIÊNCIAS DA NATUREZA · QUESTÃO AUTORAL', prompt: 'A separação de resíduos em recicláveis e não recicláveis contribui para reduzir impactos ambientais porque:', alternatives: ['elimina toda a produção de lixo.', 'favorece o reaproveitamento de materiais.', 'substitui o tratamento de água.', 'aumenta o consumo de recursos naturais.'], answer: 1, explanation: 'A reciclagem permite que parte dos materiais retorne a cadeias produtivas.', sourceLabel: 'Questão autoral do Layverse — referência: Matriz do Enem, Ciências da Natureza (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem' },
  { id: 'enem-redacao-2', subject: 'Redação', category: 'REDAÇÃO · EXERCÍCIO AUTORAL', prompt: 'Uma proposta de intervenção bem construída deve indicar, entre outros elementos:', alternatives: ['apenas um título criativo.', 'agente, ação e finalidade da proposta.', 'uma opinião sem justificativa.', 'a repetição da introdução.'], answer: 1, explanation: 'Uma proposta detalhada informa quem fará o quê e com qual finalidade.', sourceLabel: 'Referência: Cartilha do Participante do Enem (Inep)', sourceUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos' },
]

function questionsForTrack(blueprintKey, subjects, type) {
  if (questionSets[blueprintKey]) return [...questionSets[blueprintKey], ...extraEnemQuestions]
  const base = practiceQuestions[blueprintKey] || practiceQuestions[type] || practiceQuestions.Outro
  return subjects.flatMap(([subject], index) => [{ ...base, id: `${blueprintKey.toLowerCase()}-${index}`, subject, category: `${subject.toUpperCase()} · QUESTÃO AUTORAL` }, { ...base, id: `${blueprintKey.toLowerCase()}-${index}-revisao`, subject, category: `${subject.toUpperCase()} · REVISÃO`, prompt: `Depois de estudar ${subject}, qual ação ajuda mais a descobrir o que ainda precisa ser revisado?`, alternatives: ['Tentar resolver uma questão sem consultar o material.', 'Evitar exercícios para não errar.', 'Pular para outro assunto sem registrar dúvidas.', 'Ler apenas o título do conteúdo.'], answer: 0, explanation: 'Resolver e recuperar o conteúdo sem consulta ajuda a identificar lacunas reais.', sourceLabel: 'Questão autoral do Layverse — treino de revisão', sourceUrl: '' }])
}

function makeTrack(name, type) {
  const normalizedName = name.toLowerCase()
  const blueprintKey = /\benem\b/.test(normalizedName) ? 'ENEM' : /\b(gcm|guarda civil)\b/.test(normalizedName) ? 'GCM' : /\bsefaz\b/.test(normalizedName) ? 'SEFAZ' : type
  const base = blueprints[blueprintKey]
  const isEnem = blueprintKey === 'ENEM'
  return {
    id: `${Date.now()}`,
    label: name,
    type,
    subjects: base.subjects,
    tasks: base.tasks,
    resourceNote: isEnem ? 'Provas e gabaritos oficiais do Enem estão disponíveis no Inep.' : base.resourceNote,
    templateLabel: base.templateLabel || `${type} personalizado`,
    question: practiceQuestions[blueprintKey] || practiceQuestions[type] || practiceQuestions.Outro,
    questions: questionsForTrack(blueprintKey, base.subjects, type),
    results: {},
    schedule: makeWeeklySchedule(base.tasks),
    resources: isEnem ? [['Provas e gabaritos oficiais do Enem', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos']] : [],
  }
}

const STORAGE_KEY = 'aprova-study-spaces-v1'

function daysUntil(date) {
  if (!date) return '—'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  return Math.max(0, Math.ceil((target - today) / 86400000))
}

function localDateKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function makeWeeklySchedule(tasks) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + dayIndex)
    const first = tasks[dayIndex % tasks.length]
    const second = tasks[(dayIndex + 1) % tasks.length]
    return [localDateKey(date), [[...first.slice(0, 3), false], [...second.slice(0, 3), false]]]
  }).reduce((schedule, [key, plan]) => ({ ...schedule, [key]: plan }), {})
}

function makeScheduleUntilExam(tasks, examDate, existingSchedule = {}) {
  if (!examDate) return existingSchedule
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(`${examDate}T12:00:00`)
  const totalDays = Math.min(365, Math.max(0, Math.ceil((end - start) / 86400000)))
  const schedule = { ...existingSchedule }
  for (let dayIndex = 0; dayIndex <= totalDays; dayIndex += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + dayIndex)
    const key = localDateKey(date)
    if (schedule[key]?.length) continue
    const first = tasks[dayIndex % tasks.length]
    const second = tasks[(dayIndex + 1) % tasks.length]
    const isReviewDay = date.getDay() === 0
    schedule[key] = isReviewDay
      ? [['Revisão', `Retomar erros de ${first[0]} e ${second[0]}`, '40 min', false]]
      : [[...first.slice(0, 3), false], [...second.slice(0, 3), false]]
  }
  return schedule
}

function App() {
  const [activePage, setActivePage] = useState(() => pageFromHash(window.location.hash))
  const [menuOpen, setMenuOpen] = useState(false)
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [studyTracks, setStudyTracks] = useState([])
  const [activeTrack, setActiveTrack] = useState(null)
  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackType, setNewTrackType] = useState('Concurso')
  const [newTrackDate, setNewTrackDate] = useState('')
  const [newSubjectName, setNewSubjectName] = useState('')
  const [selectedQuestionSubject, setSelectedQuestionSubject] = useState('')
  const [questionPosition, setQuestionPosition] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [account, setAccount] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [cloudReady, setCloudReady] = useState(!isSupabaseConfigured)
  const [cloudState, setCloudState] = useState(isSupabaseConfigured ? 'connecting' : 'not-configured')
  const [studySelection, setStudySelection] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
      const tracks = Array.isArray(saved?.tracks) ? saved.tracks.filter((track) => Array.isArray(track.subjects) && Array.isArray(track.tasks)).map((track) => {
        const seeded = makeTrack(track.label, track.type)
        const refreshedTasks = seeded.tasks.map((task, index) => [...task.slice(0, 3), Boolean(track.tasks[index]?.[3])])
        if (track.questions?.length >= seeded.questions.length) return { ...track, tasks: refreshedTasks }
        return { ...track, subjects: seeded.subjects, tasks: refreshedTasks, question: seeded.question, questions: seeded.questions, results: track.results || {}, templateLabel: seeded.templateLabel, resourceNote: seeded.resourceNote, resources: seeded.resources }
      }) : []
      const selected = tracks.find((track) => track.id === saved?.activeId) || tracks[0] || null
      setStudyTracks(tracks)
      setActiveTrack(selected)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    const syncRoute = () => setActivePage(pageFromHash(window.location.hash))
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    if (!hydrated || !supabase) {
      if (hydrated) setCloudState('not-configured')
      return undefined
    }
    let active = true
    const loadAccount = async (session) => {
      if (!active) return
      const user = session?.user || null
      setAccount(user)
      if (!user) { setCloudReady(true); setCloudState('ready'); return }
      const { data, error } = await supabase.from('study_tracks').select('data').order('updated_at', { ascending: false })
      if (!active) return
      if (!error && data?.length) {
        const cloudTracks = data.map((row) => row.data).filter((track) => track?.id && Array.isArray(track.tasks))
        if (cloudTracks.length) {
          setStudyTracks(cloudTracks)
          setActiveTrack(cloudTracks[0])
        }
      }
      setCloudReady(true)
      setCloudState(error ? 'error' : 'synced')
    }
    supabase.auth.getSession().then(({ data }) => loadAccount(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => loadAccount(session))
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tracks: studyTracks, activeId: activeTrack?.id || null }))
  }, [studyTracks, activeTrack, hydrated])

  useEffect(() => {
    if (!supabase || !account || !cloudReady || !hydrated) return
    const payload = studyTracks.map((track) => ({ user_id: account.id, client_id: track.id, label: track.label, type: track.type, data: track }))
    if (payload.length) {
      setCloudState('saving')
      supabase.from('study_tracks').upsert(payload, { onConflict: 'user_id,client_id' }).then(({ error }) => setCloudState(error ? 'error' : 'synced'))
    }
  }, [studyTracks, account, cloudReady, hydrated])

  useEffect(() => {
    if (!running || seconds === 0) return undefined
    const timer = setInterval(() => setSeconds((current) => current - 1), 1000)
    return () => clearInterval(timer)
  }, [running, seconds])

  useEffect(() => {
    if (seconds === 0 && running) setRunning(false)
  }, [seconds, running])

  const activate = (page) => {
    const route = pageRoutes[page] || pageRoutes.portal
    if (window.location.hash !== route) window.location.hash = route
    else setActivePage(page)
    setMenuOpen(false)
  }
  const startTopic = (subject, topic) => {
    setStudySelection({ subject, topic })
    activate('relogio')
  }
  const completed = activeTrack ? activeTrack.tasks.filter((task) => task[3]).length : 0
  const results = activeTrack ? Object.values(activeTrack.results || {}) : []
  const questionStats = { answered: results.length, correct: results.filter(Boolean).length, wrong: results.filter((result) => !result).length }
  const ambientTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const toggleTask = (index) => {
    const updated = { ...activeTrack, tasks: activeTrack.tasks.map((task, itemIndex) => itemIndex === index ? [...task.slice(0, 3), !task[3]] : task) }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
  }
  const updateSchedule = (schedule) => {
    const updated = { ...activeTrack, schedule }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
  }
  const pageName = navigation.find((item) => item[0] === activePage)
  const createTrack = (event) => {
    event.preventDefault()
    const label = newTrackName.trim()
    if (!label) return
    const track = { ...makeTrack(label, newTrackType), examDate: newTrackDate }
    setStudyTracks((current) => [...current, track])
    setActiveTrack(track)
    setNewTrackName('')
    setNewTrackDate('')
  }
  const addSubject = (event) => {
    event.preventDefault()
    const name = newSubjectName.trim()
    if (!name || !activeTrack) return
    const updated = { ...activeTrack, subjects: [...activeTrack.subjects, [name, 'Assunto personalizado', 'novo']] }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
    setNewSubjectName('')
  }
  const toggleTopic = (subject, topic) => {
    const subjectChecks = activeTrack.topicChecks || {}
    const updated = { ...activeTrack, topicChecks: { ...subjectChecks, [subject]: { ...(subjectChecks[subject] || {}), [topic]: !subjectChecks[subject]?.[topic] } } }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
  }
  const recordAnswer = (questionId, isCorrect) => {
    const updated = { ...activeTrack, results: { ...(activeTrack.results || {}), [questionId]: isCorrect } }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
  }
  const completeSimulation = (simulation, answers) => {
    const results = simulation.reduce((current, question, index) => ({ ...current, [question.id]: answers[index] === question.answer }), {})
    const updated = { ...activeTrack, results: { ...(activeTrack.results || {}), ...results } }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
  }
  const setExamDate = (examDate) => {
    const updated = { ...activeTrack, examDate }
    setActiveTrack(updated)
    setStudyTracks((current) => current.map((track) => track.id === updated.id ? updated : track))
  }
  const buildScheduleToExam = () => {
    if (!activeTrack?.examDate) return
    updateSchedule(makeScheduleUntilExam(activeTrack.tasks, activeTrack.examDate, activeTrack.schedule || {}))
  }

  return <main className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="brand"><img className="brand-logo" src={layverseLogo} alt="Layverse" /><div><strong>Layverse</strong><small>diário de preparação</small></div></div>
      <nav aria-label="Navegação principal">{navigation.map(([id, icon, name, label]) => <button key={id} disabled={!activeTrack && id !== 'portal'} className={activePage === id ? 'nav-item active' : 'nav-item'} onClick={() => activate(id)}><span>{icon}</span><span><b>{name}</b><small>{label}</small></span></button>)}</nav>
      <div className="cat-card"><span aria-hidden="true">⌁</span><p><b>Companhia de estudo</b>Uma sessão de cada vez.<br />O gato está de olho em você.</p></div>
    </aside>
    <section className="content">
      <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰</button><div className="breadcrumb"><span>Layverse</span><i>•</i><b>{pageName[1]} {pageName[2]}</b></div>{activeTrack ? <><label className="track-picker"><span>Seu caminho</span><select value={activeTrack.id} onChange={(event) => { setSelectedAnswer(null); setSelectedQuestionSubject(''); setQuestionPosition(0); setActiveTrack(studyTracks.find((track) => track.id === event.target.value)) }}>{studyTracks.map((track) => <option value={track.id} key={track.id}>{track.label}</option>)}</select></label><button className="new-track-button" onClick={() => { setActiveTrack(null); activate('portal') }}>+ nova área</button><button className={`ambient-timer ${running ? 'running' : ''}`} onClick={() => activate('relogio')} aria-label="Abrir Relógio"><span>{running ? 'foco em andamento' : 'relógio'}</span><b>{ambientTime}</b></button></> : <span className="empty-topbar">nenhum caminho criado</span>}<button className="profile" onClick={() => setAuthOpen(true)}><span className="avatar">{account?.email?.[0]?.toUpperCase() || 'L'}</span><span>{account ? account.email : 'Minha conta'}</span></button></header>
      {!activeTrack && <CreateFirstTrack name={newTrackName} setName={setNewTrackName} type={newTrackType} setType={setNewTrackType} date={newTrackDate} setDate={setNewTrackDate} onCreate={createTrack} hasExisting={studyTracks.length > 0} />}
      {activeTrack && activePage === 'portal' && <Dashboard onStudy={() => activate('relogio')} onStudyTopic={startTopic} onDiary={() => activate('diario')} completed={completed} stats={questionStats} track={activeTrack} onSetExamDate={setExamDate} />}
      {activeTrack && activePage === 'diario' && <Diary taskList={activeTrack.tasks} track={activeTrack} onUpdateSchedule={updateSchedule} onBuildPlan={buildScheduleToExam} />}
      {activeTrack && activePage === 'chaves' && <Subjects track={activeTrack} newSubjectName={newSubjectName} setNewSubjectName={setNewSubjectName} onAddSubject={addSubject} onToggleTopic={toggleTopic} onStudyTopic={startTopic} />}
      {activeTrack && activePage === 'relogio' && <div className="clock-room-shell" style={{ '--clock-room-background': `url(${clockRoomBackground})` }}><Timer seconds={seconds} running={running} track={activeTrack} studySelection={studySelection} onToggle={() => setRunning(!running)} onReset={() => { setRunning(false); setSeconds(25 * 60) }} /></div>}
      {activeTrack && activePage === 'mundo' && <div className="other-world-shell" style={{ '--other-world-background': `url(${otherWorldBackground})` }}><Questions key={activeTrack.id} track={activeTrack} onComplete={completeSimulation} /></div>}
      {activeTrack && activePage === 'gato' && <Progress completed={completed} track={activeTrack} />}
      {authOpen && <AuthPanel account={account} cloudState={cloudState} onClose={() => setAuthOpen(false)} />}
    </section>
  </main>
}

function AuthPanel({ account, cloudState, onClose }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    if (!supabase) { setError('Conecte o Supabase no arquivo .env.local e reinicie o servidor para ativar as contas.'); return }
    setLoading(true); setError(''); setMessage('')
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (result.error) { setError(result.error.message); return }
    setMessage(mode === 'signin' ? 'Conta conectada. Seus espaços serão sincronizados automaticamente.' : result.data.session ? 'Conta criada e conectada.' : 'Conta criada. Verifique seu e-mail antes de entrar, se o Supabase pedir confirmação.')
  }
  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    onClose()
  }
  const syncText = { 'not-configured': 'Supabase ainda não foi configurado neste dispositivo.', connecting: 'Conectando ao Supabase…', ready: 'Pronto para sincronizar quando você entrar.', saving: 'Salvando suas mudanças…', synced: 'Dados sincronizados nesta conta.', error: 'Não foi possível sincronizar agora. Suas mudanças continuam seguras neste navegador.' }[cloudState]
  return <div className="auth-overlay" role="presentation" onMouseDown={onClose}><section className="auth-panel" role="dialog" aria-modal="true" aria-label="Sua conta" onMouseDown={(event) => event.stopPropagation()}><button className="auth-close" onClick={onClose} aria-label="Fechar">×</button><p className="eyebrow">A chave da sua porta</p>{account ? <><h2>Você está conectada.</h2><p className="auth-copy">{account.email}<br />Seus caminhos serão guardados nesta conta.</p><p className={`sync-state ${cloudState}`}>{syncText}</p><button className="secondary-button" onClick={signOut}>Sair desta conta</button></> : <><h2>{mode === 'signin' ? 'Entrar no Layverse.' : 'Criar sua conta.'}</h2><p className="auth-copy">Entre para manter suas áreas, cronogramas e resultados mesmo em outro dispositivo.</p><p className={`sync-state ${cloudState}`}>{syncText}</p><form className="auth-form" onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 6 caracteres" minLength="6" required /></label><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Aguarde…' : mode === 'signin' ? 'Entrar →' : 'Criar conta →'}</button></form>{message && <p className="auth-message">{message}</p>}{error && <p className="auth-error">{error}</p>}<button className="auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}>{mode === 'signin' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}</button></>}</section></div>
}

function CreateFirstTrack({ name, setName, type, setType, date, setDate, onCreate, hasExisting }) {
  return <div className="page first-track"><p className="eyebrow">{hasExisting ? 'Nova área de estudo' : 'Além da porta · seu espaço de estudos'}</p><section className="first-track-card"><div className="first-track-door"><span>⚿</span><small>01</small></div><div><p className="hero-kicker">{hasExisting ? 'ADICIONAR UMA ÁREA' : 'PRIMEIRO ESPAÇO'}</p><h1>{hasExisting ? <>Abra outra<br /><em>porta.</em></> : <>Qual área você<br />quer organizar?</>}</h1><p>{hasExisting ? 'Ela terá matérias, tarefas e registros próprios. Nada será misturado com as outras áreas.' : 'Comece por uma área. Depois você escolhe as matérias, o prazo e como prefere montar o cronograma.'}</p><form onSubmit={onCreate}><label>Nome desta área<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: ENEM 2026, Concurso SEFAZ BA..." autoFocus required /></label><label>Tipo de preparação<select value={type} onChange={(event) => setType(event.target.value)}><option>Concurso</option><option>Vestibular</option><option>Faculdade</option><option>Curso</option><option>Outro</option></select></label><button className="primary-button" type="submit">Criar espaço <span>→</span></button></form><small className="blank-note">Você poderá criar, editar ou arquivar outras áreas depois.</small></div></section></div>
}

function Dashboard({ onStudy, onStudyTopic, onDiary, completed, stats, track, onSetExamDate }) {
  return <div className="page dashboard"><p className="eyebrow">A porta está aberta</p>
    <section className="hero-panel"><div className="thread one" /><div className="thread two" /><div className="hero-copy"><p className="hero-kicker">{track.type} · {track.label}</p><h1>Sua próxima<br /><em>missão.</em></h1><p>Este é seu espaço separado para {track.label}. Cada sessão é uma chave.</p><button className="primary-button" onClick={onStudy}>Começar a estudar <span>→</span></button></div><img className="door-opening-scene" src={doorOpeningScene} alt="Cena da porta secreta se abrindo" /></section>
    <section className="stats-grid"><article><span className="stat-icon">◷</span><div><small>Até a prova</small><strong>{daysUntil(track.examDate)} <i>{track.examDate ? 'dias' : 'defina a data'}</i></strong><input className="exam-date" aria-label="Data da prova" type="date" value={track.examDate || ''} onChange={(event) => onSetExamDate(event.target.value)} /></div></article><article><span className="stat-icon">◉</span><div><small>Questões respondidas</small><strong>{stats.answered}</strong></div><span className="badge muted">{stats.correct} acertos · {stats.wrong} erros</span></article><article><span className="stat-icon">⚿</span><div><small>Meta concluída</small><strong>{Math.round(completed / track.tasks.length * 100)}%</strong></div><div className="mini-progress"><span style={{ width: `${completed / track.tasks.length * 100}%` }} /></div></article></section>
    <section className="section-heading"><div><p className="eyebrow">Missões de hoje</p><h2>O que vamos desvendar?</h2></div><button className="text-button" onClick={onDiary}>Ver o diário →</button></section>
    <div className="mission-list">{track.tasks.map(([subject, topic, time], index) => <article className="mission" key={subject}><span className="mission-number">0{index + 1}</span><div><h3>{subject}</h3><p>{topic}</p></div><span className="mission-time">◷ {time}</span><button onClick={() => onStudyTopic(subject, topic)} aria-label={`Estudar ${subject}`}>→</button></article>)}</div>
  </div>
}

function Diary({ taskList, track, onUpdateSchedule, onBuildPlan }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayKey = localDateKey(today)
  const finish = track.examDate ? new Date(`${track.examDate}T12:00:00`) : new Date(today.getFullYear(), today.getMonth() + 11, 31)
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [newBlock, setNewBlock] = useState('')
  const weekdays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const firstOffset = (monthStart.getDay() + 6) % 7
  const calendarDays = Array.from({ length: firstOffset + monthEnd.getDate() }, (_, index) => index < firstOffset ? null : new Date(month.getFullYear(), month.getMonth(), index - firstOffset + 1))
  const canGoBack = monthStart > new Date(today.getFullYear(), today.getMonth(), 1)
  const canGoForward = new Date(month.getFullYear(), month.getMonth() + 1, 0) < finish
  const planFor = (dateKey) => track.schedule?.[dateKey] || (dateKey === todayKey ? taskList : [])
  const plan = planFor(selectedDate)
  const selected = new Date(`${selectedDate}T12:00:00`)
  const selectedLabel = selected.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  const savePlan = (dateKey, nextPlan) => onUpdateSchedule({ ...(track.schedule || {}), [dateKey]: nextPlan })
  const toggle = (index) => savePlan(selectedDate, plan.map((task, taskIndex) => taskIndex === index ? [...task.slice(0, 3), !task[3]] : task))
  const addBlock = (event) => { event.preventDefault(); const name = newBlock.trim(); if (!name) return; savePlan(selectedDate, [...plan, [name, 'Bloco planejado por você', '50 min', false]]); setNewBlock('') }
  const movePending = () => { const schedule = { ...(track.schedule || {}) }; const pending = []; Object.keys(schedule).filter((dateKey) => dateKey < todayKey).forEach((dateKey) => { const [late, complete] = schedule[dateKey].reduce((result, task) => task[3] ? [result[0], [...result[1], task]] : [[...result[0], task], result[1]], [[], []]); pending.push(...late); schedule[dateKey] = complete }); if (!pending.length) return; schedule[todayKey] = [...(schedule[todayKey] || taskList), ...pending.map((task) => [...task.slice(0, 3), false])]; onUpdateSchedule(schedule); setSelectedDate(todayKey) }
  const hasLate = Object.entries(track.schedule || {}).some(([dateKey, tasks]) => dateKey < todayKey && tasks.some((task) => !task[3]))
  const chooseDay = (date) => { const key = localDateKey(date); setSelectedDate(key) }
  return <div className="page simple-page diary-page"><img className="diary-secret-image" src={diarySecretScene} alt="Caderno secreto" /><p className="eyebrow">O Diário · {track.label}</p><h1>Plano de {selectedLabel}.</h1><p className="page-intro">Navegue mês a mês até a prova. Cada data guarda seus próprios blocos de estudo.</p><section className="diary-card">{track.examDate ? <button className="auto-plan-button" onClick={onBuildPlan}>✦ Organizar assuntos até {finish.toLocaleDateString('pt-BR')}</button> : <p className="plan-date-note">Defina a data da prova no painel para liberar o limite final do calendário.</p>}<div className="month-switch"><button disabled={!canGoBack} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><b>{month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b><button disabled={!canGoForward} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div><div className="month-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div><div className="month-grid">{calendarDays.map((date, index) => date ? <button key={localDateKey(date)} className={`${localDateKey(date) === selectedDate ? 'today ' : ''}${localDateKey(date) === todayKey ? 'is-now ' : ''}${date > finish ? 'out-of-range' : ''}`} disabled={date > finish} onClick={() => chooseDay(date)}><b>{date.getDate()}</b><small>{track.schedule?.[localDateKey(date)]?.length ? '•' : ''}</small></button> : <i key={`blank-${index}`} />)}</div>{hasLate && <button className="reschedule-button" onClick={movePending}>↻ Remanejar estudos atrasados para hoje</button>}{plan.length ? plan.map(([subject, topic, time, done], index) => <button className={`diary-task ${done ? 'done' : ''}`} onClick={() => toggle(index)} key={`${subject}-${index}`}><span className="check">{done ? '✓' : ''}</span><span><b>{subject}</b><small>{topic}</small></span><time>{time}</time></button>) : <p className="empty-day">Nada planejado para este dia ainda.</p>}<form className="plan-block-form" onSubmit={addBlock}><input value={newBlock} onChange={(event) => setNewBlock(event.target.value)} placeholder="Ex.: Revisar porcentagem" /><button type="submit">+ adicionar bloco</button></form></section></div>
}

const videoCatalog = {
  'Linguagens': ['Professor Noslen', 'interpretação de texto ENEM'],
  'Língua Portuguesa': ['Professor Noslen', 'português para concursos interpretação de texto'],
  'Matemática': ['Professor Ferretto', 'matemática ENEM exercícios'],
  'Raciocínio Lógico': ['Professor Caju', 'raciocínio lógico para concursos'],
  'Ciências Humanas': ['Débora Aladim', 'história geografia ENEM revisão'],
  'Ciências da Natureza': ['Professor Jubilut', 'biologia ENEM revisão'],
  'Redação': ['Poxa Luiza', 'redação ENEM repertório e proposta de intervenção'],
  'Direito Constitucional': ['Estratégia Concursos', 'direito constitucional para concursos princípios'],
  'Legislação Municipal': ['Estratégia Concursos', 'legislação para guarda municipal'],
  'Direito Tributário': ['Professor Ricardo Alexandre', 'direito tributário para concursos'],
  'Contabilidade': ['Professor Silvio Sande', 'contabilidade para concursos'],
  'Administração Pública': ['Estratégia Concursos', 'administração pública para concursos'],
}

function videoForSubject(subject) {
  const [channel, query] = videoCatalog[subject] || ['YouTube Educação', `${subject} aula completa`]
  return { channel, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` }
}

const topicCatalog = {
  'Língua Portuguesa': ['Compreensão e interpretação de textos', 'Tipologia e gêneros textuais', 'Coesão, coerência e intertextualidade', 'Ortografia e acentuação gráfica', 'Classes de palavras e formação de palavras', 'Sintaxe: termos, períodos e orações', 'Concordância verbal e nominal', 'Regência verbal e nominal', 'Crase e pontuação', 'Semântica, figuras de linguagem e reescrita', 'Redação oficial, quando prevista no edital'],
  'Linguagens': ['Leitura e interpretação de textos', 'Gêneros, funções e variação linguística', 'Literatura brasileira e movimentos literários', 'Artes, cultura e linguagem visual', 'Língua estrangeira: leitura em contexto', 'Tecnologias da informação e comunicação', 'Educação física, corpo e saúde'],
  'Matemática': ['Porcentagem, razão, proporção e regra de três', 'Funções e interpretação de gráficos', 'Álgebra, equações e sistemas', 'Geometria plana e espacial', 'Estatística, média, moda e mediana', 'Probabilidade e análise combinatória', 'Matemática financeira'],
  'Raciocínio Lógico': ['Proposições e conectivos lógicos', 'Tabelas-verdade e equivalências', 'Argumentação lógica', 'Conjuntos e diagramas', 'Porcentagem, razão e proporção', 'Sequências, padrões e problemas'],
  'Ciências Humanas': ['Brasil Colônia, Império e República', 'História geral e mundo contemporâneo', 'Geografia do Brasil e espaço mundial', 'Meio ambiente, território e globalização', 'Filosofia: ética, política e conhecimento', 'Sociologia: cultura, trabalho e cidadania'],
  'Ciências da Natureza': ['Ecologia e impactos ambientais', 'Citologia, genética e evolução', 'Fisiologia humana e saúde', 'Cinemática, dinâmica e energia', 'Eletricidade, ondas e óptica', 'Matéria, ligações e transformações químicas', 'Estequiometria, soluções e química ambiental'],
  'Redação': ['Leitura cuidadosa da proposta', 'Tese e projeto de texto', 'Repertório sociocultural pertinente', 'Construção dos argumentos', 'Coesão entre parágrafos', 'Proposta de intervenção e direitos humanos', 'Revisão por competências do Enem'],
  'Direito Constitucional': ['Princípios fundamentais', 'Direitos e garantias fundamentais', 'Organização do Estado', 'Administração pública', 'Poderes da República', 'Segurança pública'],
  'Legislação Municipal': ['Lei Orgânica do município', 'Estatuto dos servidores, se previsto', 'Normas locais indicadas no edital', 'Estatuto Geral das Guardas Municipais', 'Legislação de proteção e cidadania'],
  'Direito Tributário': ['Sistema tributário nacional', 'Espécies tributárias', 'Competência tributária', 'Obrigação e crédito tributário', 'Lançamento, suspensão e extinção', 'Responsabilidade tributária'],
  'Contabilidade': ['Patrimônio, ativos e passivos', 'Método das partidas dobradas', 'Lançamentos contábeis', 'Demonstrações contábeis', 'Custos e análise de balanços', 'Contabilidade aplicada ao setor público'],
  'Administração Pública': ['Princípios da administração pública', 'Modelos de administração', 'Planejamento e gestão por resultados', 'Licitações e contratos, se previstos', 'Ética, transparência e controle'],
  'Conhecimentos Específicos': ['Leia o conteúdo programático do edital', 'Separe leis, normas e manuais citados', 'Liste os tópicos por ordem do edital', 'Inclua assuntos do cargo e da banca', 'Marque o que já foi estudado'],
}

function topicsForSubject(name) {
  return topicCatalog[name] || ['Tópico 1: defina pelo seu edital', 'Tópico 2: material principal', 'Tópico 3: exercícios e revisão']
}

function Subjects({ track, newSubjectName, setNewSubjectName, onAddSubject, onToggleTopic, onStudyTopic }) {
  const [selectedSubject, setSelectedSubject] = useState('')
  const selectedTopics = topicsForSubject(selectedSubject)
  return <div className="page simple-page keys-page"><p className="eyebrow">A Sala das Chaves · {track.label}</p><h1>Matérias desta área.</h1><img className="key-hand-scene" src="/sala-das-chaves.png" alt="Mão segurando a chave da sala" /><div className="area-template"><span className="template-label">⚿ {track.templateLabel}</span></div><p className="page-intro">Clique em uma matéria para abrir os assuntos cadastrados para este plano. Para concursos, confira o edital específico: ele pode acrescentar ou retirar tópicos.</p><form className="add-subject" onSubmit={onAddSubject}><label htmlFor="new-subject">Adicionar uma matéria</label><input id="new-subject" value={newSubjectName} onChange={(event) => setNewSubjectName(event.target.value)} placeholder="Ex.: Informática" /><button type="submit">Adicionar</button></form><section className="subject-grid">{track.subjects.map(([name, topic, progress], index) => { const video = videoForSubject(name); return <article className="subject-card" key={`${name}-${index}`}><span className="key-icon">⚿</span><span className="subject-index">0{index + 1}</span><h2>{name}</h2><p>{topic}</p><div className="video-shelf"><span>VÍDEO PARA COMEÇAR</span><a href={video.url} target="_blank" rel="noreferrer">{video.channel}<b>ver no YouTube ↗</b></a></div><div className="subject-footer"><span>{progress}</span><button className="subject-link" onClick={() => setSelectedSubject(name)}>Ver assuntos →</button></div></article> })}</section>{selectedSubject && <section className="topics-panel"><div><p className="eyebrow">Conteúdo programático</p><h2>{selectedSubject}</h2><p>Clique no nome para abrir o estudo. Use o círculo para marcar o que já revisou.</p></div><button className="back-button" onClick={() => setSelectedSubject('')}>Fechar ×</button><div className="topic-list">{selectedTopics.map((topic, index) => { const checked = Boolean(track.topicChecks?.[selectedSubject]?.[topic]); return <div className={checked ? 'topic-row checked' : 'topic-row'} key={topic}><button className="topic-item topic-open" onClick={() => onStudyTopic(selectedSubject, topic)}><span>{`0${index + 1}`}</span>{topic}<b>Estudar →</b></button><button className="topic-check" onClick={() => onToggleTopic(selectedSubject, topic)} aria-label={checked ? `Desmarcar ${topic}` : `Marcar ${topic} como estudado`}>{checked ? '✓' : '○'}</button></div> })}</div></section>}<p className="video-note">As sugestões abrem uma busca específica no YouTube. Quando conectarmos a API oficial, o app poderá ordenar resultados atuais por canal, visualizações e avaliações públicas.</p></div>
}

function Timer({ seconds, running, onToggle, onReset, track, studySelection }) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0')
  const sec = String(seconds % 60).padStart(2, '0')
  const timeUp = seconds === 0
  const studyLabel = studySelection ? `${studySelection.subject} · ${studySelection.topic}` : 'escolha um conteúdo para começar'
  const state = timeUp ? 'alerta' : running ? 'andamento' : 'inicial'
  return <div className="page timer-page clock-editorial">
    <div className="clock-intro"><p className="eyebrow">Layverse · O Relógio</p><h1>Uma chave por vez.</h1><p className="page-intro">{studySelection ? `Você abriu: ${studySelection.topic}.` : 'Escolha uma matéria, defina sua intenção e mantenha o foco neste bloco.'}</p></div>
    <section className={`clock-studio ${timeUp ? 'time-up' : ''}`}>
      <aside className="focus-console"><p>SESSÃO DE FOCO</p><label>Área<select defaultValue={track.label}><option>{track.label}</option></select></label><label>Matéria<select defaultValue={studySelection?.subject || ''}><option value="">{studySelection?.subject || 'Escolha na Sala das Chaves'}</option>{track.subjects.map(([name]) => <option key={name}>{name}</option>)}</select></label><label>Intenção <textarea placeholder="Ex.: Resolver questões de porcentagem" defaultValue={studySelection?.topic || ''} /></label><small>{studyLabel}</small></aside>
      <section className="clock-stage" aria-label="Relógio Vigia"><div className={`clock-guardian-wrap ${timeUp ? 'awake' : ''}`}><img className="clock-guardian" src={clockGuardian} alt="Relógio Vigia em uma sala iluminada" /><button className="clock-eye left" onClick={onToggle} aria-label={running ? 'Pausar foco' : 'Começar foco'} title={running ? 'Pausar foco' : 'Começar foco'} /><button className="clock-eye right" onClick={onReset} aria-label="Recomeçar foco" title="Recomeçar foco" /></div><div className="timer-circle"><strong>{min}:{sec}</strong><small>{timeUp ? 'tempo encerrado' : running ? 'contagem em andamento' : 'pronto para começar'}</small></div><div className="clock-actions"><button className="primary-button" onClick={onToggle}>{running ? 'Ⅱ Pausar' : timeUp ? '▶ Novo bloco' : '▶ Começar'}</button><button className="secondary-button" onClick={onReset}>↻ Recomeçar</button></div></section>
      <aside className="clock-states"><p>O RELÓGIO VIGIA</p><div className={`state-card ${state === 'inicial' ? 'current' : ''}`}><img src={clockGuardian} alt="" /><div><b>Estado inicial</b><span>Olhos atentos, luz âmbar suave.</span></div></div><div className={`state-card ${state === 'andamento' ? 'current' : ''}`}><img src={clockGuardian} alt="" /><div><b>Contagem em andamento</b><span>O tempo corre dentro da barriga.</span></div></div><div className={`state-card ${timeUp ? 'current alert' : ''}`}><img src={clockGuardian} alt="" /><div><b>Tempo encerrado</b><span>Ele treme e avisa que é hora da pausa.</span></div></div><div className="clock-alert-guide"><b>Quando chegar em 00:00</b><span>A barata acende em vermelho, treme, inclina o corpo e os olhos piscam até você iniciar outro bloco.</span></div><p className="clock-tip">Olho esquerdo: iniciar ou pausar.<br />Olho direito: recomeçar.</p></aside>
    </section>
  </div>
}

function Questions({ track, onComplete }) { const [subject, setSubject] = useState(''); const [index, setIndex] = useState(0); const [answers, setAnswers] = useState({}); const [finished, setFinished] = useState(false); const [notice, setNotice] = useState(''); const blocks = track.subjects.map(([name, topic]) => ({ name, topic, questions: track.questions.filter((question) => question.subject === name) })).filter((block) => block.questions.length); const simulation = track.questions.filter((question) => question.subject === subject).slice(0, 10); const question = simulation[index]; const answered = Object.keys(answers).length; const score = simulation.filter((item, itemIndex) => answers[itemIndex] === item.answer).length; const openBlock = (name) => { setSubject(name); setIndex(0); setAnswers({}); setFinished(false); setNotice('') }; const choose = (answer) => setAnswers((current) => ({ ...current, [index]: answer })); const finish = () => { if (answered !== simulation.length) { setNotice(`Faltam ${simulation.length - answered} questões para responder.`); return } setFinished(true); onComplete(simulation, answers) }; if (subject === 'Redação') return <RedacaoWorkshop track={track} onBack={() => setSubject('')} />; if (!subject) return <div className="page simple-page"><p className="eyebrow">O Outro Mundo · {track.label}</p><h1>Simulados por assunto.</h1><p className="page-intro">Escolha uma matéria. Cada prova fica separada: você só vê o gabarito e as explicações depois de finalizar aquele bloco.</p><section className="simulation-grid">{blocks.map((block, blockIndex) => <article className="simulation-card" key={block.name}><span>0{blockIndex + 1} · {block.name === 'Redação' ? 'oficina de correção' : `${block.questions.length} questões`}</span><h2>{block.name}</h2><p>{block.topic}</p><button className="secondary-button" onClick={() => openBlock(block.name)}>{block.name === 'Redação' ? 'Abrir oficina →' : 'Abrir simulado →'}</button></article>)}</section><p className="simulation-catalog-note">Cada bloco terá séries separadas de 10 questões. Por enquanto, o contador mostra somente itens autorais já revisados; não vamos preencher simulados com repetição só para aumentar um número.</p></div>; if (finished) return <SimulationResult simulation={simulation} answers={answers} score={score} onRestart={() => { setAnswers({}); setIndex(0); setFinished(false); setNotice('') }} onBack={() => setSubject('')} />; return <div className="page simple-page"><button className="back-button" onClick={() => setSubject('')}>← Todos os assuntos</button><p className="eyebrow">{track.label} · {subject}</p><h1>Simulado de {subject}.</h1><p className="page-intro">Responda as {simulation.length} questões deste bloco. O gabarito e os comentários aparecem apenas ao finalizar.</p><section className="simulation-head"><span>QUESTÃO {index + 1} DE {simulation.length}</span><div>{simulation.map((item, itemIndex) => <button key={item.id} className={`${itemIndex === index ? 'active ' : ''}${answers[itemIndex] !== undefined ? 'answered' : ''}`} onClick={() => setIndex(itemIndex)}>{itemIndex + 1}</button>)}</div></section><section className="question-card"><span className="question-tag">{question.category}</span><h2>{question.prompt}</h2><div className="alternatives">{question.alternatives.map((alternative, answerIndex) => <button key={alternative} className={answers[index] === answerIndex ? 'selected' : ''} onClick={() => choose(answerIndex)}><b>{'ABCD'[answerIndex]}</b>{alternative}</button>)}</div><div className="simulation-actions"><button className="secondary-button" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}>← Anterior</button>{index < simulation.length - 1 ? <button className="primary-button" onClick={() => setIndex((current) => current + 1)}>Próxima →</button> : <button className="primary-button" onClick={finish}>Finalizar simulado</button>}</div>{notice && <p className="simulation-notice">{notice}</p>}</section></div> }

function RedacaoWorkshop({ track, onBack }) { const [theme, setTheme] = useState(''); const [essay, setEssay] = useState(''); const [loading, setLoading] = useState(false); const [feedback, setFeedback] = useState(''); const [error, setError] = useState(''); const correct = async () => { if (essay.trim().length < 80) { setError('Escreva um pouco mais antes de pedir a correção.'); return } setLoading(true); setError(''); setFeedback(''); try { const response = await fetch('/api/redacao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ track: track.label, theme, essay }) }); const raw = await response.text(); let data = {}; try { data = raw ? JSON.parse(raw) : {} } catch { throw new Error('A correção por IA ainda não está disponível neste endereço local. Ela será ativada quando o Layverse estiver publicado e configurado.') } if (!response.ok) throw new Error(data.error || 'Não foi possível corrigir agora.'); if (!data.feedback) throw new Error('A correção não retornou uma resposta. Tente novamente após configurar o serviço.'); setFeedback(data.feedback) } catch (requestError) { setError(requestError.message || 'A oficina precisa ser configurada para fazer a correção por IA.') } finally { setLoading(false) } }; return <div className="page simple-page"><button className="back-button" onClick={onBack}>← Todos os assuntos</button><p className="eyebrow">Oficina de redação · {track.label}</p><h1>Escreva. Depois, revise.</h1><p className="page-intro">A devolutiva usa as cinco competências da cartilha do Enem 2026 como guia de estudo. É uma estimativa pedagógica; não substitui a correção oficial.</p><section className="writing-workshop"><div className="competency-list"><span>CRITÉRIOS ENEM 2026</span><ol><li>Domínio da escrita formal.</li><li>Compreensão do tema e da estrutura.</li><li>Organização dos argumentos.</li><li>Coesão entre as ideias.</li><li>Proposta de intervenção e direitos humanos.</li></ol></div><label>Tema proposto <input value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Ex.: Desafios para ..." /></label><label>Sua redação <textarea value={essay} onChange={(event) => setEssay(event.target.value)} placeholder="Escreva seu texto aqui. A correção aponta forças, prioridades de revisão e uma estimativa por competência." rows="15" /></label><div className="writing-actions"><span>{essay.trim().split(/\s+/).filter(Boolean).length} palavras</span><button className="primary-button" onClick={correct} disabled={loading}>{loading ? 'Lendo sua redação…' : 'Pedir correção por IA →'}</button></div>{error && <p className="simulation-notice">{error}</p>}{feedback && <article className="essay-feedback"><span>DEVOLUTIVA PEDAGÓGICA</span><p>{feedback}</p></article>}</section></div> }

function SimulationResult({ simulation, answers, score, onRestart, onBack }) { return <div className="page simple-page"><button className="back-button" onClick={onBack}>← Todos os assuntos</button><p className="eyebrow">Simulado concluído</p><h1>{score} de {simulation.length} acertos.</h1><p className="page-intro">Agora você pode ver o gabarito e o comentário de cada questão. Os resultados também foram enviados para o painel desta área.</p><section className="result-summary"><span>APROVEITAMENTO</span><strong>{Math.round(score / simulation.length * 100)}%</strong><button className="secondary-button" onClick={onRestart}>Refazer simulado</button></section><div className="result-list">{simulation.map((question, index) => <article className={answers[index] === question.answer ? 'result-item correct' : 'result-item wrong'} key={question.id}><p><b>Questão {index + 1} · {question.subject}</b><span>{answers[index] === question.answer ? 'Acertou' : 'Errou'}</span></p><h2>{question.prompt}</h2><p className="result-answer"><b>Resposta correta: {question.alternatives[question.answer]}</b></p><p>{question.explanation}</p><small>{question.sourceUrl ? <a href={question.sourceUrl} target="_blank" rel="noreferrer">{question.sourceLabel} ↗</a> : question.sourceLabel}</small></article>)}</div></div> }

function Progress({ completed, track }) { return <div className="page simple-page"><p className="eyebrow">O Gato · {track.label}</p><h1>Seu caminho até aqui.</h1><p className="page-intro">Os dados deste caminho ficam separados dos seus outros objetivos neste navegador.</p><section className="cat-scene"><img src={catPinkPalaceScene} alt="Gato preto caminhando sobre a placa Pink Palace" /><div><p className="eyebrow">UM PASSO DE CADA VEZ</p><h2>Ele passa pela placa e desaparece.</h2><p>O mesmo cuidado vale para seu plano: uma tarefa concluída, depois a próxima.</p></div></section><section className="progress-layout"><article className="big-progress"><span className="cat-symbol">⌁</span><strong>{Math.round(completed / track.tasks.length * 100)}%</strong><p>das missões de hoje</p></article><article className="performance"><h2>Assuntos para revisar</h2><div><span>{track.subjects[0]?.[0]}</span><b>praticar no simulado</b></div><div><span>{track.subjects[1]?.[0]}</span><b>praticar no simulado</b></div><div><span>{track.subjects[2]?.[0]}</span><b>praticar no simulado</b></div></article></section></div> }

export default App
