import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Job = {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  job_id: string;
  created_at: string;
  updated_at: string;
};

export type TimelineEvent = {
  id: string;
  candidate_id: string;
  from_stage: string | null;
  to_stage: string;
  notes: string;
  created_at: string;
};

export type QuestionType = 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  required: boolean;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  conditionalOn?: {
    questionId: string;
    value: string | string[];
  };
};

export type AssessmentSection = {
  id: string;
  title: string;
  questions: Question[];
};

export type Assessment = {
  id: string;
  job_id: string;
  title: string;
  sections: AssessmentSection[];
  created_at: string;
  updated_at: string;
};

export type AssessmentResponse = {
  id: string;
  assessment_id: string;
  candidate_id: string;
  responses: Record<string, any>;
  submitted_at: string;
};

export type CandidateNote = {
  id: string;
  candidate_id: string;
  content: string;
  mentions: string[];
  created_at: string;
};
