import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Briefcase, Users, ClipboardList, LayoutGrid } from 'lucide-react';
import JobsBoard from './components/JobsBoard';
import CandidatesList from './components/CandidatesList';
import CandidateProfile from './components/CandidateProfile';
import KanbanBoard from './components/KanbanBoard';
import AssessmentBuilder from './components/AssessmentBuilder';
import { seedDatabase } from './lib/seed';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Briefcase className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-gray-900">TalentFlow</span>
          </div>
          <div className="flex gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') && !isActive('/candidates') && !isActive('/kanban') && !isActive('/assessments')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={20} />
              Jobs
            </Link>
            <Link
              to="/candidates"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/candidates')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={20} />
              Candidates
            </Link>
            <Link
              to="/kanban"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/kanban')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={20} />
              Kanban
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        <Route path="/" element={<JobsBoard />} />
        <Route path="/candidates" element={<CandidatesList />} />
        <Route path="/candidates/:id" element={<CandidateProfile />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    seedDatabase()
      .then(() => setSeeding(false))
      .catch(err => {
        console.error('Seeding error:', err);
        setSeeding(false);
      });
  }, []);

  if (seeding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Initializing TalentFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}
