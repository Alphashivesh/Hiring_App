import { supabase, Job, Candidate, TimelineEvent, Assessment, AssessmentResponse, CandidateNote } from './supabase';

const simulateNetworkDelay = () => {
  const delay = Math.floor(Math.random() * (1200 - 200 + 1)) + 200;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateError = () => {
  return Math.random() < 0.08;
};

export const jobsApi = {
  async getJobs(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    await simulateNetworkDelay();

    let query = supabase.from('jobs').select('*', { count: 'exact' });

    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const sortField = params.sort || 'order';
    query = query.order(sortField, { ascending: true });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as Job[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to create job');
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single();

    if (error) throw error;
    return data as Job;
  },

  async updateJob(id: string, updates: Partial<Job>) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to update job');
    }

    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Job;
  },

  async reorderJob(id: string, fromOrder: number, toOrder: number) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to reorder job');
    }

    const { data: jobs, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .order('order', { ascending: true });

    if (fetchError) throw fetchError;

    const jobsList = jobs as Job[];
    const movingJob = jobsList.find(j => j.id === id);
    if (!movingJob) throw new Error('Job not found');

    const updates: Array<{ id: string; order: number }> = [];

    if (fromOrder < toOrder) {
      jobsList.forEach(job => {
        if (job.id === id) {
          updates.push({ id: job.id, order: toOrder });
        } else if (job.order > fromOrder && job.order <= toOrder) {
          updates.push({ id: job.id, order: job.order - 1 });
        }
      });
    } else {
      jobsList.forEach(job => {
        if (job.id === id) {
          updates.push({ id: job.id, order: toOrder });
        } else if (job.order >= toOrder && job.order < fromOrder) {
          updates.push({ id: job.id, order: job.order + 1 });
        }
      });
    }

    for (const update of updates) {
      const { error } = await supabase
        .from('jobs')
        .update({ order: update.order })
        .eq('id', update.id);

      if (error) throw error;
    }

    return { success: true };
  },

  async getJobById(id: string) {
    await simulateNetworkDelay();

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Job | null;
  }
};

export const candidatesApi = {
  async getCandidates(params: {
    search?: string;
    stage?: string;
    page?: number;
    pageSize?: number;
  }) {
    await simulateNetworkDelay();

    let query = supabase.from('candidates').select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    if (params.stage) {
      query = query.eq('stage', params.stage);
    }

    query = query.order('created_at', { ascending: false });

    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as Candidate[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getCandidateById(id: string) {
    await simulateNetworkDelay();

    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Candidate | null;
  },

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to update candidate');
    }

    const oldCandidate = await this.getCandidateById(id);

    const { data, error } = await supabase
      .from('candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (updates.stage && oldCandidate && oldCandidate.stage !== updates.stage) {
      await supabase.from('candidate_timeline').insert([{
        candidate_id: id,
        from_stage: oldCandidate.stage,
        to_stage: updates.stage,
        notes: ''
      }]);
    }

    return data as Candidate;
  },

  async getCandidateTimeline(candidateId: string) {
    await simulateNetworkDelay();

    const { data, error } = await supabase
      .from('candidate_timeline')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TimelineEvent[];
  },

  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to create candidate');
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([candidate])
      .select()
      .single();

    if (error) throw error;

    await supabase.from('candidate_timeline').insert([{
      candidate_id: data.id,
      from_stage: null,
      to_stage: candidate.stage,
      notes: 'Candidate applied'
    }]);

    return data as Candidate;
  }
};

export const assessmentsApi = {
  async getAssessment(jobId: string) {
    await simulateNetworkDelay();

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) throw error;
    return data as Assessment | null;
  },

  async saveAssessment(assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to save assessment');
    }

    const existing = await this.getAssessment(assessment.job_id);

    if (existing) {
      const { data, error } = await supabase
        .from('assessments')
        .update({
          title: assessment.title,
          sections: assessment.sections,
          updated_at: new Date().toISOString()
        })
        .eq('job_id', assessment.job_id)
        .select()
        .single();

      if (error) throw error;
      return data as Assessment;
    } else {
      const { data, error } = await supabase
        .from('assessments')
        .insert([assessment])
        .select()
        .single();

      if (error) throw error;
      return data as Assessment;
    }
  },

  async submitAssessment(assessmentId: string, candidateId: string, responses: Record<string, any>) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to submit assessment');
    }

    const { data, error } = await supabase
      .from('assessment_responses')
      .upsert([{
        assessment_id: assessmentId,
        candidate_id: candidateId,
        responses,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as AssessmentResponse;
  },

  async getAssessmentResponse(assessmentId: string, candidateId: string) {
    await simulateNetworkDelay();

    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as AssessmentResponse | null;
  }
};

export const notesApi = {
  async getCandidateNotes(candidateId: string) {
    await simulateNetworkDelay();

    const { data, error } = await supabase
      .from('candidate_notes')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CandidateNote[];
  },

  async addNote(candidateId: string, content: string, mentions: string[]) {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Network error: Failed to add note');
    }

    const { data, error } = await supabase
      .from('candidate_notes')
      .insert([{ candidate_id: candidateId, content, mentions }])
      .select()
      .single();

    if (error) throw error;
    return data as CandidateNote;
  }
};
