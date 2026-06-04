import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Brain, BookOpen, Target, Sparkles, ChevronRight, ChevronLeft, ArrowRight, CheckCircle2, Users, Star, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const slides = [
  {
    id: 1,
    title: "Predict Your Exams",
    highlight: "Strategically",
    subtitle: "Scolara's AI Prediction Engine analyzes past data to give you the highest-probability topics before you step into the exam hall.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000",
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 2,
    title: "Learn with your",
    highlight: "AI Tutor",
    subtitle: "Stuck on a concept? Your personalized AI Tutor breaks down complex university topics into simple analogies and exam-focused summaries.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000",
    icon: <Brain className="w-6 h-6" />
  },
  {
    id: 3,
    title: "Access the Intelligent",
    highlight: "Marketplace",
    subtitle: "Don't waste time on irrelevant notes. Our AI scores academic resources based on how well they cover your specific syllabus.",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000",
    icon: <BookOpen className="w-6 h-6" />
  }
];

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [subMsg, setSubMsg] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubStatus('loading');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: subEmail.trim().toLowerCase() });
    if (error) {
      if (error.code === '23505') {
        setSubMsg('You are already subscribed! ✅');
        setSubStatus('success');
      } else {
        setSubMsg('Something went wrong. Please try again.');
        setSubStatus('error');
      }
    } else {
      setSubMsg('Subscribed successfully! 🎉');
      setSubStatus('success');
      setSubEmail('');
    }
    setTimeout(() => { setSubStatus('idle'); setSubMsg(''); }, 4000);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-neutral dark:bg-gray-900 text-text dark:text-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">
              S
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Scolara</span>
          </div>
          <nav className="hidden md:flex gap-8 font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/team" className="hover:text-primary transition-colors">Team</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle />
            <Link to="/auth/login">
              <Button variant="ghost" className="font-semibold text-sm sm:text-base px-3 sm:px-4">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button className="shadow-lg shadow-primary/20 text-sm sm:text-base px-3 sm:px-5">Get Started</Button>
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 py-6 space-y-4 font-medium flex flex-col"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-gray-100 dark:border-gray-800/40">Features</a>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-gray-100 dark:border-gray-800/40">About</Link>
              <Link to="/team" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-gray-100 dark:border-gray-800/40">Team</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2">Contact</Link>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <span className="text-sm text-gray-500">Theme:</span>
                <ThemeToggle />
              </div>
              <div className="flex gap-4 pt-2">
                <Link to="/auth/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full font-semibold">Sign In</Button>
                </Link>
                <Link to="/auth/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Carousel */}
      <main className="flex-grow pt-20">
        <div className="relative min-h-[90vh] md:h-[85vh] w-full overflow-hidden bg-gray-900 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slides[currentSlide].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent dark:from-gray-900 dark:via-gray-900/90" />
            </motion.div>
          </AnimatePresence>

          <div className="relative h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-16 md:py-0">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-medium text-xs sm:text-sm mb-6 sm:mb-8 border border-white/20">
                {slides[currentSlide].icon}
                <span>The AI Operating System for Academic Success</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 text-white leading-[1.15] md:leading-[1.1]">
                {slides[currentSlide].title} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-light to-accent">
                  {slides[currentSlide].highlight}
                </span>.
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mb-8 sm:mb-10 leading-relaxed">
                {slides[currentSlide].subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 group shadow-xl shadow-primary/30">
                    Start Your Journey
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white">
                    See How It Works
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Carousel Controls */}
          <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center z-20">
            <div className="flex gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-12 h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-primary' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={prevSlide} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextSlide} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Extended Sections */}
        <section id="features" className="py-24 bg-neutral dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Everything you need to <span className="text-primary">excel</span>.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Stop guessing what will be on the exam. Use data-driven insights to maximize your study efficiency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Target />, title: "Exam Prediction Engine", desc: "Upload past questions and let our AI predict likely exam topics with high probability.", color: "primary" },
                { icon: <Brain />, title: "AI Tutor & Explainer", desc: "Confused by a topic? Our AI tutor explains concepts using analogies or exam-focused summaries.", color: "accent" },
                { icon: <BookOpen />, title: "Intelligent Marketplace", desc: "Access high-performing academic resources rated by an AI coverage score.", color: "green-500" },
                { icon: <CheckCircle2 />, title: "Adaptive Study Plans", desc: "Generate realistic study schedules based on your weak points and available time.", color: "purple-500" },
                { icon: <Users />, title: "Class Intelligence", desc: "For class reps: identify at-risk students and commonly struggled topics instantly.", color: "blue-500" },
                { icon: <Sparkles />, title: "AI Question Solver", desc: "Paste any complex academic question and get a step-by-step, analytical breakdown.", color: "orange-500" }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:-translate-y-2 transition-transform duration-300">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${feature.color}/10 text-${feature.color}`}>
                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-7 h-7" })}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-900 dark:text-white">Trusted by top students across Nigeria</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Oluwaseun A.", uni: "University of Lagos", text: "The prediction engine is practically magic. It spotted exactly what came out in my PHY201 exam." },
                { name: "Chioma E.", uni: "University of Nigeria", text: "I used the AI Tutor to understand complex data structures. The analogy mode is a lifesaver." },
                { name: "Ibrahim M.", uni: "Ahmadu Bello University", text: "The adaptive study plan kept me on track. I went from struggling to a 4.5 GPA this semester." }
              ].map((testimonial, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-neutral dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-left relative">
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    <Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic mb-6">"{testimonial.text}"</p>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.uni}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white blur-[120px] rounded-full mix-blend-overlay"></div>
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-white blur-[120px] rounded-full mix-blend-overlay"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">Ready to boost your GPA?</h2>
            <p className="text-xl text-primary-light mb-10">Join thousands of students studying smarter, not harder.</p>
            <Link to="/auth/signup">
              <button className="inline-flex items-center gap-2 text-lg px-10 h-16 bg-white text-primary font-bold hover:bg-gray-50 shadow-2xl rounded-full transition-all hover:-translate-y-0.5 hover:shadow-3xl">
                Create Free Account
                <ArrowRight className="ml-1" size={20} />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer className="bg-gray-950 relative overflow-hidden">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-40 pointer-events-none" />
        {/* Glow blob */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Top section: stats ticker ── */}
          <div className="border-b border-gray-800/60 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '10,000+', label: 'Active Students', icon: '🎓' },
                { value: '95%', label: 'Prediction Accuracy', icon: '🎯' },
                { value: '50+', label: 'Nigerian Universities', icon: '🏛️' },
                { value: '1M+', label: 'Topics Analysed', icon: '🔬' },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="text-2xl font-extrabold text-white group-hover:text-primary transition-colors">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white text-xl shadow-lg shadow-primary/30">S</div>
                <div>
                  <span className="text-xl font-extrabold text-white">Scolara</span>
                  <span className="ml-2 text-[10px] bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-mono">OS v1.0</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                The AI-powered academic operating system built for Nigerian university students. Smarter studying, better grades.
              </p>
              {/* Mini contribution bar */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">Academic activity pulse</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const h = Math.random();
                    return (
                      <div
                        key={i}
                        className={`w-2 rounded-sm ${h < 0.3 ? 'bg-gray-800' : h < 0.6 ? 'bg-primary/30' : h < 0.85 ? 'bg-primary/60' : 'bg-primary'}`}
                        style={{ height: `${8 + h * 24}px` }}
                      />
                    );
                  })}
                </div>
              </div>
              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { href: 'https://github.com', label: 'GitHub', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
                  { href: 'https://twitter.com', label: 'Twitter', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { href: 'https://linkedin.com', label: 'LinkedIn', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-center text-gray-500 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Exam Predictions', href: '/auth/signup' },
                  { label: 'AI Tutor', href: '/auth/signup' },
                  { label: 'Study Plans', href: '/auth/signup' },
                  { label: 'Focus Mode', href: '/auth/signup' },
                  { label: 'Marketplace', href: '/auth/signup' },
                  { label: 'Social Feed', href: '/auth/signup' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-gray-500 hover:text-white hover:translate-x-1 inline-flex transition-all duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Meet the Team', href: '/team' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookie-policy' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-gray-500 hover:text-white hover:translate-x-1 inline-flex transition-all duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter CTA column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stay Updated</h4>
              <p className="text-sm text-gray-500">Get exam tips and Scolara updates delivered to your inbox.</p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={subStatus === 'loading' || subStatus === 'success'}
                  className="w-full px-3 py-2.5 text-sm bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading' || subStatus === 'success' || !subEmail}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {subStatus === 'loading' ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Subscribing...</>
                  ) : subStatus === 'success' ? (
                    '✅ Subscribed!'
                  ) : (
                    'Subscribe →'
                  )}
                </button>
                {subMsg && (
                  <p className={`text-xs font-medium ${subStatus === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {subMsg}
                  </p>
                )}
              </form>
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                No spam. Unsubscribe any time.
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="border-t border-gray-800/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} <span className="text-gray-500 font-semibold">Scolara Academic OS</span>. Built with ❤️ for Nigerian students.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-700">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                All systems operational
              </span>
              <span className="text-gray-800">|</span>
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
