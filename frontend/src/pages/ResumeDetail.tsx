import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { resumeApi } from '../api/resume.api';
import { ResumePreview } from '../components/resume/ResumePreview';
import { ATSScore } from '../components/resume/ATSScore';
import { Button } from '../components/ui/Button';
import { ResumeContent } from '../types';
import { Download, Share2, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '../components/ui/Input';
import toast from 'react-hot-toast';

type Tab = 'preview' | 'ats';

export function ResumeDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [jdText, setJdText] = useState('');
  const [showJDInput, setShowJDInput] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeApi.getById(id!),
    enabled: !!id,
  });

  const { mutate: analyzeATS, isPending: isAnalyzing, data: atsData } = useMutation({
    mutationFn: () => resumeApi.analyzeATS(id!, { jobDescriptionText: jdText }),
    onSuccess: () => {
      setShowJDInput(false);
      setActiveTab('ats');
      toast.success('ATS analysis complete!');
    },
    onError: () => toast.error('ATS analysis failed'),
  });

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      const blob = format === 'pdf' ? await resumeApi.exportPDF(id!) : await resumeApi.exportDOCX(id!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume?.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch {
      toast.error('Download failed');
    }
  };

  const resume = data?.data;
  const content = resume?.content as ResumeContent | undefined;
  const latestATS = atsData?.data || resume?.atsReports?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!resume || !content) {
    return <div className="text-center text-gray-500 mt-20">Resume not found</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{resume.title}</h1>
          <p className="text-gray-500 text-sm">Version {resume.version} · {new Date(resume.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowJDInput(!showJDInput)} leftIcon={<TrendingUp className="w-4 h-4" />}>
            Analyze ATS
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} leftIcon={<Download className="w-4 h-4" />}>
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('docx')} leftIcon={<FileText className="w-4 h-4" />}>
            DOCX
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/r/${resume.slug}`);
              toast.success('Public link copied!');
            }}
          >
            Share
          </Button>
        </div>
      </div>

      {/* JD Analyzer */}
      {showJDInput && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Paste Job Description</h3>
          <Textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
          />
          <div className="flex gap-2">
            <Button onClick={() => analyzeATS()} isLoading={isAnalyzing} disabled={!jdText.trim()}>
              Analyze ATS Score
            </Button>
            <Button variant="ghost" onClick={() => setShowJDInput(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['preview', 'ats'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'ats' ? 'ATS Score' : 'Preview'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'preview' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ResumePreview content={content} />
        </div>
      ) : latestATS ? (
        <ATSScore report={latestATS as import('../types').ATSReport} />
      ) : (
        <div className="text-center py-16 text-gray-500">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p>No ATS analysis yet. Paste a job description above to analyze.</p>
        </div>
      )}
    </div>
  );
}
