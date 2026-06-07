import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Zap, MessageSquare, FileText, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Interview',
    desc: 'ResumePilot AI asks smart questions like a recruiter to gather your complete career story.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: TrendingUp,
    title: 'ATS Score Engine',
    desc: 'Get your ATS compatibility score with detailed keyword analysis and improvement tips.',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: FileText,
    title: 'Resume Generator',
    desc: 'Generate professional resumes using only your actual experience — no fabrication.',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  },
];

const steps = [
  { num: '01', title: 'Start AI Interview', desc: 'Answer conversational questions about your background' },
  { num: '02', title: 'Paste Job Description', desc: 'Let AI extract keywords and requirements' },
  { num: '03', title: 'Generate Resume', desc: 'Get an ATS-optimized resume in seconds' },
  { num: '04', title: 'Export & Apply', desc: 'Download PDF or DOCX and land your dream job' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">ResumePilot <span className="text-brand-600">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          Powered by Gemini AI
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          Build an ATS-Ready Resume
          <span className="text-brand-600 block">Through Conversation</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Skip the boring forms. ResumePilot AI interviews you like a recruiter, builds your complete profile, and generates a professional resume that passes ATS systems.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Free Interview
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          {['ATS Optimized', 'No Fake Data', 'PDF & DOCX Export', 'Versioning'].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything you need to land the job
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">How it works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="flex gap-4">
              <div className="text-4xl font-black text-brand-100 dark:text-brand-900 leading-none flex-shrink-0 w-12">{num}</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-brand-600 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to build your perfect resume?</h2>
        <p className="text-brand-100 mb-8">Join thousands of candidates who landed jobs with ResumePilot AI</p>
        <Link to="/register">
          <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Get Started — It's Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 ResumePilot AI. Built with Gemini AI + React + Node.js</p>
      </footer>
    </div>
  );
}
