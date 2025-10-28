import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi } from '../lib/api';
import { Candidate } from '../lib/supabase';
import { User } from 'lucide-react';

const STAGES = [
  { key: 'applied', label: 'Applied', color: 'bg-gray-100' },
  { key: 'screen', label: 'Screen', color: 'bg-blue-100' },
  { key: 'tech', label: 'Tech', color: 'bg-yellow-100' },
  { key: 'offer', label: 'Offer', color: 'bg-purple-100' },
  { key: 'hired', label: 'Hired', color: 'bg-green-100' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100' }
];

export default function KanbanBoard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      let allData: Candidate[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await candidatesApi.getCandidates({
          page,
          pageSize: 100
        });
        allData = [...allData, ...result.data];
        hasMore = result.page < result.totalPages;
        page++;
      }

      setCandidates(allData);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (candidate: Candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStage: string) => {
    if (!draggedCandidate || draggedCandidate.stage === targetStage) {
      setDraggedCandidate(null);
      return;
    }

    const oldStage = draggedCandidate.stage;

    setCandidates(candidates.map(c =>
      c.id === draggedCandidate.id ? { ...c, stage: targetStage as any } : c
    ));

    try {
      await candidatesApi.updateCandidate(draggedCandidate.id, {
        stage: targetStage as any
      });
    } catch (err) {
      setCandidates(candidates.map(c =>
        c.id === draggedCandidate.id ? { ...c, stage: oldStage } : c
      ));
      console.error('Failed to update candidate stage:', err);
    }

    setDraggedCandidate(null);
  };

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(c => c.stage === stage);
  };

  if (loading) {
    return (
      <div className="max-w-full mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Kanban Board</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.key);

          return (
            <div
              key={stage.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.key)}
              className={`flex-shrink-0 w-72 ${stage.color} rounded-lg p-4`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">{stage.label}</h2>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={() => handleDragStart(candidate)}
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-gray-600" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{candidate.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
