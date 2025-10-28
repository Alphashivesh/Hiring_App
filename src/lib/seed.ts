import { supabase } from './supabase';

const JOB_TITLES = [
  'Senior Frontend Engineer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Mobile Developer',
  'Security Engineer',
  'QA Engineer',
  'Technical Writer',
  'Sales Engineer',
  'Customer Success Manager',
  'Marketing Manager',
  'Business Analyst',
  'Project Manager',
  'Software Architect',
  'Site Reliability Engineer',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Database Administrator',
  'Frontend Developer',
  'iOS Developer',
  'Android Developer',
  'Systems Engineer'
];

const TAGS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
  'Kubernetes', 'Remote', 'Full-time', 'Part-time', 'Contract', 'Senior',
  'Junior', 'Mid-level', 'Tech Lead', 'Manager', 'Director'
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Arjun', 'Asha', 'Amit', 'Anjali', 'Anand',
  'Bhavna', 'Bharat', 'Brijesh', 'Deepak', 'Divya', 'Dev', 'Deepika',
  'Ganesh', 'Gauri', 'Gopal', 'Gayatri', 'Harish', 'Hema',
  'Ishan', 'Indu', 'Jay', 'Jyoti', 'Karan', 'Kavita', 'Krishna',
  'Kiran', 'Lalit', 'Lakshmi', 'Mahesh', 'Meera', 'Manoj', 'Maya',
  'Nikhil', 'Neha', 'Naveen', 'Nisha', 'Om', 'Prakash', 'Pooja',
  'Pranav', 'Priya', 'Rahul', 'Radha', 'Rohan', 'Ritu', 'Rajesh',
  'Rekha', 'Sanjay', 'Sita', 'Sunil', 'Sunita', 'Suresh', 'Shreya',
  'Vikram', 'Vidya'
];

const LAST_NAMES = [
  'Singh', 'Kumar', 'Patel', 'Sharma', 'Shah', 'Gupta', 'Khan', 'Verma',
  'Yadav', 'Jain', 'Mehta', 'Reddy', 'Rao', 'Mishra', 'Kapoor',
  'Jha', 'Thakur', 'Desai', 'Naidu', 'Chauhan', 'Nair', 'Malhotra',
  'Menon', 'Joshi', 'Pandey', 'Aggarwal', 'Das', 'Kaur', 'Goyal',
  'Bose', 'Chopra', 'Rathore', 'Sinha', 'Trivedi', 'Saxena',
  'Agrawal', 'Biswas', 'Choudhury', 'Iyer', 'Murthy', 'Pawar',
  'Rajput', 'Sethi', 'Srivastava', 'Varma', 'Venkat', 'Bhatia',
  'Chavan', 'Dubey', 'Kulkarni'
];

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

const getRandomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export async function reseedCandidates() {
  try {
    console.log('Re-seeding candidates...');

    const { data: existingJobs } = await supabase.from('jobs').select('id');

    if (!existingJobs || existingJobs.length === 0) {
      console.error('No jobs found. Please seed jobs first.');
      return;
    }

    const candidates = [];
    const batchSize = 100;

    for (let i = 0; i < 1000; i++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
      const job = getRandomItem(existingJobs);
      const stage = getRandomItem(STAGES);

      candidates.push({
        name,
        email,
        job_id: job.id,
        stage
      });

      if (candidates.length === batchSize) {
        const { error } = await supabase.from('candidates').insert(candidates);
        if (error) throw error;
        console.log(`Seeded ${i + 1} candidates...`);
        candidates.length = 0;
      }
    }

    if (candidates.length > 0) {
      const { error } = await supabase.from('candidates').insert(candidates);
      if (error) throw error;
    }

    console.log('Re-seeded 1000 candidates successfully!');
  } catch (error) {
    console.error('Error re-seeding candidates:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    const { data: existingJobs } = await supabase.from('jobs').select('id');
    if (existingJobs && existingJobs.length > 0) {
      console.log('Jobs already exist, checking candidates...');
      const { data: existingCandidates } = await supabase.from('candidates').select('id');

      if (!existingCandidates || existingCandidates.length === 0) {
        console.log('No candidates found, seeding candidates...');
        await reseedCandidates();
      } else {
        console.log('Database already seeded');
      }
      return;
    }

    console.log('Seeding jobs...');
    const jobs = [];
    for (let i = 0; i < 25; i++) {
      const title = JOB_TITLES[i];
      const status = Math.random() > 0.3 ? 'active' : 'archived';
      const tagCount = Math.floor(Math.random() * 4) + 2;
      const tags = getRandomItems(TAGS, tagCount);

      jobs.push({
        title,
        slug: generateSlug(title),
        status,
        tags,
        order: i,
        description: `Looking for an experienced ${title} to join our team.`
      });
    }

    const { data: insertedJobs, error: jobsError } = await supabase
      .from('jobs')
      .insert(jobs)
      .select();

    if (jobsError) throw jobsError;
    console.log(`Seeded ${insertedJobs?.length} jobs`);

    console.log('Seeding candidates...');
    const candidates = [];
    const batchSize = 100;

    for (let i = 0; i < 1000; i++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
      const job = getRandomItem(insertedJobs!);
      const stage = getRandomItem(STAGES);

      candidates.push({
        name,
        email,
        job_id: job.id,
        stage
      });

      if (candidates.length === batchSize) {
        const { error } = await supabase.from('candidates').insert(candidates);
        if (error) throw error;
        console.log(`Seeded ${i + 1} candidates...`);
        candidates.length = 0;
      }
    }

    if (candidates.length > 0) {
      const { error } = await supabase.from('candidates').insert(candidates);
      if (error) throw error;
    }

    console.log('Seeded 1000 candidates');

    console.log('Creating sample assessments...');
    const assessmentJobs = getRandomItems(insertedJobs!, 3);

    for (const job of assessmentJobs) {
      const assessment = {
        job_id: job.id,
        title: `${job.title} Assessment`,
        sections: [
          {
            id: crypto.randomUUID(),
            title: 'Technical Skills',
            questions: [
              {
                id: crypto.randomUUID(),
                type: 'single-choice',
                question: 'How many years of experience do you have?',
                required: true,
                options: ['0-1 years', '1-3 years', '3-5 years', '5+ years']
              },
              {
                id: crypto.randomUUID(),
                type: 'multi-choice',
                question: 'Which technologies are you proficient in?',
                required: true,
                options: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java']
              },
              {
                id: crypto.randomUUID(),
                type: 'numeric',
                question: 'Rate your overall technical skills (1-10)',
                required: true,
                minValue: 1,
                maxValue: 10
              }
            ]
          },
          {
            id: crypto.randomUUID(),
            title: 'Experience',
            questions: [
              {
                id: crypto.randomUUID(),
                type: 'long-text',
                question: 'Describe your most challenging project',
                required: true,
                maxLength: 1000
              },
              {
                id: crypto.randomUUID(),
                type: 'short-text',
                question: 'What is your current/most recent job title?',
                required: false,
                maxLength: 100
              }
            ]
          },
          {
            id: crypto.randomUUID(),
            title: 'Additional Information',
            questions: [
              {
                id: crypto.randomUUID(),
                type: 'single-choice',
                question: 'Are you available for remote work?',
                required: true,
                options: ['Yes', 'No', 'Hybrid']
              },
              {
                id: crypto.randomUUID(),
                type: 'numeric',
                question: 'Expected salary (in thousands)',
                required: false,
                minValue: 50,
                maxValue: 300
              },
              {
                id: crypto.randomUUID(),
                type: 'file-upload',
                question: 'Upload your resume',
                required: false
              }
            ]
          }
        ]
      };

      const { error } = await supabase.from('assessments').insert([assessment]);
      if (error) throw error;
    }

    console.log('Created 3 sample assessments');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
