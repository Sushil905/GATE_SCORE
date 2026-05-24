import { BookOpen, Bot, ClipboardList, FileUp, Shield, Trophy } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { Stat } from '../components/Stat.jsx';

export function AdminDashboard({ resources, adminForm, setAdminForm, uploadResource }) {
  return (
    <section className="page">
      <PageTitle icon={Shield} title="Admin Dashboard" text="Upload resources and manage student preparation content." />
      <div className="stats-grid">
        <Stat icon={BookOpen} label="Resources" value={resources.length} />
        <Stat icon={ClipboardList} label="Tests" value="1" />
        <Stat icon={Bot} label="AI Tools" value="5" />
        <Stat icon={Trophy} label="Status" value="Live" />
      </div>
      <div className="split">
        <form className="panel form" onSubmit={uploadResource}>
          <h2>Upload Resource</h2>
          <div className="grid-two">
            <label>Subject<input placeholder="Subject" value={adminForm.subject} onChange={(event) => setAdminForm({ ...adminForm, subject: event.target.value })} /></label>
            <label>Title<input placeholder="Title" value={adminForm.title} onChange={(event) => setAdminForm({ ...adminForm, title: event.target.value })} /></label>
            <label>Type<select value={adminForm.type} onChange={(event) => setAdminForm({ ...adminForm, type: event.target.value })}>
              <option>notes</option>
              <option>pdf</option>
              <option>video</option>
              <option>article</option>
            </select></label>
            <label>Difficulty<select value={adminForm.difficulty} onChange={(event) => setAdminForm({ ...adminForm, difficulty: event.target.value })}>
              <option>beginner</option>
              <option>intermediate</option>
              <option>advanced</option>
            </select></label>
          </div>
          <label>URL<input placeholder="URL" value={adminForm.url} onChange={(event) => setAdminForm({ ...adminForm, url: event.target.value })} /></label>
          <button className="primary" type="submit"><FileUp size={18} /> Upload Resource</button>
        </form>
        <div className="panel table-panel">
          <h2>Recent Resources</h2>
          {resources.slice(0, 6).map((resource) => (
            <div className="table-row" key={resource.id}>
              <span>{resource.subject}</span>
              <strong>{resource.title}</strong>
              <small>{resource.type}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
