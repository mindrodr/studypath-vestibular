// ============================================================
// StudyPath — Prova de Conceito: Serviços de IA
// Arquivo: src/study-service/ai/ai.service.ts
// Requer: npm install openai
// ============================================================

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── 1. Recomendação de Estudo ─────────────────────────────────

interface StudentProfile {
  name: string;
  target_exam: string;
  days_to_exam: number;
  available_hours_per_week: number;
  performance: { subject: string; accuracy: number }[];
}

interface StudyRecommendation {
  priority_subjects: string[];
  weekly_plan: { day: string; subject: string; hours: number; focus: string }[];
  tips: string[];
}

export async function generateStudyRecommendation(
  profile: StudentProfile
): Promise<StudyRecommendation> {
  const performanceText = profile.performance
    .map(p => `- ${p.subject}: ${Math.round(p.accuracy * 100)}% de acerto`)
    .join('\n');

  const prompt = `
Você é um tutor especializado em vestibulares brasileiros.
Analise o perfil do aluno e crie um plano de estudo para 7 dias.

PERFIL DO ALUNO:
- Nome: ${profile.name}
- Prova alvo: ${profile.target_exam}
- Dias até a prova: ${profile.days_to_exam}
- Horas disponíveis por semana: ${profile.available_hours_per_week}h

DESEMPENHO POR MATÉRIA:
${performanceText}

Retorne APENAS um JSON com a estrutura:
{
  "priority_subjects": ["Materia1", "Materia2"],
  "weekly_plan": [
    { "day": "Segunda", "subject": "Matematica", "hours": 2, "focus": "Funções" }
  ],
  "tips": ["Dica 1", "Dica 2"]
}`.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 800,
  });

  return JSON.parse(response.choices[0].message.content!);
}


// ── 2. Explicação de Questão Errada ──────────────────────────

interface Question {
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
}

export async function explainQuestion(
  question: Question,
  chosenAnswer: string
): Promise<{ explanation: string }> {
  const prompt = `
Você é um professor especialista em vestibulares brasileiros.
Explique de forma didática e clara por que a alternativa correta está certa
e por que a alternativa escolhida pelo aluno está errada.

QUESTÃO: ${question.statement}
ALTERNATIVAS:
A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

RESPOSTA DO ALUNO: ${chosenAnswer.toUpperCase()}
GABARITO CORRETO: ${question.answer.toUpperCase()}

Estruture sua resposta com:
1. Por que a alternativa correta (${question.answer.toUpperCase()}) está certa
2. Por que a alternativa ${chosenAnswer.toUpperCase()} está errada
3. Dica para não errar esse tipo de questão novamente`.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.2,
  });

  return { explanation: response.choices[0].message.content! };
}


// ── 3. Geração de Flashcards ──────────────────────────────────

interface GeneratedFlashcard {
  front: string;
  back: string;
  tags: string[];
}

export async function generateFlashcards(
  subject: string,
  topic: string,
  count = 5
): Promise<GeneratedFlashcard[]> {
  const prompt = `
Crie ${count} flashcards de estudo sobre o tópico "${topic}" de ${subject}
para alunos do vestibular brasileiro.

Retorne APENAS um JSON com a estrutura:
{
  "flashcards": [
    {
      "front": "Pergunta clara e objetiva",
      "back": "Resposta concisa mas completa",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Os cards devem:
- Ter perguntas diretas e objetivas
- Ter respostas completas mas sucintas (máximo 2 linhas)
- Cobrir conceitos fundamentais do tópico para o vestibular`.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 1000,
  });

  const { flashcards } = JSON.parse(response.choices[0].message.content!);
  return flashcards;
}


// ── DEMO ─────────────────────────────────────────────────────

async function demo() {
  console.log('=== PoC: Recomendação de Estudo ===');
  const recommendation = await generateStudyRecommendation({
    name: 'Lucas Mendes',
    target_exam: 'ENEM',
    days_to_exam: 127,
    available_hours_per_week: 10,
    performance: [
      { subject: 'Matemática', accuracy: 0.80 },
      { subject: 'Biologia',   accuracy: 0.70 },
      { subject: 'Português',  accuracy: 0.65 },
      { subject: 'Física',     accuracy: 0.58 },
      { subject: 'História',   accuracy: 0.50 },
    ],
  });
  console.log(JSON.stringify(recommendation, null, 2));

  console.log('\n=== PoC: Geração de Flashcards ===');
  const cards = await generateFlashcards('Biologia', 'Fotossíntese', 3);
  console.log(JSON.stringify(cards, null, 2));
}

// Descomentar para testar:
// demo().catch(console.error);
