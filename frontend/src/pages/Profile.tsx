import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import { useAuthStore } from '../store/authStore';
import { Card, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { GraduationCap, Briefcase, Code, FolderOpen, Award, Trophy, User } from 'lucide-react';

export function Profile() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
  });

  const profile = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Personal Info */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            {profile?.targetRole && (
              <Badge className="mt-2" variant="info">{profile.targetRole}</Badge>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {profile?.phone && <span>📞 {profile.phone}</span>}
              {profile?.location && <span>📍 {profile.location}</span>}
              {profile?.linkedin && <span>🔗 LinkedIn</span>}
              {profile?.github && <span>💻 GitHub</span>}
            </div>
          </div>
        </div>
        {profile?.summary && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
            {profile.summary}
          </p>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { icon: GraduationCap, label: 'Education', count: profile?.education.length || 0 },
          { icon: Code, label: 'Skills', count: profile?.skills.length || 0 },
          { icon: Briefcase, label: 'Experience', count: profile?.experiences.length || 0 },
          { icon: FolderOpen, label: 'Projects', count: profile?.projects.length || 0 },
          { icon: Award, label: 'Certifications', count: profile?.certifications.length || 0 },
          { icon: Trophy, label: 'Achievements', count: profile?.achievements.length || 0 },
        ].map(({ icon: Icon, label, count }) => (
          <Card key={label} padding="sm" className="text-center">
            <Icon className="w-5 h-5 text-brand-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Skills */}
      {profile && profile.skills.length > 0 && (
        <Card>
          <CardTitle className="mb-3 flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-600" /> Skills
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill.id} variant="info">{skill.name}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Experience */}
      {profile && profile.experiences.length > 0 && (
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" /> Experience
          </CardTitle>
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="border-l-2 border-brand-200 pl-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{exp.role}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company} · {exp.type}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(exp.startDate).getFullYear()} – {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                  </span>
                </div>
                {exp.description.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.description.slice(0, 3).map((d, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Projects */}
      {profile && profile.projects.length > 0 && (
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brand-600" /> Projects
          </CardTitle>
          <div className="space-y-3">
            {profile.projects.map((proj) => (
              <div key={proj.id}>
                <h4 className="font-semibold text-gray-900 dark:text-white">{proj.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{proj.description}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.map((t) => (
                    <Badge key={t} size="sm">{t}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!profile && (
        <Card className="text-center py-16">
          <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No profile yet</h3>
          <p className="text-gray-500">Complete the AI interview to build your profile automatically.</p>
        </Card>
      )}
    </div>
  );
}
