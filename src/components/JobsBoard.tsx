import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Archive, Edit2, GripVertical, ClipboardList } from 'lucide-react';
import { jobsApi } from '../lib/api';
import { Job } from '../lib/supabase';
import JobModal from './JobModal';

export default function JobsBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobsApi.getJobs({
        search,
        status: statusFilter,
        page,
        pageSize: 10
      });
      setJobs(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, page]);

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleToggleArchive = async (job: Job) => {
    try {
      await jobsApi.updateJob(job.id, {
        status: job.status === 'active' ? 'archived' : 'active'
      });
      loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
    }
  };

  const handleDragStart = (job: Job) => {
    setDraggedJob(job);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetJob: Job) => {
    if (!draggedJob || draggedJob.id === targetJob.id) return;

    const originalJobs = [...jobs];

    const newJobs = jobs.filter(j => j.id !== draggedJob.id);
    const targetIndex = newJobs.findIndex(j => j.id === targetJob.id);
    newJobs.splice(targetIndex, 0, draggedJob);

    setJobs(newJobs.map((job, index) => ({ ...job, order: index })));

    try {
      await jobsApi.reorderJob(draggedJob.id, draggedJob.order, targetJob.order);
      loadJobs();
    } catch (err) {
      setJobs(originalJobs);
      setError(err instanceof Error ? err.message : 'Failed to reorder jobs');
    }

    setDraggedJob(null);
  };

  const handleSaveJob = async (job: Partial<Job>) => {
    try {
      if (editingJob) {
        await jobsApi.updateJob(editingJob.id, job);
      } else {
        const maxOrder = Math.max(...jobs.map(j => j.order), -1);
        await jobsApi.createJob({
          ...job as Omit<Job, 'id' | 'created_at' | 'updated_at'>,
          order: maxOrder + 1
        });
      }
      setShowModal(false);
      loadJobs();
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={handleCreateJob}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Job
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                draggable
                onDragStart={() => handleDragStart(job)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(job)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-move"
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/assessments/${job.id}`)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Manage Assessment"
                    >
                      <ClipboardList size={18} />
                    </button>
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(job)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Archive size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No jobs found. Create your first job to get started.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <JobModal
          job={editingJob}
          onClose={() => setShowModal(false)}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
}
