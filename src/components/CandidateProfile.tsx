import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Clock, MessageSquare } from 'lucide-react';
import { candidatesApi, notesApi } from '../lib/api';
import { Candidate, TimelineEvent, CandidateNote } from '../lib/supabase';

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (id) {
      loadCandidateData();
    }
  }, [id]);

  const loadCandidateData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [candidateData, timelineData, notesData] = await Promise.all([
        candidatesApi.getCandidateById(id),
        candidatesApi.getCandidateTimeline(id),
        notesApi.getCandidateNotes(id)
      ]);

      setCandidate(candidateData);
      setTimeline(timelineData);
      setNotes(notesData);
    } catch (err) {
      console.error('Failed to load candidate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!candidate || !id) return;

    try {
      await candidatesApi.updateCandidate(id, { stage: newStage as any });
      await loadCandidateData();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleAddNote = async () => {
    if (!id || !noteContent.trim()) return;

    try {
      setSavingNote(true);
      const mentions = noteContent.match(/@\w+/g)?.map(m => m.substring(1)) || [];
      await notesApi.addNote(id, noteContent, mentions);
      setNoteContent('');
      await loadCandidateData();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-gray-500',
      screen: 'bg-blue-500',
      tech: 'bg-yellow-500',
      offer: 'bg-purple-500',
      hired: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-500">
          Candidate not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/candidates')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Candidates
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidate.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  {candidate.email}
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getStageColor(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Stage</h2>
            <div className="grid grid-cols-3 gap-3">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => handleStageChange(stage)}
                  disabled={candidate.stage === stage}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    candidate.stage === stage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:cursor-not-allowed`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Timeline
            </h2>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getStageColor(event.to_stage)}`}></div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2">
                      {event.from_stage && (
                        <>
                          <span className="font-medium text-gray-700">{event.from_stage}</span>
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      <span className="font-medium text-gray-900">{event.to_stage}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(event.created_at)}</p>
                    {event.notes && (
                      <p className="text-sm text-gray-600 mt-2">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Notes
            </h2>

            <div className="mb-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note... Use @name to mention someone"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddNote}
                disabled={savingNote || !noteContent.trim()}
                className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {note.content.split(/(@\w+)/g).map((part, i) =>
                      part.startsWith('@') ? (
                        <span key={i} className="text-blue-600 font-medium">{part}</span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(note.created_at)}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
