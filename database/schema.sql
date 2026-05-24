CREATE DATABASE IF NOT EXISTS gate_score
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE gate_score;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS ai_study_plans;
DROP TABLE IF EXISTS ai_chat_history;
DROP TABLE IF EXISTS student_answers;
DROP TABLE IF EXISTS test_attempts;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS activity_events;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS doubt_threads;
DROP TABLE IF EXISTS study_tasks;
DROP TABLE IF EXISTS study_plans;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS test_questions;
DROP TABLE IF EXISTS lesson_progress;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_name VARCHAR(120) NOT NULL,
  branch_code VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  role ENUM('student', 'mentor', 'admin') DEFAULT 'student',
  branch VARCHAR(120) DEFAULT 'Computer Science',
  target_year INT DEFAULT 2027,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  subject_name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  topic_name VARCHAR(160) NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  topic_id INT NULL,
  title VARCHAR(180) NOT NULL,
  resource_type ENUM('pdf', 'video', 'article', 'notes', 'practice', 'book') DEFAULT 'notes',
  resource_url VARCHAR(500) NOT NULL,
  is_free BOOLEAN DEFAULT TRUE,
  uploaded_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_title VARCHAR(180) NOT NULL,
  branch_id INT NOT NULL,
  subject_id INT NULL,
  test_type ENUM('mini_mock', 'full_mock', 'sectional', 'pyq', 'practice') DEFAULT 'mini_mock',
  duration_minutes INT DEFAULT 60,
  total_marks DECIMAL(7,2) DEFAULT 0,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  subject_id INT NOT NULL,
  topic_id INT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('mcq', 'msq', 'nat') DEFAULT 'mcq',
  option_a VARCHAR(500) NULL,
  option_b VARCHAR(500) NULL,
  option_c VARCHAR(500) NULL,
  option_d VARCHAR(500) NULL,
  correct_answer VARCHAR(100) NOT NULL,
  explanation TEXT NULL,
  marks DECIMAL(4,2) DEFAULT 1,
  negative_marks DECIMAL(4,2) DEFAULT 0,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS test_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_id INT NOT NULL,
  score DECIMAL(7,2) NOT NULL,
  total_marks DECIMAL(7,2) NOT NULL,
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  unattempted_count INT DEFAULT 0,
  time_taken_minutes INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_answer VARCHAR(100) NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  marks_obtained DECIMAL(5,2) DEFAULT 0,
  FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question TEXT NOT NULL,
  ai_response MEDIUMTEXT NOT NULL,
  chat_type ENUM('doubt', 'questions', 'explanation', 'recommendation') DEFAULT 'doubt',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_study_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_exam_date DATE NOT NULL,
  daily_hours DECIMAL(4,2) NOT NULL,
  weak_subjects TEXT NULL,
  plan_text MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  completed_topics INT DEFAULT 0,
  total_topics INT DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_subject_progress (user_id, subject_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookmark (user_id, resource_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  activity_type VARCHAR(80) NOT NULL,
  activity_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO branches (id, branch_name, branch_code) VALUES
(1, 'Computer Science Engineering', 'CSE'),
(2, 'Electronics & Communication Engineering', 'ECE'),
(3, 'Electrical Engineering', 'EE'),
(4, 'Mechanical Engineering', 'ME'),
(5, 'Civil Engineering', 'CE'),
(6, 'Instrumentation Engineering', 'IN'),
(7, 'Chemical Engineering', 'CH'),
(8, 'Aerospace Engineering', 'AE'),
(9, 'Biotechnology', 'BT'),
(10, 'Engineering Sciences', 'XE'),
(11, 'Humanities & Social Sciences', 'XH'),
(12, 'Data Science & Artificial Intelligence', 'DA'),
(13, 'Mathematics', 'MA'),
(14, 'Physics', 'PH'),
(15, 'Statistics', 'ST'),
(16, 'Architecture & Planning', 'AR'),
(17, 'Ecology & Evolution', 'EY'),
(18, 'Geomatics Engineering', 'GE'),
(19, 'Mining Engineering', 'MN'),
(20, 'Metallurgical Engineering', 'MT'),
(21, 'Naval Architecture & Marine Engineering', 'NM'),
(22, 'Petroleum Engineering', 'PE'),
(23, 'Textile Engineering & Fibre Science', 'TF'),
(24, 'Production & Industrial Engineering', 'PI'),
(25, 'Life Sciences', 'XL'),
(26, 'Environmental Science & Engineering', 'ES'),
(27, 'Agricultural Engineering', 'AG'),
(28, 'Biomedical Engineering', 'BM'),
(29, 'Psychology', 'XH-C5');

INSERT IGNORE INTO users (id, full_name, email, password, phone, role, branch, target_year) VALUES
(1, 'Demo Student', 'student@gatescore.dev', '$2a$10$4497ZHiRUn6stQB/Dsegy.widX.i/cL8IEpcnTMGz2cb.ySLlsCCa', NULL, 'student', 'Computer Science Engineering', 2027),
(2, 'Admin Mentor', 'admin@gatescore.dev', '$2a$10$JYgCgiFxp07D7lBufBNkvus1W271qK0LbsD4HRR2nx/qLsKHHFZKu', NULL, 'admin', 'Computer Science Engineering', 2027);

INSERT IGNORE INTO subjects (id, branch_id, subject_name, description) VALUES
(1, 1, 'Engineering Mathematics', 'Core mathematics for GATE CSE preparation.'),
(2, 1, 'Digital Logic', 'Boolean algebra, gates, combinational and sequential circuits.'),
(3, 1, 'Computer Organization & Architecture', 'Processor, memory, instruction pipeline, and computer architecture.'),
(4, 1, 'Programming & Data Structures', 'Programming fundamentals and core data structures.'),
(5, 1, 'Algorithms', 'Design, analysis, searching, sorting, graphs, and dynamic programming.'),
(6, 1, 'Theory of Computation', 'Automata, languages, grammars, and computability.'),
(7, 1, 'Compiler Design', 'Lexical analysis, parsing, syntax-directed translation, and optimization.'),
(8, 1, 'Operating Systems', 'Processes, scheduling, synchronization, memory, and file systems.'),
(9, 1, 'DBMS', 'SQL, normalization, transactions, indexing, and relational algebra.'),
(10, 1, 'Computer Networks', 'Network layers, TCP/IP, routing, congestion, and application protocols.'),
(11, 1, 'Software Engineering', 'Software process, design, testing, and maintenance.'),
(12, 1, 'AI', 'Search, reasoning, planning, and intelligent systems.'),
(13, 1, 'ML', 'Machine learning concepts, models, and evaluation.'),
(14, 1, 'Cyber Security', 'Security fundamentals, cryptography, and network security.'),
(15, 2, 'Engineering Mathematics', 'Mathematics for ECE.'),
(16, 2, 'Networks', 'Circuit and network analysis.'),
(17, 2, 'Signals & Systems', 'Continuous and discrete signals and systems.'),
(18, 2, 'Analog Circuits', 'Diodes, transistors, amplifiers, and analog electronics.'),
(19, 2, 'Digital Circuits', 'Digital logic and sequential systems.'),
(20, 2, 'Control Systems', 'Feedback, stability, and control analysis.'),
(21, 2, 'Communication Systems', 'Analog and digital communication.'),
(22, 2, 'Electromagnetics', 'Fields, waves, and electromagnetic theory.'),
(23, 2, 'Microprocessors', 'Microprocessor architecture and interfacing.'),
(24, 2, 'VLSI', 'CMOS and VLSI design basics.'),
(25, 2, 'Embedded Systems', 'Embedded hardware, software, and real-time systems.'),
(26, 3, 'Engineering Mathematics', 'Mathematics for EE.'),
(27, 3, 'Electric Circuits', 'Circuit laws, network theorems, and AC/DC circuits.'),
(28, 3, 'Signals & Systems', 'Signal representation and system analysis.'),
(29, 3, 'Electrical Machines', 'Transformers, DC machines, induction and synchronous machines.'),
(30, 3, 'Power Systems', 'Generation, transmission, distribution, and fault analysis.'),
(31, 3, 'Control Systems', 'Control theory and stability.'),
(32, 3, 'Power Electronics', 'Converters, inverters, and drives.'),
(33, 3, 'Measurements', 'Electrical measurements and instrumentation.'),
(34, 3, 'Electromagnetic Fields', 'Electric and magnetic field theory.'),
(35, 4, 'Engineering Mathematics', 'Mathematics for ME.'),
(36, 4, 'Engineering Mechanics', 'Statics and dynamics.'),
(37, 4, 'Strength of Materials', 'Stress, strain, bending, torsion, and failure.'),
(38, 4, 'Thermodynamics', 'Laws, cycles, and properties.'),
(39, 4, 'Fluid Mechanics', 'Fluid statics and dynamics.'),
(40, 4, 'Heat Transfer', 'Conduction, convection, and radiation.'),
(41, 4, 'Manufacturing Engineering', 'Casting, forming, machining, and joining.'),
(42, 4, 'Machine Design', 'Design of machine elements.'),
(43, 4, 'Industrial Engineering', 'Operations, work study, and optimization.'),
(44, 5, 'Engineering Mathematics', 'Mathematics for CE.'),
(45, 5, 'Structural Engineering', 'Analysis and design of structures.'),
(46, 5, 'Geotechnical Engineering', 'Soil mechanics and foundation engineering.'),
(47, 5, 'Transportation Engineering', 'Highways, traffic, and transportation systems.'),
(48, 5, 'Environmental Engineering', 'Water, wastewater, and pollution control.'),
(49, 5, 'Fluid Mechanics', 'Hydraulics and fluid flow.'),
(50, 5, 'Surveying', 'Survey methods, leveling, and measurements.'),
(51, 5, 'Hydrology', 'Rainfall, runoff, and water resources.'),
(52, 6, 'Analog Electronics', 'Analog circuits and devices.'),
(53, 6, 'Digital Electronics', 'Digital logic and electronics.'),
(54, 6, 'Control Systems', 'Control theory for instrumentation.'),
(55, 6, 'Sensors & Transducers', 'Measurement sensors and transducers.'),
(56, 6, 'Signals & Systems', 'Signal analysis and systems.'),
(57, 6, 'Communication Systems', 'Communication fundamentals.'),
(58, 6, 'Process Control', 'Industrial and process control systems.'),
(59, 7, 'Process Calculations', 'Material and energy balances.'),
(60, 7, 'Fluid Mechanics', 'Fluid flow in chemical processes.'),
(61, 7, 'Heat Transfer', 'Heat transfer operations.'),
(62, 7, 'Mass Transfer', 'Separation and mass transfer.'),
(63, 7, 'Thermodynamics', 'Chemical engineering thermodynamics.'),
(64, 7, 'Chemical Reaction Engineering', 'Reaction kinetics and reactor design.'),
(65, 7, 'Plant Design', 'Process plant design and economics.'),
(66, 8, 'Flight Mechanics', 'Aircraft motion and performance.'),
(67, 8, 'Aerodynamics', 'Airflow and aerodynamic forces.'),
(68, 8, 'Aircraft Structures', 'Aircraft structural analysis.'),
(69, 8, 'Propulsion', 'Aircraft and rocket propulsion.'),
(70, 8, 'Thermodynamics', 'Thermodynamics for aerospace systems.'),
(71, 8, 'Fluid Mechanics', 'Fluid dynamics for aerospace.'),
(72, 8, 'Space Dynamics', 'Orbital mechanics and spacecraft dynamics.'),
(73, 9, 'Biochemistry', 'Biomolecules and biochemical pathways.'),
(74, 9, 'Microbiology', 'Microorganisms and applications.'),
(75, 9, 'Genetics', 'Genetic principles and molecular genetics.'),
(76, 9, 'Cell Biology', 'Cell structure and function.'),
(77, 9, 'Immunology', 'Immune system and response.'),
(78, 9, 'Bioinformatics', 'Computational biology and sequence analysis.'),
(79, 9, 'Bioprocess Engineering', 'Bioprocess design and operations.'),
(80, 10, 'Engineering Mathematics', 'Mathematics for engineering sciences.'),
(81, 10, 'Fluid Mechanics', 'Fluid mechanics for XE.'),
(82, 10, 'Materials Science', 'Materials and properties.'),
(83, 10, 'Solid Mechanics', 'Mechanics of solids.'),
(84, 10, 'Thermodynamics', 'Thermodynamics for XE.'),
(85, 10, 'Polymer Science', 'Polymer structure and behavior.'),
(86, 11, 'English', 'Language and literature.'),
(87, 11, 'Communication', 'Communication skills and theory.'),
(88, 11, 'Reasoning', 'Logical and analytical reasoning.'),
(89, 11, 'Psychology', 'Psychology fundamentals.'),
(90, 11, 'Economics', 'Micro and macro economics.'),
(91, 11, 'Sociology', 'Society, culture, and institutions.'),
(92, 11, 'Philosophy', 'Philosophy and critical thought.'),
(93, 12, 'Probability & Statistics', 'Probability, statistics, and inference.'),
(94, 12, 'Programming', 'Programming for data science.'),
(95, 12, 'Data Structures', 'Data structures for AI and data science.'),
(96, 12, 'Machine Learning', 'Supervised and unsupervised learning.'),
(97, 12, 'AI', 'Artificial intelligence fundamentals.'),
(98, 12, 'Deep Learning', 'Neural networks and deep learning.'),
(99, 12, 'Big Data', 'Large-scale data processing.'),
(100, 12, 'Cloud Computing', 'Cloud platforms and distributed services.'),
(101, 13, 'Linear Algebra', 'Vector spaces, matrices, and transformations.'),
(102, 13, 'Calculus', 'Differential and integral calculus.'),
(103, 13, 'Complex Analysis', 'Complex functions and integration.'),
(104, 13, 'Real Analysis', 'Sequences, series, limits, and continuity.'),
(105, 13, 'Differential Equations', 'ODE and PDE basics.'),
(106, 13, 'Probability', 'Probability theory.'),
(107, 13, 'Statistics', 'Statistical methods.'),
(108, 14, 'Classical Mechanics', 'Newtonian and analytical mechanics.'),
(109, 14, 'Quantum Mechanics', 'Quantum theory and applications.'),
(110, 14, 'Electromagnetism', 'Electricity, magnetism, and Maxwell equations.'),
(111, 14, 'Thermodynamics', 'Thermodynamics and statistical physics.'),
(112, 14, 'Optics', 'Geometrical and wave optics.'),
(113, 14, 'Nuclear Physics', 'Nuclear structure and reactions.'),
(114, 15, 'Probability', 'Probability models and distributions.'),
(115, 15, 'Statistical Inference', 'Estimation and hypothesis testing.'),
(116, 15, 'Regression Analysis', 'Regression models and diagnostics.'),
(117, 15, 'Time Series', 'Time-series modeling and forecasting.'),
(118, 15, 'Sampling Theory', 'Survey sampling and estimators.'),
(119, 15, 'Operations Research', 'Optimization and decision models.'),
(120, 16, 'Architecture Design', 'Architectural design principles.'),
(121, 16, 'Urban Planning', 'Planning principles and urban systems.'),
(122, 16, 'Building Materials', 'Materials and construction.'),
(123, 16, 'Environmental Planning', 'Sustainable and environmental planning.'),
(124, 16, 'Landscape Design', 'Landscape architecture and design.'),
(125, 17, 'Ecology', 'Ecological principles and systems.'),
(126, 17, 'Evolution', 'Evolutionary biology.'),
(127, 17, 'Genetics', 'Genetic diversity and inheritance.'),
(128, 17, 'Biodiversity', 'Biodiversity and ecosystems.'),
(129, 17, 'Conservation Biology', 'Conservation principles.'),
(130, 17, 'Environmental Science', 'Environmental systems and issues.'),
(131, 18, 'Surveying', 'Surveying methods and measurements.'),
(132, 18, 'GIS', 'Geographic information systems.'),
(133, 18, 'Remote Sensing', 'Remote sensing methods.'),
(134, 18, 'GPS', 'GNSS and positioning.'),
(135, 18, 'Photogrammetry', 'Photogrammetric mapping.'),
(136, 18, 'Cartography', 'Map design and representation.'),
(137, 19, 'Mining Methods', 'Surface and underground mining.'),
(138, 19, 'Rock Mechanics', 'Rock behavior and support.'),
(139, 19, 'Mine Ventilation', 'Ventilation and mine atmosphere.'),
(140, 19, 'Mineral Processing', 'Processing and beneficiation.'),
(141, 19, 'Mine Safety', 'Safety systems and regulations.'),
(142, 20, 'Physical Metallurgy', 'Microstructure and phase transformations.'),
(143, 20, 'Thermodynamics', 'Metallurgical thermodynamics.'),
(144, 20, 'Corrosion Engineering', 'Corrosion mechanisms and protection.'),
(145, 20, 'Material Science', 'Materials structure and properties.'),
(146, 20, 'Heat Treatment', 'Heat treatment processes.'),
(147, 21, 'Ship Design', 'Ship design principles.'),
(148, 21, 'Marine Structures', 'Structural analysis of marine systems.'),
(149, 21, 'Hydrodynamics', 'Marine fluid dynamics.'),
(150, 21, 'Marine Engines', 'Marine propulsion engines.'),
(151, 21, 'Ocean Engineering', 'Offshore and ocean systems.'),
(152, 22, 'Reservoir Engineering', 'Reservoir behavior and modeling.'),
(153, 22, 'Drilling Engineering', 'Drilling methods and equipment.'),
(154, 22, 'Production Engineering', 'Oil and gas production systems.'),
(155, 22, 'Petroleum Geology', 'Geology for petroleum systems.'),
(156, 22, 'Well Testing', 'Well testing and interpretation.'),
(157, 23, 'Textile Fibres', 'Textile fibre science.'),
(158, 23, 'Yarn Manufacturing', 'Yarn production methods.'),
(159, 23, 'Textile Chemistry', 'Chemical processing of textiles.'),
(160, 23, 'Garment Technology', 'Garment production and technology.'),
(161, 23, 'Polymer Science', 'Polymer materials for textiles.'),
(162, 24, 'Manufacturing Processes', 'Manufacturing methods.'),
(163, 24, 'Operations Research', 'Optimization for production systems.'),
(164, 24, 'Quality Control', 'Quality tools and control.'),
(165, 24, 'Production Planning', 'Planning and scheduling.'),
(166, 24, 'Supply Chain Management', 'Supply chain and logistics.'),
(167, 25, 'Biochemistry', 'Biochemical foundations.'),
(168, 25, 'Botany', 'Plant biology.'),
(169, 25, 'Zoology', 'Animal biology.'),
(170, 25, 'Microbiology', 'Microbial biology.'),
(171, 25, 'Biotechnology', 'Biotechnology concepts.'),
(172, 25, 'Molecular Biology', 'Molecules and gene expression.'),
(173, 26, 'Environmental Chemistry', 'Chemistry of environmental systems.'),
(174, 26, 'Water Treatment', 'Water and wastewater treatment.'),
(175, 26, 'Air Pollution', 'Air quality and pollution control.'),
(176, 26, 'Solid Waste Management', 'Waste management systems.'),
(177, 26, 'Climate Change', 'Climate science and impacts.'),
(178, 27, 'Farm Machinery', 'Agricultural machines and power.'),
(179, 27, 'Soil Science', 'Soil properties and management.'),
(180, 27, 'Irrigation Engineering', 'Irrigation and drainage.'),
(181, 27, 'Food Processing', 'Processing and preservation.'),
(182, 27, 'Crop Production', 'Crop systems and production.'),
(183, 28, 'Human Anatomy', 'Anatomy for biomedical engineering.'),
(184, 28, 'Biomedical Instruments', 'Biomedical measurement instruments.'),
(185, 28, 'Medical Imaging', 'Imaging methods and systems.'),
(186, 28, 'Biomaterials', 'Materials for biomedical use.'),
(187, 28, 'Biomechanics', 'Mechanics of biological systems.'),
(188, 29, 'Cognitive Psychology', 'Cognition and mental processes.'),
(189, 29, 'Social Psychology', 'Social behavior and cognition.'),
(190, 29, 'Clinical Psychology', 'Clinical assessment and disorders.'),
(191, 29, 'Learning & Memory', 'Learning processes and memory.'),
(192, 29, 'Counseling', 'Counseling theory and practice.');

INSERT IGNORE INTO topics (id, subject_id, topic_name, difficulty) VALUES
(1, 1, 'Linear Algebra', 'medium'),
(2, 1, 'Probability', 'medium'),
(3, 5, 'Complexity Analysis', 'easy'),
(4, 5, 'Dynamic Programming', 'hard'),
(5, 8, 'CPU Scheduling', 'medium'),
(6, 8, 'Memory Management', 'hard'),
(7, 10, 'Transport Layer', 'medium'),
(8, 9, 'Normalization', 'medium');

INSERT IGNORE INTO resources (id, subject_id, topic_id, title, resource_type, resource_url, is_free, uploaded_by) VALUES
(1, 1, 1, 'Linear Algebra Quick Notes', 'notes', 'https://nptel.ac.in/courses', TRUE, 2),
(2, 5, 4, 'Dynamic Programming Practice Set', 'article', 'https://www.geeksforgeeks.org/dynamic-programming/', TRUE, 2),
(3, 10, 7, 'TCP/IP Video Lectures', 'video', 'https://nptel.ac.in/courses', TRUE, 2),
(4, 8, 5, 'Process Scheduling Notes', 'pdf', 'https://gateoverflow.in/', TRUE, 2),
(5, 9, 8, 'Normalization PYQ Revision', 'practice', 'https://gateoverflow.in/', TRUE, 2);

INSERT IGNORE INTO tests (id, test_title, branch_id, subject_id, test_type, duration_minutes, total_marks, created_by) VALUES
(1, 'GATE CS Real Pattern Demo Mock', 1, NULL, 'full_mock', 180, 100, 2),
(2, 'Core CS Sectional Practice', 1, 5, 'sectional', 45, 4, 2);

INSERT IGNORE INTO questions
(id, test_id, subject_id, topic_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, negative_marks, difficulty) VALUES
(1, 1, 5, 3, 'What is the time complexity of binary search on a sorted array of n elements?', 'mcq', 'O(n)', 'O(log n)', 'O(n log n)', 'O(1)', 'B', 'Binary search halves the search interval after each comparison, so it needs logarithmic comparisons.', 1, 0.33, 'easy'),
(2, 1, 8, 5, 'Which scheduling algorithm may cause starvation?', 'mcq', 'Round Robin', 'FCFS', 'Priority Scheduling', 'SJF with aging', 'C', 'Low priority processes may wait indefinitely when higher priority jobs keep arriving.', 1, 0.33, 'medium'),
(3, 1, 9, 8, 'Which normal form removes transitive dependency?', 'mcq', '1NF', '2NF', '3NF', 'BCNF only', 'C', 'Third normal form requires non-prime attributes to depend only on candidate keys.', 1, 0.33, 'medium'),
(4, 1, 10, 7, 'TCP provides which of the following?', 'mcq', 'Unreliable datagrams', 'Connection-oriented reliable byte stream', 'No flow control', 'Only multicast delivery', 'B', 'TCP is connection-oriented and provides reliable, ordered byte-stream delivery with flow and congestion control.', 2, 0.66, 'easy'),
(5, 1, 1, 1, 'If a square matrix has determinant zero, what can be concluded?', 'mcq', 'It is invertible', 'Rows are linearly independent', 'It is singular', 'All eigenvalues are one', 'C', 'A zero determinant means the matrix is singular and does not have an inverse.', 1, 0.33, 'easy'),
(6, 1, 8, 6, 'Select all statements that are true for virtual memory.', 'msq', 'It uses address translation', 'It can use demand paging', 'It requires every process to fit entirely in RAM', 'It can increase apparent memory available to programs', 'A,B,D', 'Virtual memory translates addresses, commonly uses demand paging, and lets programs see a larger address space than physical RAM.', 2, 0, 'medium'),
(7, 1, 1, 2, 'A fair coin is tossed 3 times. Enter the number of outcomes with exactly two heads.', 'nat', NULL, NULL, NULL, NULL, '3', 'The favorable outcomes are HHT, HTH, and THH, so the numerical answer is 3.', 2, 0, 'easy'),
(8, 1, 5, 4, 'Which of the following are valid dynamic programming properties?', 'msq', 'Overlapping subproblems', 'Optimal substructure', 'Always greedy choice', 'Memoization or tabulation can be used', 'A,B,D', 'DP is useful when overlapping subproblems and optimal substructure exist; it is implemented with memoization or tabulation.', 2, 0, 'medium'),
(9, 2, 5, 3, 'What is the recurrence relation idea behind binary search?', 'mcq', 'T(n)=T(n-1)+1', 'T(n)=T(n/2)+1', 'T(n)=2T(n/2)+n', 'T(n)=T(n)+1', 'B', 'Binary search solves one half-size subproblem after one comparison.', 1, 0.33, 'easy');

INSERT IGNORE INTO user_progress (id, user_id, subject_id, completed_topics, total_topics, progress_percentage) VALUES
(1, 1, 1, 1, 2, 50.00),
(2, 1, 5, 1, 2, 50.00),
(3, 1, 8, 1, 2, 50.00);

INSERT IGNORE INTO activity_logs (id, user_id, activity_type, activity_description) VALUES
(1, 1, 'welcome', 'Demo student account created with seeded GATE preparation data.');
