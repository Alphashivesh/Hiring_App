import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Eye } from 'lucide-react';
import { assessmentsApi, jobsApi } from '../lib/api';
import { Assessment, AssessmentSection, Question, QuestionType, Job } from '../lib/supabase';
import AssessmentPreview from './AssessmentPreview';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'multi-choice', label: 'Multiple Choice' },
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file-upload', label: 'File Upload' }
];

export default function AssessmentBuilder() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<AssessmentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId]);

  const loadData = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const [jobData, assessmentData] = await Promise.all([
        jobsApi.getJobById(jobId),
        assessmentsApi.getAssessment(jobId)
      ]);

      setJob(jobData);

      if (assessmentData) {
        setTitle(assessmentData.title);
        setSections(assessmentData.sections);
      } else {
        setTitle(jobData?.title ? `${jobData.title} Assessment` : 'New Assessment');
        setSections([{
          id: crypto.randomUUID(),
          title: 'Section 1',
          questions: []
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, {
      id: crypto.randomUUID(),
      title: `Section ${sections.length + 1}`,
      questions: []
    }]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleUpdateSection = (sectionId: string, title: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, title } : s
    ));
  };

  const handleAddQuestion = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            questions: [...s.questions, {
              id: crypto.randomUUID(),
              type: 'short-text',
              question: '',
              required: false
            }]
          }
        : s
    ));
  };

  const handleRemoveQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
        : s
    ));
  };

  const handleUpdateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            questions: s.questions.map(q =>
              q.id === questionId ? { ...q, ...updates } : q
            )
          }
        : s
    ));
  };

  const handleSave = async () => {
    if (!jobId) return;

    try {
      setSaving(true);
      setError(null);
      await assessmentsApi.saveAssessment({
        job_id: jobId,
        title,
        sections
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
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

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-500">Job not found</div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <AssessmentPreview
        assessment={{ id: '', job_id: jobId!, title, sections, created_at: '', updated_at: '' }}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Builder</h1>
          <p className="text-gray-600 mt-1">for {job.title}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye size={20} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assessment Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter assessment title..."
        />
      </div>

      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <GripVertical className="text-gray-400" size={20} />
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleUpdateSection(section.id, e.target.value)}
                className="flex-1 text-xl font-semibold px-3 py-1 border border-transparent hover:border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Section title..."
              />
              <button
                onClick={() => handleRemoveSection(section.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {section.questions.map((question, questionIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-3 mb-3">
                    <select
                      value={question.type}
                      onChange={(e) => handleUpdateQuestion(section.id, question.id, { type: e.target.value as QuestionType })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {QUESTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveQuestion(section.id, question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleUpdateQuestion(section.id, question.id, { question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                    placeholder="Enter your question..."
                  />

                  {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (one per line)
                      </label>
                      <textarea
                        value={question.options?.join('\n') || ''}
                        onChange={(e) => handleUpdateQuestion(section.id, question.id, {
                          options: e.target.value.split('\n').filter(o => o.trim())
                        })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  {question.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                        <input
                          type="number"
                          value={question.minValue || ''}
                          onChange={(e) => handleUpdateQuestion(section.id, question.id, {
                            minValue: e.target.value ? Number(e.target.value) : undefined
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                        <input
                          type="number"
                          value={question.maxValue || ''}
                          onChange={(e) => handleUpdateQuestion(section.id, question.id, {
                            maxValue: e.target.value ? Number(e.target.value) : undefined
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {(question.type === 'short-text' || question.type === 'long-text') && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                      <input
                        type="number"
                        value={question.maxLength || ''}
                        onChange={(e) => handleUpdateQuestion(section.id, question.id, {
                          maxLength: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => handleUpdateQuestion(section.id, question.id, { required: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>
                </div>
              ))}

              <button
                onClick={() => handleAddQuestion(section.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddSection}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          <Plus size={20} />
          Add Section
        </button>
      </div>
    </div>
  );
}
