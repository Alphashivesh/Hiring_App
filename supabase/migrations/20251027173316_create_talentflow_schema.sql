/*
  # TalentFlow Platform Schema

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique, required)
      - `status` (text, default 'active')
      - `tags` (text array)
      - `order` (integer, for drag-drop ordering)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `candidates`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, unique, required)
      - `stage` (text, default 'applied')
      - `job_id` (uuid, foreign key to jobs)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `candidate_timeline`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, foreign key to candidates)
      - `from_stage` (text)
      - `to_stage` (text, required)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `assessments`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs, unique)
      - `title` (text, required)
      - `sections` (jsonb, stores assessment structure)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `assessment_responses`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, foreign key to assessments)
      - `candidate_id` (uuid, foreign key to candidates)
      - `responses` (jsonb, stores answers)
      - `submitted_at` (timestamptz)
    
    - `candidate_notes`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, foreign key to candidates)
      - `content` (text, required)
      - `mentions` (text array)
      - `created_at` (timestamptz)

  2. Indexes
    - Add indexes for common query patterns
*/

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  tags text[] DEFAULT '{}',
  "order" integer NOT NULL DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  stage text DEFAULT 'applied' CHECK (stage IN ('applied', 'screen', 'tech', 'offer', 'hired', 'rejected')),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidate timeline table
CREATE TABLE IF NOT EXISTS candidate_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  sections jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessment responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  responses jsonb DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, candidate_id)
);

-- Candidate notes table
CREATE TABLE IF NOT EXISTS candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  content text NOT NULL,
  mentions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_order ON jobs("order");
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidate_timeline_candidate_id ON candidate_timeline(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_candidate ON assessment_responses(candidate_id);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;

-- Create public access policies (demo app, no auth)
CREATE POLICY "Public read access for jobs"
  ON jobs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public write access for jobs"
  ON jobs FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for candidates"
  ON candidates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public write access for candidates"
  ON candidates FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for candidate_timeline"
  ON candidate_timeline FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public write access for candidate_timeline"
  ON candidate_timeline FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for assessments"
  ON assessments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public write access for assessments"
  ON assessments FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for assessment_responses"
  ON assessment_responses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public write access for assessment_responses"
  ON assessment_responses FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for candidate_notes"
  ON candidate_notes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public write access for candidate_notes"
  ON candidate_notes FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);