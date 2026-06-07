import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { resumeApi } from '../api/resume.api';
import { profileApi } from '../api/profile.api';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FileText, MessageSquare, Search, TrendingUp, Download, Eye, Plus, ArrowRight, Zap } from 'lucide-react';
import { Resume } from '../types';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const topATS = resume.atsReports?.[0];
  const atsScore = topATS?.overallScore;

  const scoreVariant = atsScore
    ? atsScore >= 80 ? 'success' : atsScore >= 60 ? 'warning' : 'danger'
    : 'default';

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{resume.title}</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '} v{resume.version}
          </p>
          <div className="flex items-center gap-3">
            {atsScore !== undefined && (
              <Badge variant={scoreVariant}>ATS: {atsScore}%</Badge>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Eye className="w-3 h-3" /> {resume.views}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Download className="w-3 h-3" /> {resume.downloads}
            </span>
          </div>
        </div>
        <Link to={`/resumes/${resume.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.getAll(),
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
  });

  const resumes = resumesData?.data || [];
  const profile = profileData?.data;

  const totalViews = resumes.reduce((acc, r) => acc + r.views, 0);
  const totalDownloads = resumes.reduce((acc, r) => acc + r.downloads, 0);
  const avgATS = resumes.length > 0
    ? Math.round(resumes.filter(r => r.atsReports?.[0]).reduce((acc, r) => acc + (r.atsReports[0]?.overallScore || 0), 0) / resumes.filter(r => r.atsReports?.[0]).length) || 0
    : 0;

  const isProfileComplete = profile && profile.skills.length > 0 && profile.experiences.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isProfileComplete
              ? 'Your profile is complete. Ready to generate a new resume?'
              : 'Complete the AI interview to build your profile.'}
          </p>
        </div>
        <Link to="/interview">
          <Button leftIcon={<Zap className="w-4 h-4" />}>
            New Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Resumes" value={resumes.length} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={TrendingUp} label="Avg ATS Score" value={avgATS ? `${avgATS}%` : '—'} color="text-green-600 bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={Eye} label="Total Views" value={totalViews} color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
        <StatCard icon={Download} label="Downloads" value={totalDownloads} color="text-orange-600 bg-orange-50 dark:bg-orange-900/20" />
      </div>

      {/* Quick Actions */}
      {!isProfileComplete && (
        <Card className="border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Complete Your AI Interview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Answer a few conversational questions to build your complete profile. This is required to generate resumes.
              </p>
              <Link to="/interview">
                <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Interview
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div>
          <CardHeader>
            <CardTitle>Recent Resumes</CardTitle>
            <Link to="/resumes">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>

          {resumes.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No resumes yet</p>
              <Link to="/resumes">
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>Generate Resume</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 4).map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <CardTitle className="mb-4">Quick Actions</CardTitle>
          <div className="space-y-3">
            {[
              { to: '/interview', icon: MessageSquare, label: 'Start AI Interview', desc: 'Chat with AI to build your profile', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { to: '/job-analyzer', icon: Search, label: 'Analyze Job Description', desc: 'Extract keywords and requirements', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
              { to: '/resumes', icon: FileText, label: 'Build Resume', desc: 'Generate ATS-optimized resume', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link to={to} key={to}>
                <Card hover padding="sm" className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
