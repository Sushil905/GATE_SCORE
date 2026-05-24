export function CourseCard({ course }) {
  return (
    <a className="resource-card" href={course.url} target="_blank" rel="noreferrer">
      <span>{course.level || 'foundation'}</span>
      <strong>{course.title}</strong>
      <small>{course.platform || 'Free course'} · {course.lesson_count || 0} lessons</small>
    </a>
  );
}
