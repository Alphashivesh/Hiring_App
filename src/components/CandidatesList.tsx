import { useState, useEffect, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi } from '../lib/api';
import { Candidate } from '../lib/supabase';

export default function CandidatesList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const ITEM_HEIGHT = 80;
  const CONTAINER_HEIGHT = 600;
  const BUFFER = 5;

  useEffect(() => {
    loadAllCandidates();
  }, []);

  const loadAllCandidates = async () => {
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

      setAllCandidates(allData);
      setCandidates(allData);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = allCandidates;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        c => c.name.toLowerCase().includes(searchLower) ||
             c.email.toLowerCase().includes(searchLower)
      );
    }

    if (stageFilter) {
      filtered = filtered.filter(c => c.stage === stageFilter);
    }

    setCandidates(filtered);
    setScrollTop(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [search, stageFilter, allCandidates]);

  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
  const endIndex = Math.min(candidates.length, startIndex + visibleCount + BUFFER * 2);
  const visibleCandidates = candidates.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-gray-100 text-gray-700',
      screen: 'bg-blue-100 text-blue-700',
      tech: 'bg-yellow-100 text-yellow-700',
      offer: 'bg-purple-100 text-purple-700',
      hired: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <div className="text-sm text-gray-600">
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Tech</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: CONTAINER_HEIGHT }}
            className="overflow-y-auto"
          >
            <div style={{ height: candidates.length * ITEM_HEIGHT, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                    style={{ height: ITEM_HEIGHT }}
                    className="flex items-center gap-4 px-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="text-gray-600" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{candidate.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStageColor(candidate.stage)}`}>
                      {candidate.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No candidates found.
        </div>
      )}
    </div>
  );
}
