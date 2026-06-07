import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { resumeApi } from '../api/resume.api';
import { useResumeStore } from '../store/resumeStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { FileText, Plus, Download, Eye, Trash2, Copy, Share2, Loader2 } from 'lucide-react';
import { Resume } from '../types';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: 'software-engineer', name: 'Software Engineer' },
  { id: 'full-stack', name: 'Full Stack Developer' },
  { id: 'frontend', name: 'Frontend Developer' },
  { id: 'backend', name: 'Backend Developer' },
  { id: 'mern', name: 'MERN Developer' },
];

function GenerateModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('software-engineer');
  const [targetRole, setTargetRole] = useState('');
  const navigate = useNavigate();
  const { setGenerating } = useResumeStore();

  const { mutate: generate, isPending } = useMutation({
    mutationFn: () => resumeApi.generate({ title: title || 'My Resume', template, targetRole }),
    onMutate: () => setGenerating(true),
    onSuccess: (res) => {
      if (res.data) {
        toast.success('Resume generated successfully!');
        onClose();
        navigate(`/resumes/${res.data.id}`);
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Generation failed';
      toast.error(msg);
    },
    onSettled: () => setGenerating(false),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Generate New Resume</h2>

        <div className="space-y-4">
          <Input
            label="Resume Title"
            placeholder="e.g., SDE Resume, Frontend Resume"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Target Role (optional)"
            placeholder="e.g., Software Engineer, React Developer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" isLoading={isPending} onClick={() => generate()}>
            {isPending ? 'Generating...' : 'Generate Resume'}
          </Button>
        </div>

        {isPending && (
          <p className="text-center text-xs text-gray-500 mt-3">
            AI is crafting your resume... This may take 30-60 seconds.
          </p>
        )}
      </Card>
    </div>
  );
}

function ResumeCard({ resume, onDelete }: { resume: Resume; onDelete: (id: string) => void }) {
  const topATS = resume.atsReports?.[0];

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      const blob = format === 'pdf' ? await resumeApi.exportPDF(resume.id) : await resumeApi.exportDOCX(resume.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    }
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{resume.title}</h3>
            <Badge variant="default">v{resume.version}</Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {resume.views} views</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {resume.downloads}</span>
          </div>

          {topATS && (
            <Badge variant={topATS.overallScore >= 80 ? 'success' : topATS.overallScore >= 60 ? 'warning' : 'danger'}>
              ATS: {topATS.overallScore}%
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Link to={`/resumes/${resume.id}`}>
            <Button variant="outline" size="sm" className="w-full">View</Button>
          </Link>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleDownload('pdf')} title="Download PDF">
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/r/${resume.slug}`);
                toast.success('Link copied!');
              }}
              title="Copy link"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onDelete(resume.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Resumes() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.getAll(),
  });

  const { mutate: deleteResume } = useMutation({
    mutationFn: (id: string) => resumeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted');
    },
    onError: () => toast.error('Failed to delete resume'),
  });

  const resumes = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          Generate Resume
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : resumes.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No resumes yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Complete the AI interview first, then generate your ATS-optimized resume.
          </p>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Generate Your First Resume
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} onDelete={deleteResume} />
          ))}
        </div>
      )}

      {showModal && <GenerateModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
