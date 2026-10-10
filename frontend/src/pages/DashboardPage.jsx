import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Layers, 
  ShieldCheck, 
  Code2, 
  Sparkles, 
  Play, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  Terminal,
  Activity,
  FolderGit2
} from 'lucide-react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { BugCreateModal } from '../components/bugs/BugCreateModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = ({ onSelectProject: propOnSelectProject }) => {
  const navigate = useNavigate();
  const onSelectProject = propOnSelectProject || ((project) => navigate(`/projects/${project._id}`));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLogBugOpen, setIsLogBugOpen] = useState(false);

  const { user, role, isTester, isDeveloper } = useAuth();
  const { addToast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load projects from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Role-Calibrated Welcome Banner (Section 4.3) */}
      <div className={`p-7 sm:p-9 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300 shadow-xl ${
        isDeveloper && role !== 'admin'
          ? 'bg-purple-950/25 border-purple-500/40 shadow-purple-950/20'
          : 'bg-cyan-950/25 border-cyan-500/40 shadow-cyan-950/20'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                isDeveloper && role !== 'admin'
                  ? 'bg-purple-950 border-purple-500/60 text-purple-200'
                  : 'bg-cyan-950 border-cyan-500/60 text-cyan-200'
              }`}>
                {role.toUpperCase()} WORKSPACE VIEW
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {user?.workspace?.name || 'Alpha QA Hub'} ({user?.workspace?.code || 'ALPHA-QA'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, {user?.name || 'Engineer'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {isDeveloper && role !== 'admin'
                ? 'Review claimed high-priority defects, link Git PRs, and mark code changes ready for QA verification.'
                : 'Manage test suites, initiate rapid test execution cycles, and log defects with auto-generated repro steps.'}
            </p>
          </div>

          {/* Role-Calibrated Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isTester ? (
              <>
                <button
                  onClick={() => setIsLogBugOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-950/50 hover:-translate-y-0.5"
                >
                  <Plus size={16} />
                  <span>Log Bug</span>
                </button>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-cyan-950/50 hover:-translate-y-0.5"
                >
                  <Plus size={16} />
                  <span>New Project</span>
                </button>
              </>
            ) : (
              <div className="p-4 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-xs sm:text-sm text-purple-200 font-medium">
                ⚡ Developer Mode: Triage assigned tickets & dispatch Git PRs
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Search & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FolderGit2 size={22} className="text-cyan-400" />
            <span>Active Repositories & Test Hubs ({filteredProjects.length})</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Select a project to explore its Bug Hub, test case hierarchy, and real-time execution stream.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by key or name..."
            className="w-full glass-input pl-10 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium text-sm animate-pulse">
          Loading projects from MongoDB Compass database...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-950/50 space-y-3">
          <Layers size={36} className="mx-auto text-slate-500" />
          <div className="text-base text-slate-200 font-bold">No Projects Found</div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Get started by initializing a new project or adjusting your search query.
          </p>
          {isTester && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-black transition-all"
            >
              <Plus size={16} /> Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
              onClick={onSelectProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={fetchProjects}
      />

      <BugCreateModal
        isOpen={isLogBugOpen}
        onClose={() => setIsLogBugOpen(false)}
        projectId={projects[0]?._id}
        onBugCreated={() => {
          fetchProjects();
          addToast('Defect created! Open Project Hub to view.', 'cyber');
        }}
      />
    </div>
  );
};
