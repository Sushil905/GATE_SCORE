import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

const SYSTEM_PROMPT = [
  'You are GATE_SCORE, a concise GenAI mentor for Indian GATE preparation.',
  'Give exam-focused answers with formulas, traps, and practice advice.',
  'Prefer clear headings, numbered steps, and short examples.',
  'If a question is ambiguous, state the assumption and continue.'
].join(' ');

function fallback(prompt, mode) {
  const text = prompt.slice(0, 500);
  const templates = {
    doubt: `Here is a clear GATE-style explanation:\n\n1. Identify the concept being tested.\n2. Write the formula or rule.\n3. Apply it step by step to the given data.\n\nFor your doubt: "${text}"\n\nFocus on definitions, edge cases, and one solved example before moving to similar questions.`,
    planner: `Study plan generated without an AI key:\n\nWeek 1-2: Revise core theory and formula sheets.\nWeek 3-5: Solve topic-wise GATE questions daily.\nWeek 6-8: Attempt two mocks per week and analyze mistakes.\nFinal stretch: Revise weak subjects, short notes, and previous year questions.\n\nDaily rhythm: 2 hours concept revision, 2 hours practice, 30 minutes error-log review.`,
    questions: `Generated practice set:\n\n1. MCQ: Which data structure is best for BFS?\nA. Stack B. Queue C. Heap D. Tree\nAnswer: B\n\n2. NAT: If a binary tree has 7 internal nodes and is full, how many leaves does it have?\nAnswer: 8\n\n3. MCQ: Which protocol provides reliable transport?\nA. UDP B. IP C. TCP D. ARP\nAnswer: C`,
    explanation: `Answer explanation:\n\nThe correct option follows directly from the governing definition. Compare your selected option against the condition in the question, then eliminate options that violate it. Add this question to your error log and revise the topic once more today.`,
    recommendation: `Recommended free resources:\n\n- NPTEL lectures for concept depth.\n- GATE Overflow for previous year discussion.\n- Topic-wise notes for quick revision.\n- Weekly mock analysis for weak-subject correction.`
  };

  return templates[mode] || templates.doubt;
}

function buildPrompt(prompt, mode) {
  const taskGuides = {
    doubt: 'Solve the doubt step by step. Include the key concept, GATE shortcut or trap, and one mini example.',
    planner: 'Create a practical weekly and daily plan. Include revision, PYQ practice, mocks, and weak-area review.',
    questions: 'Generate original GATE-style questions. Mix MCQ/MSQ/NAT where useful. Include answers and brief explanations.',
    explanation: 'Explain why the answer is correct, why common wrong choices fail, and what to revise next.',
    recommendation: 'Recommend free or widely available resources and tell how to use each resource efficiently.'
  };

  return `${SYSTEM_PROMPT}\n\nTask: ${taskGuides[mode] || taskGuides.doubt}\n\nUser request:\n${prompt}`;
}

async function runLangChain(prompt, mode) {
  const taskGuides = {
    doubt: 'Solve the doubt step by step. Include the key concept, GATE shortcut or trap, and one mini example.',
    planner: 'Create a practical weekly and daily plan. Include revision, PYQ practice, mocks, and weak-area review.',
    questions: 'Generate original GATE-style questions. Mix MCQ/MSQ/NAT where useful. Include answers and brief explanations.',
    explanation: 'Explain weaknesses, wrong-answer causes, recommended resources, and the next adaptive mock difficulty.',
    recommendation: 'Recommend free or widely available resources and tell how to use each resource efficiently.'
  };

  const provider = process.env.AI_PROVIDER || 'auto';
  let model = null;

  if ((provider === 'openai' || provider === 'auto') && process.env.OPENAI_API_KEY) {
    model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.35
    });
  } else if ((provider === 'gemini' || provider === 'auto') && process.env.GEMINI_API_KEY) {
    model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      temperature: 0.35
    });
  }

  if (!model) return null;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ['human', 'Task: {task}\n\nUser request:\n{request}']
  ]);
  const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());
  return chain.invoke({
    task: taskGuides[mode] || taskGuides.doubt,
    request: prompt
  });
}

export async function runAi(prompt, mode = 'doubt') {
  const finalPrompt = buildPrompt(prompt, mode);

  try {
    if (process.env.USE_LANGCHAIN !== 'false') {
      const langChainAnswer = await runLangChain(prompt, mode);
      if (langChainAnswer) return langChainAnswer;
    }

    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.35,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: finalPrompt }
        ]
      });
      return response.choices[0]?.message?.content || fallback(prompt, mode);
    }

    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: { temperature: 0.35 }
      });
      const response = await model.generateContent(finalPrompt);
      return response.response.text() || fallback(prompt, mode);
    }
  } catch (error) {
    console.error('AI provider failed, using local fallback:', error.message);
  }

  return fallback(prompt, mode);
}
