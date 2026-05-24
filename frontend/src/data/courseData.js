const nptel = 'https://nptel.ac.in/courses';
const swayam = 'https://swayam.gov.in/';
const mit = 'https://ocw.mit.edu/search/';
const spokenTutorial = 'https://spoken-tutorial.org/';

function platformSearch(baseUrl, query) {
  if (baseUrl === mit) return `${baseUrl}?q=${encodeURIComponent(query)}`;
  return `${baseUrl}?searchText=${encodeURIComponent(query)}`;
}

export const branchCourseMap = {
  'Computer Science Engineering': [
    ['Data Structures and Algorithms', 'NPTEL', platformSearch(nptel, 'Data Structures Algorithms')],
    ['Database Management Systems', 'NPTEL', platformSearch(nptel, 'Database Management Systems')],
    ['Operating Systems', 'MIT OCW', platformSearch(mit, 'Operating Systems')],
    ['Python and C Programming', 'IIT Bombay Spoken Tutorial', spokenTutorial]
  ],
  'Electronics & Communication Engineering': [
    ['Signals and Systems', 'NPTEL', platformSearch(nptel, 'Signals and Systems')],
    ['Analog and Digital Circuits', 'MIT OCW', platformSearch(mit, 'Circuits Electronics')],
    ['Communication Systems', 'NPTEL', platformSearch(nptel, 'Communication Systems')],
    ['VLSI Design', 'SWAYAM', platformSearch(swayam, 'VLSI Design')]
  ],
  'Electrical Engineering': [
    ['Power Systems', 'NPTEL', platformSearch(nptel, 'Power Systems')],
    ['Electrical Machines', 'NPTEL', platformSearch(nptel, 'Electrical Machines')],
    ['Control Systems', 'MIT OCW', platformSearch(mit, 'Control Systems')],
    ['Power Electronics', 'SWAYAM', platformSearch(swayam, 'Power Electronics')]
  ],
  'Mechanical Engineering': [
    ['Thermodynamics', 'MIT OCW', platformSearch(mit, 'Thermodynamics')],
    ['Fluid Mechanics', 'NPTEL', platformSearch(nptel, 'Fluid Mechanics')],
    ['Manufacturing Engineering', 'NPTEL', platformSearch(nptel, 'Manufacturing Engineering')],
    ['Machine Design', 'SWAYAM', platformSearch(swayam, 'Machine Design')]
  ],
  'Civil Engineering': [
    ['Structural Analysis', 'NPTEL', platformSearch(nptel, 'Structural Analysis')],
    ['Geotechnical Engineering', 'NPTEL', platformSearch(nptel, 'Geotechnical Engineering')],
    ['Environmental Engineering', 'MIT OCW', platformSearch(mit, 'Environmental Engineering')],
    ['Surveying and Geomatics', 'SWAYAM', platformSearch(swayam, 'Surveying')]
  ],
  'Instrumentation Engineering': [
    ['Sensors and Transducers', 'NPTEL', platformSearch(nptel, 'Sensors Transducers')],
    ['Process Control', 'NPTEL', platformSearch(nptel, 'Process Control')],
    ['Control Systems', 'MIT OCW', platformSearch(mit, 'Control Systems')],
    ['Analog Electronics', 'SWAYAM', platformSearch(swayam, 'Analog Electronics')]
  ],
  'Chemical Engineering': [
    ['Heat Transfer', 'NPTEL', platformSearch(nptel, 'Heat Transfer Chemical Engineering')],
    ['Mass Transfer', 'NPTEL', platformSearch(nptel, 'Mass Transfer')],
    ['Chemical Reaction Engineering', 'NPTEL', platformSearch(nptel, 'Chemical Reaction Engineering')],
    ['Thermodynamics', 'MIT OCW', platformSearch(mit, 'Chemical Engineering Thermodynamics')]
  ],
  'Aerospace Engineering': [
    ['Aerodynamics', 'MIT OCW', platformSearch(mit, 'Aerodynamics')],
    ['Flight Mechanics', 'NPTEL', platformSearch(nptel, 'Flight Mechanics')],
    ['Aircraft Structures', 'NPTEL', platformSearch(nptel, 'Aircraft Structures')],
    ['Propulsion', 'MIT OCW', platformSearch(mit, 'Propulsion')]
  ],
  Biotechnology: [
    ['Biochemistry', 'NPTEL', platformSearch(nptel, 'Biochemistry')],
    ['Genetics', 'MIT OCW', platformSearch(mit, 'Genetics')],
    ['Bioinformatics', 'NPTEL', platformSearch(nptel, 'Bioinformatics')],
    ['Bioprocess Engineering', 'SWAYAM', platformSearch(swayam, 'Bioprocess Engineering')]
  ],
  'Engineering Sciences': [
    ['Engineering Mathematics', 'NPTEL', platformSearch(nptel, 'Engineering Mathematics')],
    ['Fluid Mechanics', 'MIT OCW', platformSearch(mit, 'Fluid Mechanics')],
    ['Materials Science', 'MIT OCW', platformSearch(mit, 'Materials Science')],
    ['Thermodynamics', 'NPTEL', platformSearch(nptel, 'Thermodynamics')]
  ],
  'Humanities & Social Sciences': [
    ['English Communication', 'SWAYAM', platformSearch(swayam, 'English Communication')],
    ['Psychology', 'MIT OCW', platformSearch(mit, 'Psychology')],
    ['Economics', 'MIT OCW', platformSearch(mit, 'Economics')],
    ['Reasoning and Aptitude', 'SWAYAM', platformSearch(swayam, 'Reasoning')]
  ],
  'Data Science & Artificial Intelligence': [
    ['Machine Learning', 'NPTEL', platformSearch(nptel, 'Machine Learning')],
    ['Deep Learning', 'MIT OCW', platformSearch(mit, 'Deep Learning')],
    ['Python Programming', 'IIT Bombay Spoken Tutorial', spokenTutorial],
    ['Data Analytics', 'SWAYAM', platformSearch(swayam, 'Data Analytics')]
  ],
  Mathematics: [
    ['Linear Algebra', 'MIT OCW', platformSearch(mit, 'Linear Algebra')],
    ['Calculus', 'MIT OCW', platformSearch(mit, 'Calculus')],
    ['Probability and Statistics', 'NPTEL', platformSearch(nptel, 'Probability Statistics')],
    ['Differential Equations', 'MIT OCW', platformSearch(mit, 'Differential Equations')]
  ],
  Physics: [
    ['Classical Mechanics', 'MIT OCW', platformSearch(mit, 'Classical Mechanics')],
    ['Quantum Mechanics', 'MIT OCW', platformSearch(mit, 'Quantum Mechanics')],
    ['Electromagnetism', 'MIT OCW', platformSearch(mit, 'Electromagnetism')],
    ['Thermodynamics', 'NPTEL', platformSearch(nptel, 'Physics Thermodynamics')]
  ],
  Statistics: [
    ['Probability Theory', 'MIT OCW', platformSearch(mit, 'Probability')],
    ['Statistical Inference', 'NPTEL', platformSearch(nptel, 'Statistical Inference')],
    ['Regression Analysis', 'MIT OCW', platformSearch(mit, 'Regression Analysis')],
    ['Time Series', 'SWAYAM', platformSearch(swayam, 'Time Series')]
  ]
};

export function getBranchCourses(branchName) {
  const fallback = [
    ['Core Concepts Course', 'NPTEL', platformSearch(nptel, branchName)],
    ['Open Engineering Lectures', 'MIT OCW', platformSearch(mit, branchName)],
    ['SWAYAM Free Courses', 'SWAYAM', platformSearch(swayam, branchName)],
    ['Software/Tool Training', 'IIT Bombay Spoken Tutorial', spokenTutorial]
  ];

  return (branchCourseMap[branchName] || fallback).map(([title, platform, url], index) => ({
    id: `${branchName}-${index}`,
    title,
    platform,
    url,
    level: index === 0 ? 'foundation' : index === 1 ? 'intermediate' : 'advanced',
    lesson_count: platform === 'IIT Bombay Spoken Tutorial' ? 8 : 12,
    progress_percent: 0
  }));
}
