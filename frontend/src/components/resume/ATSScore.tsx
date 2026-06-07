import { ATSReport } from '../../types';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ATSScoreProps {
  report: ATSReport;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={8} className="dark:stroke-gray-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ATSScore({ report }: ATSScoreProps) {
  const scoreLabel =
    report.overallScore >= 80 ? { label: 'Excellent', variant: 'success' as const } :
    report.overallScore >= 60 ? { label: 'Good', variant: 'warning' as const } :
    { label: 'Needs Work', variant: 'danger' as const };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={report.overallScore} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <CardTitle>ATS Score</CardTitle>
              <Badge variant={scoreLabel.variant}>{scoreLabel.label}</Badge>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {report.overallScore >= 80
                ? 'Your resume is well-optimized for ATS systems.'
                : report.overallScore >= 60
                ? 'Good progress! Add more keywords to improve your score.'
                : 'Your resume needs optimization for ATS compatibility.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          Score Breakdown
        </CardTitle>
        <div className="space-y-3">
          <ScoreBar label="Skills Match" score={report.skillsScore} />
          <ScoreBar label="Keyword Coverage" score={report.keywordScore} />
          <ScoreBar label="Experience Relevance" score={report.experienceScore} />
          <ScoreBar label="Education Match" score={report.educationScore} />
          <ScoreBar label="Project Relevance" score={report.projectScore} />
        </div>
      </Card>

      {/* Matched Keywords */}
      {report.matchedKeywords.length > 0 && (
        <Card>
          <CardTitle className="mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            Matched Keywords ({report.matchedKeywords.length})
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {report.matchedKeywords.map((kw) => (
              <Badge key={kw} variant="success">{kw}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Missing Keywords */}
      {report.missingKeywords.length > 0 && (
        <Card>
          <CardTitle className="mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            Missing Keywords ({report.missingKeywords.length})
          </CardTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            {report.missingKeywords.map((kw) => (
              <Badge key={kw} variant="danger">{kw}</Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500">Add these keywords naturally to your experience and skills sections.</p>
        </Card>
      )}

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <Card>
          <CardTitle className="mb-3 flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Info className="w-5 h-5" />
            Improvement Suggestions
          </CardTitle>
          <ul className="space-y-2">
            {report.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-brand-500 font-bold mt-0.5">→</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
