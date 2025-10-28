# 🌟 **TalentFlow – Mini Hiring Platform**

🚀 A comprehensive **React-based hiring platform** that enables HR teams to manage jobs, candidates, and assessments with an intuitive, modern interface.  

---

## 🏷️ **Tech Stack & Badges**

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white" alt="React Badge" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript Badge" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS Badge" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white" alt="Supabase Badge" />
  <img src="https://img.shields.io/badge/Vite-Build Tool-646CFF?logo=vite&logoColor=white" alt="Vite Badge" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License Badge" />
</p>

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

## 🌱 **Data Seeding**

Automatically seeds on first load with:  

- 🌟 **25 jobs** (active + archived)  
- 👤 **1000 candidates** across stages  
- 🧩 **3 sample assessments** (10+ questions each)  

Data persists in **Supabase** for future sessions.  

---

## 🔍 **Key Implementation Details**

### ⚡ **Custom Virtualization**
- Only visible + buffer items rendered  
- Smooth performance for 1000+ entries  
- Dynamic height + custom scroll logic  

### 🖱️ **Drag-and-Drop**
- Native HTML5 API  
- 🪄 Visual feedback  
- ⚡ Optimistic updates  
- 🔙 Auto rollback on server error  

### 🎯 **Conditional Logic**
- Show/hide questions dynamically  
- Single or multi-value conditions  
- Real-time updates in preview  

### 🚨 **Error Handling**
- Friendly error messages  
- Inline validation feedback  
- Retry suggestions  
- Graceful degradation  

---

## 🗂️ **Project Structure**

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

## 🌟 **Notable Features**

### ⚡ **Optimistic Updates**
The application implements **optimistic UI updates** for a smoother and faster user experience:
- 🔄 Job reordering updates the UI **instantly**  
- 🧩 Candidate stage changes reflect **in real time**  
- 🛠️ Automatic **rollback** if the server operation fails  

---

### 🔍 **Search & Filtering**
Powerful filtering and search for both jobs and candidates:  
- **Jobs**: Server-side pagination with **search** and **status filters**  
- **Candidates**: Client-side **search (name/email)** + server-side **stage filtering**  
- 🕒 **Debounced search** for improved performance and reduced re-renders  

---

### 📱 **Responsive Design**
Fully responsive and mobile-friendly layouts:
- 📲 Adaptive layouts for all screen sizes  
- 🧭 Responsive navigation and content panels  
- 🤏 Touch-friendly drag-and-drop interactions  
- ⚙️ Smart component scaling for better UX  

---

### 🧾 **Data Validation**
Comprehensive validation ensures data integrity and type safety:
- ✅ Job title required + unique slug validation  
- 🧮 Assessment question validation (required fields, numeric ranges, and text limits)  
- 🧠 Inline form validation with user-friendly error messages  
- 🧩 Fully **type-safe with TypeScript**  

---

## 🧭 **Technical Decisions**

### 🧱 **Why Supabase?**
- 🧰 PostgreSQL provides a robust and relational data structure  
- 🔐 **Row-Level Security (RLS)** ensures safety even without authentication  
- ⚡ Real-time capabilities enable live updates and future scalability  
- ☁️ Easy deployment, scaling, and developer experience  

---

### 🧮 **Why Custom Virtualization?**
- 🧠 Provides **full control** over rendering logic  
- 🚀 Avoids unnecessary dependencies  
- ⚙️ Optimized specifically for our use case (10K+ candidates)  
- 🎓 Offers great **learning and performance tuning** opportunities  

---

### 🖱️ **Why Native Drag-and-Drop?**
- 🧩 Uses browser-native **HTML5 API** for high performance  
- 📦 No need for third-party libraries  
- 🧍‍♀️ Improves **accessibility** and native feel  
- 🌍 Ensures consistent **cross-browser behavior**  

---

### ⚛️ **State Management Choice**
- 🧠 Component-level state is **sufficient** for this app’s scope  
- 🪝 Utilizes **React Hooks (useState, useEffect)** for clean state handling  
- ❌ No global state complexity or external libraries needed  
- 💡 Simple, maintainable, and beginner-friendly architecture  

---

## 🚧 **Known Issues & Future Enhancements**

### 🐞 **Current Limitations**
- 📎 File upload is currently a **UI stub** (not functional)  
- 🚫 No authentication system (public demo access only)  
- 👁️ Limited viewing options for assessment responses  
- 📦 No support for bulk operations  

---

### 💡 **Potential Improvements**
Future enhancements and roadmap ideas:  
- 🔐 Add **authentication system** with role-based access  
- ☁️ Implement **file upload** via Supabase Storage  
- ⚖️ Add **candidate comparison** feature  
- 📤 Enable **data export (CSV/PDF)**  
- 📩 Set up **email notifications** for stage changes  
- 📊 Build an **advanced analytics dashboard**  
- 🤝 Introduce **team collaboration** and multi-user features  
- 📅 Integrate **interview scheduling** tools  

---

## ⚡ **Performance Considerations**

Performance and scalability optimizations include:
- 🧮 Custom **virtualization** efficiently handles **10,000+ candidates**  
- 💨 **Optimistic updates** minimize perceived latency  
- 📄 **Pagination** limits data fetching for smoother navigation  
- 🧠 Use of **JSONB fields** in PostgreSQL for flexible schemas  
- 🔍 Indexes added on frequently queried columns for faster lookups  

---

## 🌍 **Browser Support**

The platform supports all major modern browsers:

| Browser | Version |
|----------|----------|
| ✅ **Chrome** | 90+ |
| ✅ **Firefox** | 88+ |
| ✅ **Safari** | 14+ |
| ✅ **Edge** | 90+ |

---

## 📜 **License**

This project is licensed under the **MIT License**.  
You’re free to use, modify, and distribute it for personal or commercial projects.  

---

## 🧪 **Development**

### 🧩 Run Tests

```bash
npm run test
```

### ✅ Type Checking
```bash
npm run typecheck
```

### 🧹 Linting
```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Contact

Shivesh Kumar - [📧](shiveshkumar73520@gmail.com)

---

Built with React, TypeScript, Tailwind CSS, and Supabase.
