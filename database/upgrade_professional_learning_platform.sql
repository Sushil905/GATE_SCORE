USE gate_score;

ALTER TABLE users
  MODIFY COLUMN role ENUM('student', 'mentor', 'admin') DEFAULT 'student';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER role,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS branch VARCHAR(120) DEFAULT 'Computer Science' AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS college VARCHAR(180) NULL AFTER branch,
  ADD COLUMN IF NOT EXISTS target_score DECIMAL(5,2) DEFAULT 75.00 AFTER target_exam_date,
  ADD COLUMN IF NOT EXISTS study_hours_per_day DECIMAL(4,2) DEFAULT 4.00 AFTER target_score,
  ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'blocked') DEFAULT 'active' AFTER study_hours_per_day,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

CREATE TABLE IF NOT EXISTS programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  exam_year INT NOT NULL,
  starts_on DATE NULL,
  ends_on DATE NULL,
  status ENUM('draft', 'active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NULL,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(40) NOT NULL,
  weightage_percent DECIMAL(5,2) DEFAULT 0,
  display_order INT DEFAULT 0,
  UNIQUE KEY uq_subject_code (program_id, code),
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  difficulty ENUM('foundation', 'easy', 'medium', 'hard') DEFAULT 'medium',
  expected_hours DECIMAL(5,2) DEFAULT 2.00,
  display_order INT DEFAULT 0,
  UNIQUE KEY uq_topic_slug (subject_id, slug),
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NULL,
  title VARCHAR(180) NOT NULL,
  subtitle VARCHAR(220) NULL,
  description TEXT,
  level ENUM('foundation', 'intermediate', 'advanced') DEFAULT 'foundation',
  thumbnail_url VARCHAR(500) NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  topic_id INT NULL,
  title VARCHAR(180) NOT NULL,
  lesson_type ENUM('video', 'reading', 'practice', 'quiz', 'live_class') DEFAULT 'reading',
  content_url VARCHAR(500) NULL,
  content_text MEDIUMTEXT NULL,
  duration_minutes INT DEFAULT 20,
  display_order INT DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('active', 'completed', 'paused') DEFAULT 'active',
  progress_percent DECIMAL(5,2) DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  UNIQUE KEY uq_enrollment (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  time_spent_minutes INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lesson_progress (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

ALTER TABLE resources
  MODIFY COLUMN type ENUM('pdf', 'video', 'article', 'notes', 'practice', 'book') DEFAULT 'notes',
  MODIFY COLUMN difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner';

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS topic_id INT NULL AFTER subject,
  ADD COLUMN IF NOT EXISTS description TEXT NULL AFTER title,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(120) DEFAULT 'GATE_SCORE' AFTER difficulty,
  ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 30 AFTER provider,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE AFTER estimated_minutes,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE questions
  MODIFY COLUMN source ENUM('mock', 'pyq', 'ai', 'practice') DEFAULT 'mock';

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS topic_id INT NULL AFTER topic,
  ADD COLUMN IF NOT EXISTS difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' AFTER explanation,
  ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(4,2) DEFAULT 0 AFTER marks,
  ADD COLUMN IF NOT EXISTS created_by INT NULL AFTER year,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by;

ALTER TABLE tests
  ADD COLUMN IF NOT EXISTS description TEXT NULL AFTER subject,
  ADD COLUMN IF NOT EXISTS test_type ENUM('mini_mock', 'full_mock', 'sectional', 'pyq', 'practice') DEFAULT 'mini_mock' AFTER description,
  ADD COLUMN IF NOT EXISTS total_marks DECIMAL(7,2) DEFAULT 0 AFTER duration_minutes,
  ADD COLUMN IF NOT EXISTS passing_score DECIMAL(7,2) DEFAULT 0 AFTER total_marks,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE AFTER passing_score,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE test_questions
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 AFTER question_id;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS time_taken_minutes INT DEFAULT 0 AFTER accuracy,
  ADD COLUMN IF NOT EXISTS review JSON NULL AFTER answers;

CREATE TABLE IF NOT EXISTS study_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  target_date DATE NOT NULL,
  daily_hours DECIMAL(4,2) NOT NULL,
  weak_subjects JSON NULL,
  plan_json JSON NULL,
  status ENUM('active', 'completed', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  study_plan_id INT NULL,
  user_id INT NOT NULL,
  subject_id INT NULL,
  topic_id INT NULL,
  title VARCHAR(180) NOT NULL,
  task_type ENUM('lesson', 'revision', 'practice', 'mock', 'doubt') DEFAULT 'revision',
  due_date DATE NULL,
  estimated_minutes INT DEFAULT 45,
  status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (study_plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS doubt_threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(120) NULL,
  topic VARCHAR(160) NULL,
  question TEXT NOT NULL,
  ai_answer MEDIUMTEXT NULL,
  status ENUM('open', 'resolved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  audience ENUM('all', 'students', 'mentors', 'admins') DEFAULT 'students',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  event_type VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id INT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

UPDATE users
SET branch = COALESCE(branch, 'Computer Science'),
    target_score = COALESCE(target_score, 75.00),
    study_hours_per_day = COALESCE(study_hours_per_day, 4.00),
    status = COALESCE(status, 'active');

INSERT IGNORE INTO programs (id, code, name, description, exam_year, starts_on, ends_on) VALUES
(1, 'GATE-CS-2027', 'GATE Computer Science 2027', 'Structured preparation path for GATE Computer Science with lessons, mocks, PYQs, resources, and analytics.', 2027, '2026-05-01', '2027-02-08');

INSERT IGNORE INTO subjects (id, program_id, name, code, weightage_percent, display_order) VALUES
(1, 1, 'Engineering Mathematics', 'MATH', 13.00, 1),
(2, 1, 'Algorithms', 'ALGO', 12.00, 2),
(3, 1, 'Operating Systems', 'OS', 10.00, 3),
(4, 1, 'Computer Networks', 'CN', 8.00, 4),
(5, 1, 'Databases', 'DBMS', 8.00, 5),
(6, 1, 'Theory of Computation', 'TOC', 8.00, 6),
(7, 1, 'Computer Organization', 'COA', 9.00, 7),
(8, 1, 'Digital Logic', 'DL', 6.00, 8);

INSERT IGNORE INTO topics (id, subject_id, name, slug, difficulty, expected_hours, display_order) VALUES
(1, 1, 'Linear Algebra', 'linear-algebra', 'medium', 8.00, 1),
(2, 1, 'Probability', 'probability', 'medium', 6.00, 2),
(3, 2, 'Complexity Analysis', 'complexity-analysis', 'easy', 4.00, 1),
(4, 2, 'Dynamic Programming', 'dynamic-programming', 'hard', 10.00, 2),
(5, 3, 'CPU Scheduling', 'cpu-scheduling', 'medium', 6.00, 1),
(6, 3, 'Memory Management', 'memory-management', 'hard', 8.00, 2),
(7, 4, 'Transport Layer', 'transport-layer', 'medium', 6.00, 1),
(8, 5, 'Normalization', 'normalization', 'medium', 5.00, 1);

INSERT IGNORE INTO courses (id, program_id, title, subtitle, description, level, created_by) VALUES
(1, 1, 'GATE CS Foundation Sprint', 'Build the base before mocks', 'A structured foundation course covering math, algorithms, OS, CN, DBMS, and core CS topics.', 'foundation', 2),
(2, 1, 'Mock Test and Analysis Track', 'Practice, analyze, improve', 'Mini mocks, PYQs, and analytics-driven revision for score improvement.', 'intermediate', 2);

INSERT IGNORE INTO lessons (id, course_id, topic_id, title, lesson_type, content_url, duration_minutes, display_order, is_free) VALUES
(1, 1, 1, 'Linear Algebra Revision Notes', 'reading', 'https://nptel.ac.in/courses', 35, 1, TRUE),
(2, 1, 3, 'Time Complexity Patterns', 'video', 'https://nptel.ac.in/courses', 28, 2, TRUE),
(3, 1, 5, 'CPU Scheduling Concepts', 'reading', 'https://gateoverflow.in/', 40, 3, TRUE),
(4, 2, 4, 'Dynamic Programming Practice Drill', 'practice', 'https://www.geeksforgeeks.org/dynamic-programming/', 50, 1, TRUE);

INSERT IGNORE INTO enrollments (id, user_id, course_id, progress_percent) VALUES
(1, 1, 1, 34.00),
(2, 1, 2, 12.00);

UPDATE resources SET topic_id = 1, description = 'Rank-focused formulas and solved examples for fast revision.', provider = 'NPTEL', estimated_minutes = 45 WHERE id = 1;
UPDATE resources SET topic_id = 4, description = 'Pattern-wise DP problems for GATE practice.', provider = 'GeeksforGeeks', estimated_minutes = 60 WHERE id = 2;
UPDATE resources SET topic_id = 7, description = 'Concept lectures for transport layer and TCP behavior.', provider = 'NPTEL', estimated_minutes = 90 WHERE id = 3;
UPDATE resources SET topic_id = 5, description = 'Concise notes for CPU scheduling algorithms and starvation.', provider = 'GATE Overflow', estimated_minutes = 40 WHERE id = 4;

INSERT IGNORE INTO resources (id, subject, topic_id, title, description, type, url, difficulty, provider, estimated_minutes, uploaded_by) VALUES
(5, 'Databases', 8, 'Normalization PYQ Revision', 'Short revision for dependencies and normal forms.', 'practice', 'https://gateoverflow.in/', 'intermediate', 'GATE Overflow', 35, 2);

UPDATE questions SET topic_id = 3, difficulty = 'easy', negative_marks = 0, created_by = 2 WHERE id = 1;
UPDATE questions SET topic_id = 5, difficulty = 'medium', negative_marks = 0, created_by = 2 WHERE id = 2;
UPDATE questions SET topic_id = 8, difficulty = 'medium', negative_marks = 0, created_by = 2 WHERE id = 3;
UPDATE questions SET topic_id = 7, difficulty = 'easy', negative_marks = 0, created_by = 2 WHERE id = 4;

INSERT IGNORE INTO questions (id, subject, topic, topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, marks, negative_marks, source, year, created_by) VALUES
(5, 'Engineering Mathematics', 'Linear Algebra', 1, 'If a square matrix has determinant zero, what can be concluded?', 'It is invertible', 'Rows are linearly independent', 'It is singular', 'All eigenvalues are one', 'C', 'A zero determinant means the matrix is singular and does not have an inverse.', 'easy', 1, 0, 'practice', NULL, 2);

UPDATE tests SET description = 'A quick diagnostic mock covering algorithms, OS, DBMS, CN, and mathematics.', test_type = 'mini_mock', total_marks = 5, passing_score = 3, is_published = TRUE WHERE id = 1;

INSERT IGNORE INTO tests (id, title, subject, description, test_type, duration_minutes, total_marks, passing_score, created_by) VALUES
(2, 'Core CS Sectional Practice', 'Computer Science', 'Topic-mixed sectional practice for common GATE CS weak areas.', 'sectional', 45, 4, 2, 2);

INSERT IGNORE INTO test_questions (test_id, question_id, display_order) VALUES
(1, 5, 5),
(2, 1, 1),
(2, 2, 2),
(2, 3, 3),
(2, 4, 4);

INSERT IGNORE INTO study_plans (id, user_id, title, target_date, daily_hours, weak_subjects, plan_json) VALUES
(1, 1, 'GATE CS 90-Day Improvement Plan', '2027-02-08', 4.00, JSON_OBJECT('Operating Systems', 4, 'Engineering Mathematics', 3), JSON_OBJECT('weeklyGoal', 'Finish weak topics, attempt one mini mock, revise mistakes'));

INSERT IGNORE INTO study_tasks (id, study_plan_id, user_id, subject_id, topic_id, title, task_type, due_date, estimated_minutes, status) VALUES
(1, 1, 1, 3, 5, 'Revise CPU scheduling and solve 12 questions', 'practice', '2026-05-20', 60, 'pending'),
(2, 1, 1, 1, 1, 'Revise rank, determinant, and eigenvalue formulas', 'revision', '2026-05-21', 45, 'pending'),
(3, 1, 1, 2, 4, 'Practice dynamic programming patterns', 'practice', '2026-05-22', 75, 'pending');

INSERT IGNORE INTO announcements (id, title, body, audience, created_by) VALUES
(1, 'New weekly mock schedule', 'Attempt one mini mock every Sunday and review weak topics before moving to the next subject.', 'students', 2);
