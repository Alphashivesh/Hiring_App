import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Assessment, Question } from '../lib/supabase';

interface AssessmentPreviewProps {
  assessment: Assessment;
  onClose: () => void;
  onSubmit?: (responses: Record<string, any>) => Promise<void>;
  readOnly?: boolean;
}

export default function AssessmentPreview({
  assessment,
  onClose,
  onSubmit,
  readOnly = true
}: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalOn) return true;

    const { questionId, value } = question.conditionalOn;
    const response = responses[questionId];

    if (Array.isArray(value)) {
      return Array.isArray(response) && value.some(v => response.includes(v));
    }

    return response === value;
  };

  const validateResponses = () => {
    const newErrors: Record<string, string> = {};

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (!shouldShowQuestion(question)) return;

        const response = responses[question.id];

        if (question.required && (!response || (Array.isArray(response) && response.length === 0))) {
          newErrors[question.id] = 'This field is required';
        }

        if (question.type === 'numeric' && response !== undefined && response !== '') {
          const numValue = Number(response);
          if (question.minValue !== undefined && numValue < question.minValue) {
            newErrors[question.id] = `Value must be at least ${question.minValue}`;
          }
          if (question.maxValue !== undefined && numValue > question.maxValue) {
            newErrors[question.id] = `Value must be at most ${question.maxValue}`;
          }
        }

        if ((question.type === 'short-text' || question.type === 'long-text') && response && question.maxLength) {
          if (response.length > question.maxLength) {
            newErrors[question.id] = `Maximum ${question.maxLength} characters allowed`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateResponses() || !onSubmit) return;

    try {
      setSubmitting(true);
      await onSubmit(responses);
      onClose();
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    if (!shouldShowQuestion(question)) return null;

    const hasError = !!errors[question.id];

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                  disabled={readOnly}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = responses[question.id] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((o: string) => o !== option);
                    setResponses({ ...responses, [question.id]: updated });
                  }}
                  disabled={readOnly}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'short-text':
        return (
          <input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            disabled={readOnly}
            maxLength={question.maxLength}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your answer..."
          />
        );

      case 'long-text':
        return (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            disabled={readOnly}
            maxLength={question.maxLength}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your answer..."
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            disabled={readOnly}
            min={question.minValue}
            max={question.maxValue}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter a number..."
          />
        );

      case 'file-upload':
        return (
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            hasError ? 'border-red-500' : 'border-gray-300'
          }`}>
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600">
              {readOnly ? 'File upload (preview only)' : 'Click or drag file to upload'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{assessment.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-8">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
                <div className="space-y-6">
                  {section.questions.map((question, questionIndex) => {
                    if (!shouldShowQuestion(question)) return null;

                    return (
                      <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <label className="block text-gray-900 font-medium mb-3">
                          {sectionIndex + 1}.{questionIndex + 1} {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderQuestion(question)}
                        {errors[question.id] && (
                          <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
                        )}
                        {question.maxLength && (question.type === 'short-text' || question.type === 'long-text') && (
                          <p className="mt-1 text-xs text-gray-500">
                            {responses[question.id]?.length || 0} / {question.maxLength}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && onSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
