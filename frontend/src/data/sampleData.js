export const sampleResources = [
  { id: 1, subject: 'Engineering Mathematics', title: 'Linear Algebra Quick Notes', type: 'notes', difficulty: 'beginner', url: 'https://nptel.ac.in/courses' },
  { id: 2, subject: 'Algorithms', title: 'Dynamic Programming Practice Set', type: 'article', difficulty: 'intermediate', url: 'https://www.geeksforgeeks.org/dynamic-programming/' },
  { id: 3, subject: 'Computer Networks', title: 'TCP/IP Video Lectures', type: 'video', difficulty: 'beginner', url: 'https://nptel.ac.in/courses' },
  { id: 4, subject: 'Operating Systems', title: 'Process Scheduling Notes', type: 'pdf', difficulty: 'intermediate', url: 'https://gateoverflow.in/' }
];

export const sampleTest = {
  id: 1,
  title: 'GATE CS Mini Mock 1',
  duration_minutes: 30,
  questions: [
    {
      id: 1,
      subject: 'Algorithms',
      topic: 'Complexity',
      question_text: 'What is the time complexity of binary search on a sorted array of n elements?',
      option_a: 'O(n)',
      option_b: 'O(log n)',
      option_c: 'O(n log n)',
      option_d: 'O(1)'
    },
    {
      id: 2,
      subject: 'Operating Systems',
      topic: 'Scheduling',
      question_text: 'Which scheduling algorithm may cause starvation?',
      option_a: 'Round Robin',
      option_b: 'FCFS',
      option_c: 'Priority Scheduling',
      option_d: 'SJF with aging'
    }
  ]
};
