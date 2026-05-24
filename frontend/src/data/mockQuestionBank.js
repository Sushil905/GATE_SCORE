const topicHints = {
  Algorithms: ['complexity analysis', 'dynamic programming', 'graph traversal', 'greedy choice'],
  'Operating Systems': ['process scheduling', 'memory management', 'deadlocks', 'paging'],
  DBMS: ['normalization', 'transactions', 'SQL queries', 'indexing'],
  'Computer Networks': ['TCP', 'routing', 'IP addressing', 'flow control'],
  'Engineering Mathematics': ['linear algebra', 'probability', 'calculus', 'discrete math'],
  'Machine Learning': ['model evaluation', 'classification', 'gradient descent', 'regularization'],
  AI: ['search', 'reasoning', 'planning', 'heuristics'],
  'Signals & Systems': ['convolution', 'Fourier transform', 'LTI systems', 'sampling'],
  'Control Systems': ['stability', 'root locus', 'feedback', 'transfer function'],
  Thermodynamics: ['cycles', 'entropy', 'first law', 'properties'],
  'Fluid Mechanics': ['Bernoulli equation', 'viscosity', 'flow regimes', 'continuity'],
  'Structural Engineering': ['bending moment', 'trusses', 'deflection', 'loads'],
  'Power Systems': ['load flow', 'faults', 'transmission', 'protection']
};

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)] || items[0];
}

function shuffle(items, random) {
  return [...items].sort(() => random() - 0.5);
}

function topicsFor(subject) {
  return topicHints[subject] || [
    `${subject} fundamentals`,
    `${subject} numericals`,
    `${subject} PYQ concepts`,
    `${subject} revision`
  ];
}

export function generateMockQuestions(branch, subject, seed = Date.now()) {
  const random = seededRandom(Math.floor(seed % 1000000000));
  const topics = topicsFor(subject);
  const natAnswer = 2 + Math.floor(random() * 7);
  const base = [
    {
      question_type: 'mcq',
      marks: 1,
      negative_marks: 0.33,
      difficulty: 'easy',
      topic: pick(topics, random),
      question_text: `For GATE ${branch}, which approach is best before attempting ${subject} PYQs?`,
      options: [
        ['Revise core definitions and formulas first', true],
        ['Skip theory and solve only random questions', false],
        ['Ignore mistakes after every mock', false],
        ['Attempt without checking the syllabus', false]
      ],
      explanation: `In ${subject}, PYQ practice works best after quick concept and formula revision.`
    },
    {
      question_type: 'mcq',
      marks: 2,
      negative_marks: 0.66,
      difficulty: 'medium',
      topic: pick(topics, random),
      question_text: `A student is weak in ${subject}. What should be the most useful next step?`,
      options: [
        ['Only watch long playlists without practice', false],
        ['Revise one topic, solve PYQs, and analyze wrong answers', true],
        ['Change branch preparation every day', false],
        ['Avoid mock tests until the final week', false]
      ],
      explanation: `Focused revision plus PYQ analysis improves accuracy in ${subject}.`
    },
    {
      question_type: 'msq',
      marks: 2,
      negative_marks: 0,
      difficulty: 'medium',
      topic: pick(topics, random),
      question_text: `Select all good strategies for improving ${subject} score.`,
      options: [
        ['Maintain short revision notes', true],
        ['Bookmark difficult questions', true],
        ['Never review wrong attempts', false],
        ['Practice topic-wise and mixed questions', true]
      ],
      explanation: `Revision notes, bookmarks, and mixed practice create better retention.`
    },
    {
      question_type: 'nat',
      marks: 2,
      negative_marks: 0,
      difficulty: 'easy',
      topic: pick(topics, random),
      question_text: `A ${subject} quiz has ${natAnswer + 3} questions. If ${natAnswer} are correct and 3 are wrong, enter the number of correct answers.`,
      correct_answer: String(natAnswer),
      explanation: `The question directly asks for correct answers, so the numerical answer is ${natAnswer}.`
    },
    {
      question_type: 'mcq',
      marks: 1,
      negative_marks: 0.33,
      difficulty: 'hard',
      topic: pick(topics, random),
      question_text: `In a real GATE mock, what does repeated error in ${pick(topics, random)} indicate?`,
      options: [
        ['A weak concept area that needs targeted revision', true],
        ['The test should be ignored', false],
        ['The subject should be skipped completely', false],
        ['The timer is the only problem', false]
      ],
      explanation: `Repeated mistakes usually point to a specific weak concept, not the whole subject.`
    },
    {
      question_type: 'msq',
      marks: 2,
      negative_marks: 0,
      difficulty: 'medium',
      topic: pick(topics, random),
      question_text: `Which features make a ${subject} mock test closer to real GATE?`,
      options: [
        ['Question palette', true],
        ['Timer', true],
        ['Negative marking for MCQ', true],
        ['Unlimited hints during test', false]
      ],
      explanation: `Timer, palette, and correct marking rules make the test closer to GATE.`
    }
  ];

  return shuffle(base, random).map((question, index) => {
    if (question.question_type === 'nat') {
      return {
        ...question,
        id: `${seed}-${index + 1}`,
        subject,
        branch,
        option_a: null,
        option_b: null,
        option_c: null,
        option_d: null
      };
    }

    const optionLetters = ['A', 'B', 'C', 'D'];
    const shuffledOptions = shuffle(question.options, random);
    const correctLetters = shuffledOptions
      .map(([text, correct], optionIndex) => (correct ? optionLetters[optionIndex] : null))
      .filter(Boolean)
      .join(',');

    return {
      ...question,
      id: `${seed}-${index + 1}`,
      subject,
      branch,
      option_a: shuffledOptions[0][0],
      option_b: shuffledOptions[1][0],
      option_c: shuffledOptions[2][0],
      option_d: shuffledOptions[3][0],
      correct_answer: correctLetters
    };
  });
}
