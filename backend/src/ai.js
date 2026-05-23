import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

export async function runAi(prompt, mode = 'doubt') {
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise, exam-focused GATE preparation mentor.' },
        { role: 'user', content: prompt }
      ]
    });
    return response.choices[0]?.message?.content || fallback(prompt, mode);
  }

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    return response.response.text();
  }

  return fallback(prompt, mode);
}
