export const branchResourceMap = {
  'Computer Science Engineering': ['DSA Notes', 'DBMS Handwritten Notes', 'OS Cheat Sheets', 'CN Revision PDFs', 'Compiler Design Mind Maps', 'PYQ Solutions', 'Coding Practice Platform', 'AI Doubt Solver', 'Aptitude MCQs', 'Interview Questions'],
  'Electronics & Communication Engineering': ['Digital Electronics Notes', 'Signal & Systems Video Lectures', 'Communication Systems PDFs', 'VLSI Notes', 'Formula Sheets', 'Numerical Practice Tests', 'Circuit Simulators', 'PYQ Solutions'],
  'Electrical Engineering': ['Power System Notes', 'Electrical Machines PDFs', 'Control System MCQs', 'Power Electronics Videos', 'Formula Revision Sheets', 'Numerical Solving Practice', 'AI Concept Explainer'],
  'Mechanical Engineering': ['Thermodynamics Notes', 'SOM Practice Problems', 'Manufacturing Videos', 'CAD/CAM Tutorials', 'Formula Charts', 'PYQ Discussions', 'Numerical Solvers'],
  'Civil Engineering': ['Structural Analysis Notes', 'Geotechnical Engineering PDFs', 'Surveying Videos', 'RCC Design Examples', 'Environmental Engineering Notes', 'GATE Mock Tests'],
  'Instrumentation Engineering': ['Sensors & Transducers Notes', 'Process Control Videos', 'Control Systems MCQs', 'Analog Electronics Revision', 'Numerical Practice Sets'],
  'Chemical Engineering': ['Heat Transfer Notes', 'Mass Transfer Videos', 'Process Calculations PDFs', 'Plant Design Resources', 'Thermodynamics MCQs'],
  'Aerospace Engineering': ['Aerodynamics Notes', 'Aircraft Structure PDFs', 'Flight Mechanics Videos', 'Space Dynamics MCQs', 'Formula Sheets'],
  Biotechnology: ['Genetics Notes', 'Immunology PDFs', 'Cell Biology Videos', 'Bioprocess Engineering MCQs', 'Bioinformatics Tutorials'],
  'Engineering Sciences': ['Fluid Mechanics Notes', 'Material Science PDFs', 'Thermodynamics Videos', 'Engineering Mathematics Resources'],
  'Humanities & Social Sciences': ['English Grammar PDFs', 'Communication Skills Videos', 'Psychology Notes', 'Logical Reasoning MCQs'],
  'Data Science & Artificial Intelligence': ['Machine Learning Notes', 'Deep Learning Tutorials', 'Python Coding Practice', 'AI Interview Questions', 'Data Analytics Projects', 'SQL Practice'],
  Mathematics: ['Calculus Notes', 'Linear Algebra PDFs', 'Probability MCQs', 'Numerical Methods Videos'],
  Physics: ['Quantum Mechanics Notes', 'Electromagnetism PDFs', 'Thermodynamics Videos', 'Mathematical Physics Practice'],
  Statistics: ['Probability Theory Notes', 'Regression Analysis PDFs', 'Statistical Inference Videos', 'Time Series MCQs'],
  'Architecture & Planning': ['Urban Planning Notes', 'Building Materials PDFs', 'Design Aptitude Practice', 'Architecture Drawings'],
  'Ecology & Evolution': ['Ecology Notes', 'Biodiversity PDFs', 'Environmental Science Videos', 'Evolution MCQs'],
  'Geomatics Engineering': ['GIS Tutorials', 'Remote Sensing PDFs', 'GPS Practice Notes', 'Surveying MCQs'],
  'Mining Engineering': ['Rock Mechanics Notes', 'Mine Ventilation PDFs', 'Mineral Processing Videos', 'Mining Safety MCQs'],
  'Metallurgical Engineering': ['Material Science Notes', 'Corrosion Engineering PDFs', 'Thermodynamics Videos', 'Heat Treatment Practice'],
  'Naval Architecture & Marine Engineering': ['Ship Design Notes', 'Marine Engineering PDFs', 'Ocean Engineering Videos', 'Hydrodynamics MCQs'],
  'Petroleum Engineering': ['Reservoir Engineering Notes', 'Drilling Engineering PDFs', 'Production Engineering Videos', 'Well Testing MCQs'],
  'Textile Engineering & Fibre Science': ['Textile Fibres Notes', 'Garment Technology PDFs', 'Textile Chemistry Videos', 'Polymer Science MCQs'],
  'Production & Industrial Engineering': ['Operations Research Notes', 'Supply Chain PDFs', 'Quality Control Videos', 'Production Planning MCQs'],
  'Life Sciences': ['Molecular Biology Notes', 'Botany PDFs', 'Microbiology Videos', 'Biotechnology MCQs'],
  'Environmental Science & Engineering': ['Water Treatment Notes', 'Air Pollution PDFs', 'Climate Change Videos', 'Waste Management MCQs'],
  'Agricultural Engineering': ['Irrigation Engineering Notes', 'Farm Machinery PDFs', 'Soil Science Videos', 'Crop Production MCQs'],
  'Biomedical Engineering': ['Medical Imaging Notes', 'Biomedical Instruments PDFs', 'Biomaterials Videos', 'Healthcare Technology MCQs'],
  Psychology: ['Cognitive Psychology Notes', 'Clinical Psychology PDFs', 'Counseling Videos', 'Learning & Memory MCQs']
};

export function resourceTypeFromTitle(title) {
  const lower = title.toLowerCase();
  if (lower.includes('video') || lower.includes('tutorial')) return 'video';
  if (lower.includes('mcq') || lower.includes('practice') || lower.includes('test')) return 'practice';
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('platform') || lower.includes('solver') || lower.includes('simulator')) return 'tool';
  return 'notes';
}

export function resourceSearchUrl(branch, title) {
  return `https://www.google.com/search?q=${encodeURIComponent(`GATE ${branch} ${title}`)}`;
}
