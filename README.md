# 🎓 Scolara: Post-UTME Hub & Academic OS

Scolara is a comprehensive, modern educational platform designed specifically for Nigerian university aspirants preparing for their Post-UTME examinations. Built with an emphasis on premium aesthetics and high-performance, Scolara combines active study communities, AI-powered coaching, timed mock examinations, and curated resource libraries into one seamless interface.

## ✨ Key Features

- 📚 **Study Communities (Hubs)**: Join university-specific, tutor-led study groups. Collaborate with peers in real-time, share resources, and interact with verified tutors.
- 🤖 **Scolara AI Coach**: A Groq-powered intelligent tutor that generates customized study plans, explains complex UTME concepts simply, and analyzes your performance history to identify weak areas.
- ⚡ **Live Mock Examinations**: Take timed, full-length mock exams with instant grading, detailed explanations, and performance analytics to track your readiness.
- ⏱️ **Focus Mode (Last 24 Hours)**: A specialized dashboard for the day before the exam, featuring Pomodoro-style cram sprints, high-yield formula cheatsheets, and quick active-recall Q&A.
- 🎓 **Tutor Directory & Admin Panel**: A dedicated ecosystem for educators to manage study groups, upload resources, track student progress, and monetize their expertise securely via **Paystack**.
- 📊 **Advanced Dashboards**: Beautiful, dynamic visualizations of your academic progress, joined groups, and bookmarked materials.

## 🛠️ Technology Stack

Scolara is built with a modern, type-safe stack designed for speed and scalability:

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (for dynamic micro-animations), Lucide React (icons)
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Row-Level Security, Storage, Edge Functions)
- **AI Integration**: Groq API for ultra-fast, intelligent coaching responses
- **Payment Gateway**: Paystack (for secure group access fees)

## 🚀 Getting Started

To run the Scolara project locally, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project
- A Groq API key
- A Paystack developer account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/theFirstCodeManiac/scolara.git
   cd scolara
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Building for Production
To create a production-ready build, run:
```bash
npm run build
```

## 🔒 Security & Database
The platform relies heavily on **Supabase Row-Level Security (RLS)** to ensure that aspirant data, exam scores, and paid group materials are strictly protected. Database migrations and triggers handle automatic profile creation and member counting securely.

---
*Built with ❤️ for academic excellence.*
