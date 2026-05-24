import { useMemo, useState } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { CourseCard } from '../components/CourseCard.jsx';
import { PageTitle } from '../components/PageTitle.jsx';
import { gateBranches } from '../data/branchData.js';
import { getBranchCourses } from '../data/courseData.js';

export function Courses() {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science Engineering');
  const branchMeta = gateBranches.find((branch) => branch.name === selectedBranch);
  const courses = useMemo(() => getBranchCourses(selectedBranch), [selectedBranch]);

  return (
    <section className="page">
      <PageTitle icon={BookOpen} title="Free Courses" text="Branch-wise free courses from NPTEL, SWAYAM, MIT OpenCourseWare, and IIT Bombay Spoken Tutorial." />
      <div className="resource-toolbar">
        <label className="toolbar-field"><Filter size={18} />
          <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)}>
            {gateBranches.map((branch) => (
              <option value={branch.name} key={branch.code}>{branch.name} ({branch.code})</option>
            ))}
          </select>
        </label>
        <span>{courses.length} free course links</span>
      </div>
      <div className="resource-subsection">
        <div>
          <small>{branchMeta?.code}</small>
          <strong>{selectedBranch}</strong>
        </div>
        <p>Start with NPTEL/SWAYAM for GATE-aligned Indian engineering courses, then use MIT OCW and Spoken Tutorial for open learning and tools.</p>
      </div>
      <div className="resource-grid">
        {courses.map((course) => <CourseCard course={course} key={course.id} />)}
      </div>
    </section>
  );
}
