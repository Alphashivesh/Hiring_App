# 🌟 **TalentFlow – Mini Hiring Platform**

🚀 A comprehensive **React-based hiring platform** that enables HR teams to manage jobs, candidates, and assessments with an intuitive, modern interface.  

### 🌐 [**Live Demo**](https://hiring-app-ji57.vercel.app/)

---

## ✨ **Features Overview**

### 🧩 1. **Jobs Board**
- 🛠️ **CRUD Operations** – Create, edit, and archive jobs  
- 📜 **Server-like Pagination** – Smooth navigation with paginated results  
- 🔍 **Advanced Filtering** – Filter by title (search) & status (active/archived)  
- 🎯 **Drag-and-Drop Reordering** – Reorder jobs with visual feedback + optimistic updates  
- 🔄 **Rollback on Failure** – Auto-rollback if reordering fails (simulated 8% error rate)  
- 🔗 **Deep Linking** – Access jobs directly via `/jobs/:jobId` (from assessment builder)  
- ✅ **Validation** – Title required + unique slug validation  

---

### 👥 2. **Candidates Management**
- ⚡ **Virtualized List** – Efficiently render 1000+ candidates with smooth scrolling  
- 🔎 **Client-side Search** – Real-time search by name or email  
- 🧮 **Server-like Filtering** – Filter candidates by current stage  
- 🧑‍💼 **Candidate Profile** – Detailed view at `/candidates/:id` featuring:
  - ⏳ Status change timeline  
  - 📝 Notes with `@mentions` support  
  - 🔁 Stage transition history  
- 🗂️ **Kanban Board** – Drag & drop candidates across 6 stages  
- 🎯 **Stage Management** – Applied → Screen → Tech → Offer → Hired → Rejected  

---

### 🧠 3. **Assessment Builder**
- 🧾 **Per-Job Assessments** – Create custom assessments per job  
- 🔘 **Multiple Question Types**:
  - Single Choice ✅  
  - Multiple Choice ☑️  
  - Short Text ✍️  
  - Long Text 🧾  
  - Numeric 🔢  
  - File Upload 📎 *(UI stub)*  
- 📚 **Section Organization** – Group questions into logical sections  
- 👀 **Live Preview** – Real-time preview of assessments  
- 🧩 **Validation Rules** – Required fields, numeric ranges, max length  
- 🔄 **Conditional Questions** – Show/hide based on previous answers  
- 💾 **Persistent State** – Saved directly to **Supabase** database  

---

## ⚙️ **Technical Architecture**

### 💻 **Frontend Stack**
- ⚛️ React 18 + TypeScript  
- 🧭 React Router  
- 🎨 Tailwind CSS  
- 🪶 Lucide React (icons)  
- ⚡ Vite for build tooling  

### 🗄️ **Backend & Database**
- 🧰 **Supabase (PostgreSQL)** for persistence  
- 🔐 **Row Level Security (RLS)** enabled  
- 🔴 Real-time data + optimistic updates  

### 🧠 **State Management**
- `useState` / `useEffect` (no external state libs)  
- Local component state  

### 🌐 **API Layer**
- Simulated network with:
  - ⏱️ Latency: 200–1200ms  
  - ⚠️ 8% error rate  
  - 💬 Automatic error handling & user feedback  

---

## 🧾 **Database Schema**

| Table | Columns |
|--------|----------|
| **Jobs** | id, title, slug, status, tags, order, description, timestamps |
| **Candidates** | id, name, email, stage, job_id, timestamps |
| **Candidate Timeline** | id, candidate_id, from_stage, to_stage, notes, created_at |
| **Assessments** | id, job_id, title, sections (JSONB), timestamps |
| **Assessment Responses** | id, assessment_id, candidate_id, responses (JSONB), submitted_at |
| **Candidate Notes** | id, candidate_id, content, mentions, created_at |

---

## 🧰 **Setup Instructions**

