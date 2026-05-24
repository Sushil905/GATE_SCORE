import { useMemo, useState } from 'react';
import { BookOpen, Filter, Search } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { ResourceCard } from '../components/ResourceCard.jsx';
import { gateBranches } from '../data/branchData.js';
import { branchResourceMap, resourceSearchUrl, resourceTypeFromTitle } from '../data/resourceData.js';

export function Resources({ resources }) {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science Engineering');
  const [search, setSearch] = useState('');
  const branchMeta = gateBranches.find((branch) => branch.name === selectedBranch);
  const curatedResources = useMemo(() => {
    const branchResources = branchResourceMap[selectedBranch] || [];
    return branchResources
      .map((title, index) => ({
        id: `${branchMeta?.code || selectedBranch}-${index}`,
        subject: selectedBranch,
        title,
        type: resourceTypeFromTitle(title),
        difficulty: index < 3 ? 'beginner' : index < 7 ? 'intermediate' : 'advanced',
        url: resourceSearchUrl(selectedBranch, title)
      }))
      .filter((resource) => resource.title.toLowerCase().includes(search.toLowerCase()));
  }, [branchMeta?.code, search, selectedBranch]);

  return (
    <section className="page">
      <PageTitle icon={BookOpen} title="Study Resources" text="Branch-wise notes, PDFs, videos, tools, practice sets, and PYQ resources." />
      <div className="resource-toolbar">
        <label className="toolbar-field"><Filter size={18} />
          <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)}>
            {gateBranches.map((branch) => (
              <option value={branch.name} key={branch.code}>{branch.name} ({branch.code})</option>
            ))}
          </select>
        </label>
        <label className="toolbar-field"><Search size={18} />
          <input placeholder="Search resources" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <span>{curatedResources.length} resources</span>
      </div>
      <div className="resource-subsection">
        <div>
          <small>{branchMeta?.code}</small>
          <strong>{selectedBranch}</strong>
        </div>
        <p>Open the right notes, videos, tools, and practice material for your selected GATE branch.</p>
      </div>
      <div className="resource-grid">
        {curatedResources.map((resource) => <ResourceCard resource={resource} key={resource.id} />)}
      </div>
      {resources.length > 0 && (
        <div className="resource-subsection compact-subsection">
          <div>
            <small>Database</small>
            <strong>Recently Added</strong>
          </div>
          <span>{resources.length} saved resources</span>
        </div>
      )}
    </section>
  );
}
