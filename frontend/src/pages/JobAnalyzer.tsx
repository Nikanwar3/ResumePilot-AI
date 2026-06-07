import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { resumeApi } from '../api/resume.api';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea, Input } from '../components/ui/Input';
import { Search, Zap, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export function JobAnalyzer() {
  const [jdText, setJdText] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');

  const { mutate: analyze, isPending, data: result } = useMutation({
    mutationFn: () => resumeApi.analyzeJobDescription({ content: jdText, title, company }),
    onSuccess: () => toast.success('Job description analyzed!'),
    onError: () => toast.error('Analysis failed'),
  });

  const { data: jdsData } = useQuery({
    queryKey: ['job-descriptions'],
    queryFn: () => resumeApi.getJobDescriptions(),
  });

  const jds = jdsData?.data || [];
  const parsed = result?.data?.parsed as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Description Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Paste a job description to extract keywords and requirements for ATS optimization.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Paste Job Description</CardTitle>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Job Title (optional)"
                  placeholder="Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                  label="Company (optional)"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <Textarea
                label="Job Description"
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={14}
              />
              <Button
                onClick={() => analyze()}
                isLoading={isPending}
                disabled={!jdText.trim()}
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full"
              >
                {isPending ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {parsed ? (
            <>
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{String(parsed.title || 'Job Role')}</h3>
                    {!!parsed.company && <p className="text-sm text-gray-500">{String(parsed.company)}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {!!parsed.roleType && (
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{String(parsed.roleType)}</span>
                    </div>
                  )}
                  {!!parsed.experienceLevel && (
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{String(parsed.experienceLevel)}</span>
                    </div>
                  )}
                  {!!parsed.educationRequired && (
                    <div>
                      <span className="text-gray-500">Education:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{String(parsed.educationRequired)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {(parsed.requiredSkills as string[])?.length > 0 && (
                <Card>
                  <CardTitle className="mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    Required Skills
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {(parsed.requiredSkills as string[]).map((s) => (
                      <Badge key={s} variant="danger">{s}</Badge>
                    ))}
                  </div>
                </Card>
              )}

              {(parsed.preferredSkills as string[])?.length > 0 && (
                <Card>
                  <CardTitle className="mb-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <CheckCircle className="w-5 h-5" />
                    Preferred Skills
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {(parsed.preferredSkills as string[]).map((s) => (
                      <Badge key={s} variant="warning">{s}</Badge>
                    ))}
                  </div>
                </Card>
              )}

              {(parsed.keywords as string[])?.length > 0 && (
                <Card>
                  <CardTitle className="mb-3 flex items-center gap-2 text-brand-600 dark:text-brand-400">
                    <Zap className="w-5 h-5" />
                    ATS Keywords
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {(parsed.keywords as string[]).map((k) => (
                      <Badge key={k} variant="info">{k}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Include these keywords naturally in your resume content.</p>
                </Card>
              )}
            </>
          ) : (
            <Card className="text-center py-16">
              <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analysis Results</h3>
              <p className="text-gray-500 text-sm">Paste a job description and click Analyze to see keywords, required skills, and ATS insights.</p>
            </Card>
          )}

          {/* History */}
          {jds.length > 0 && (
            <Card>
              <CardTitle className="mb-3">Recent Analyses</CardTitle>
              <div className="space-y-2">
                {jds.slice(0, 5).map((jd) => (
                  <div key={jd.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{jd.title}</p>
                      <p className="text-xs text-gray-500">{jd.company} · {new Date(jd.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge>{jd.keywords.length} keywords</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
