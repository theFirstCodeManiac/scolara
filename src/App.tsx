import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Team } from './pages/public/Team';
import { Contact } from './pages/public/Contact';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { TermsOfService } from './pages/public/TermsOfService';
import { CookiePolicy } from './pages/public/CookiePolicy';
import { useHub } from './context/HubContext';

// Lazy load dashboard components
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const TopicRanking = React.lazy(() => import('./pages/dashboard/TopicRanking').then(m => ({ default: m.TopicRanking })));
const Predictions = React.lazy(() => import('./pages/dashboard/Predictions').then(m => ({ default: m.Predictions })));
const StudyPlan = React.lazy(() => import('./pages/dashboard/StudyPlan').then(m => ({ default: m.StudyPlan })));
const AiTutor = React.lazy(() => import('./pages/dashboard/AiTutor').then(m => ({ default: m.AiTutor })));
const Marketplace = React.lazy(() => import('./pages/dashboard/Marketplace').then(m => ({ default: m.Marketplace })));
const QuestionSolver = React.lazy(() => import('./pages/dashboard/QuestionSolver').then(m => ({ default: m.QuestionSolver })));
const ClassIntelligence = React.lazy(() => import('./pages/dashboard/ClassIntelligence').then(m => ({ default: m.ClassIntelligence })));
const FocusMode = React.lazy(() => import('./pages/dashboard/FocusMode').then(m => ({ default: m.FocusMode })));
const LibraryPage = React.lazy(() => import('./pages/dashboard/Library').then(m => ({ default: m.Library })));
const MessagesPage = React.lazy(() => import('./pages/dashboard/Messages').then(m => ({ default: m.Messages })));
const Progress = React.lazy(() => import('./pages/dashboard/Progress').then(m => ({ default: m.Progress })));
const FeedPage = React.lazy(() => import('./pages/dashboard/Feed').then(m => ({ default: m.Feed })));
const NewsletterAdmin = React.lazy(() => import('./pages/dashboard/NewsletterAdmin').then(m => ({ default: m.NewsletterAdmin })));
const Last24Hours = React.lazy(() => import('./pages/dashboard/Last24Hours').then(m => ({ default: m.Last24Hours })));

// Lazy load Post-UTME Hub components
const HubLayout = React.lazy(() => import('./components/hub/HubLayout').then(m => ({ default: m.HubLayout })));
const HubHome = React.lazy(() => import('./pages/hub/HubHome').then(m => ({ default: m.HubHome })));
const HubAuth = React.lazy(() => import('./pages/hub/HubAuth').then(m => ({ default: m.HubAuth })));
const TutorDirectory = React.lazy(() => import('./pages/hub/TutorDirectory').then(m => ({ default: m.TutorDirectory })));
const TutorProfile = React.lazy(() => import('./pages/hub/TutorProfile').then(m => ({ default: m.TutorProfile })));
const GroupsExplore = React.lazy(() => import('./pages/hub/GroupsExplore').then(m => ({ default: m.GroupsExplore })));
const GroupDetail = React.lazy(() => import('./pages/hub/GroupDetail').then(m => ({ default: m.GroupDetail })));
const ExamRoom = React.lazy(() => import('./pages/hub/ExamRoom').then(m => ({ default: m.ExamRoom })));
const ExamResults = React.lazy(() => import('./pages/hub/ExamResults').then(m => ({ default: m.ExamResults })));
const HubAI = React.lazy(() => import('./pages/hub/HubAI').then(m => ({ default: m.HubAI })));
const NotificationsPage = React.lazy(() => import('./pages/hub/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const DirectMessages = React.lazy(() => import('./pages/hub/DirectMessages').then(m => ({ default: m.DirectMessages })));
const StudentDashboard = React.lazy(() => import('./pages/hub/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const TutorPanel = React.lazy(() => import('./pages/hub/TutorPanel').then(m => ({ default: m.TutorPanel })));
const HubAdminPanel = React.lazy(() => import('./pages/hub/HubAdminPanel').then(m => ({ default: m.HubAdminPanel })));

const ProfileDispatcher = () => {
  const { hubUser } = useHub();
  if (hubUser?.role === 'hub_tutor') {
    return <TutorPanel />;
  }
  return <StudentDashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div className="min-h-screen bg-neutral dark:bg-gray-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="topics" element={<TopicRanking />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="plan" element={<StudyPlan />} />
            <Route path="tutor" element={<AiTutor />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="solver" element={<QuestionSolver />} />
            <Route path="class" element={<ClassIntelligence />} />
            <Route path="focus" element={<FocusMode />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="progress" element={<Progress />} />
            <Route path="newsletter" element={<NewsletterAdmin />} />
            <Route path="last24" element={<Last24Hours />} />
          </Route>

          {/* Post-UTME Hub Routes */}
          <Route path="/hub" element={<HubLayout />}>
            <Route index element={<HubHome />} />
            <Route path="login" element={<HubAuth />} />
            <Route path="register" element={<HubAuth />} />
            <Route path="tutors" element={<TutorDirectory />} />
            <Route path="tutors/:tutorId" element={<TutorProfile />} />
            <Route path="groups" element={<GroupsExplore />} />
            <Route path="groups/:id" element={<GroupDetail />} />
            <Route path="exam/:examId/results" element={<ExamResults />} />
            <Route path="ai" element={<HubAI />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<DirectMessages />} />
            <Route path="student" element={<StudentDashboard />} />
            <Route path="profile" element={<ProfileDispatcher />} />
            <Route path="tutor-panel" element={<TutorPanel />} />
            <Route path="admin" element={<HubAdminPanel />} />
          </Route>

          {/* Distraction-Free Full-Screen Exam Room */}
          <Route path="/hub/exam/:examId" element={<ExamRoom />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