1. **Clone the repository**
```bash
git clone <repository-url>
cd talentflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
The `.env` file should contain:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## Data Seeding

The application automatically seeds the database on first load with:
- 25 jobs (mixed active and archived statuses)
- 1000 candidates distributed across jobs and stages
- 3 sample assessments with 10+ questions each

Data is persisted in Supabase and will be available on subsequent visits.

## Key Implementation Details

### Custom Virtualization
The candidates list implements a custom virtualization solution to efficiently render 1000+ items:
- Only renders visible items plus buffer
- Smooth scrolling performance
- Dynamic height calculation
- No external virtualization library required

### Drag-and-Drop
Native HTML5 drag-and-drop API with:
- Visual feedback during drag
- Optimistic UI updates
- Automatic rollback on server errors
- Works for both job reordering and candidate stage changes

### Assessment Conditional Logic
Questions can be conditionally shown based on previous answers:
- Single value conditions (e.g., show if Q1 === "Yes")
- Multiple value conditions (e.g., show if Q2 includes ["Option A", "Option B"])
- Real-time preview updates as responses change

### Error Handling
Comprehensive error handling throughout:
- Network errors with user-friendly messages
- Validation errors with inline feedback
- Automatic retry suggestions
- Graceful degradation

## Project Structure

```
src/
├── components/
│   ├── JobsBoard.tsx           # Jobs listing with pagination
│   ├── JobModal.tsx            # Job create/edit modal
│   ├── CandidatesList.tsx      # Virtualized candidates list
│   ├── CandidateProfile.tsx    # Candidate detail view
│   ├── KanbanBoard.tsx         # Drag-and-drop kanban
│   ├── AssessmentBuilder.tsx   # Assessment creation tool
│   └── AssessmentPreview.tsx   # Live preview & runtime form
├── lib/
│   ├── supabase.ts             # Supabase client & types
│   ├── api.ts                  # API layer with simulation
│   └── seed.ts                 # Database seeding script
├── App.tsx                     # Main app with routing
└── main.tsx                    # Entry point
```

## Notable Features

### Optimistic Updates
The application implements optimistic updates for better UX:
- Job reordering updates UI immediately
- Candidate stage changes reflect instantly
- Automatic rollback if server operation fails

### Search & Filtering
- **Jobs**: Server-side pagination with search and status filter
- **Candidates**: Client-side search (name/email) + server-side stage filter
- Debounced search for better performance

### Responsive Design
- Mobile-friendly layouts
- Responsive navigation
- Touch-friendly drag-and-drop
- Adaptive component sizing

### Data Validation
- Job title required, unique slug validation
- Assessment question validation (required, ranges, lengths)
- Form validation with inline error messages
- Type-safe with TypeScript

## Technical Decisions

### Why Supabase?
- PostgreSQL provides robust relational data structure
- RLS ensures data security even without authentication
- Real-time capabilities for future enhancements
- Easy deployment and scaling

### Why Custom Virtualization?
- Full control over rendering logic
- No additional dependencies
- Optimized for our specific use case
- Learning opportunity

### Why Native Drag-and-Drop?
- Browser-native API is performant
- No external library needed
- Better accessibility
- Standard HTML5 implementation

### State Management Choice
- Component-level state sufficient for this scope
- React hooks provide clean state management
- No global state complexity needed
- Easy to understand and maintain

## Known Issues & Future Enhancements

### Current Limitations
- File upload is UI stub only (no actual upload)
- No authentication (public access for demo)
- Limited assessment response viewing
- No bulk operations

### Potential Improvements
- Add authentication system
- Implement file upload to Supabase Storage
- Add candidate comparison view
- Export data to CSV/PDF
- Email notifications for stage changes
- Advanced analytics dashboard
- Team collaboration features
- Interview scheduling integration

## Performance Considerations

- Custom virtualization handles 10,000+ candidates efficiently
- Optimistic updates reduce perceived latency
- Pagination prevents loading too much data
- JSONB fields in Postgres allow flexible schema
- Indexes on frequently queried columns

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Contributing

This is a technical assessment project. For questions or issues, please contact the development team.

---

Built with React, TypeScript, Tailwind CSS, and Supabase.
