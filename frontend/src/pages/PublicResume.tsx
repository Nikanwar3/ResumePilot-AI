import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resumeApi } from '../api/resume.api';
import { ResumePreview } from '../components/resume/ResumePreview';
import { Button } from '../components/ui/Button';
import { ResumeContent } from '../types';
import { Download, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function PublicResume() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['public-resume', slug],
    queryFn: () => resumeApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const resume = data?.data;
  const content = resume?.content as ResumeContent | undefined;

  const handleDownload = async () => {
    if (!resume) return;
    try {
      const blob = await resumeApi.exportPDF(resume.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!resume || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume not found</h1>
        <p className="text-gray-500">This resume may not be public or the link has changed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">ResumePilot AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{content.personalInfo.name}'s Resume</span>
          <Button size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Resume */}
      <div className="max-w-4xl mx-auto my-8 shadow-xl">
        <ResumePreview content={content} />
      </div>

      {/* Footer CTA */}
      <div className="text-center py-8 text-sm text-gray-500">
        <p>Built with <Link to="/" className="text-brand-600 font-medium">ResumePilot AI</Link></p>
      </div>
    </div>
  );
}
