import { ATSScoreResult, ResumeContent, ParsedJobDescription } from '../types';

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.#+]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function calculateSkillsScore(
  resumeSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (requiredSkills.length === 0) return { score: 75, matched: [], missing: [] };

  const normalizedResumeSkills = resumeSkills.map(normalizeText);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    const normalized = normalizeText(skill);
    const found = normalizedResumeSkills.some(
      (rs) => rs.includes(normalized) || normalized.includes(rs)
    );
    if (found) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  for (const skill of preferredSkills) {
    const normalized = normalizeText(skill);
    const found = normalizedResumeSkills.some(
      (rs) => rs.includes(normalized) || normalized.includes(rs)
    );
    if (found && !matched.includes(skill)) {
      matched.push(skill);
    }
  }

  const requiredScore = requiredSkills.length > 0
    ? (matched.filter((m) => requiredSkills.map(normalizeText).includes(normalizeText(m))).length / requiredSkills.length) * 100
    : 100;

  const preferredBonus = preferredSkills.length > 0
    ? (matched.filter((m) => preferredSkills.map(normalizeText).includes(normalizeText(m))).length / preferredSkills.length) * 20
    : 0;

  return {
    score: Math.min(100, requiredScore * 0.85 + preferredBonus),
    matched,
    missing,
  };
}

function calculateKeywordScore(
  resumeText: string,
  keywords: string[]
): { score: number; found: string[]; missing: string[]; density: number } {
  if (keywords.length === 0) return { score: 75, found: [], missing: [], density: 0 };

  const resumeTokens = tokenize(resumeText);
  const found: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    const keyTokens = tokenize(keyword);
    const allFound = keyTokens.every((kt) => resumeTokens.some((rt) => rt.includes(kt) || kt.includes(rt)));
    if (allFound) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchRatio = found.length / keywords.length;
  const density = (found.length / Math.max(resumeTokens.length, 1)) * 100;

  return {
    score: matchRatio * 100,
    found,
    missing,
    density: parseFloat(density.toFixed(2)),
  };
}

function calculateExperienceScore(
  experiences: ResumeContent['experience'],
  jobDescription: ParsedJobDescription
): { score: number; relevantYears: number } {
  if (experiences.length === 0) return { score: 20, relevantYears: 0 };

  let totalMonths = 0;
  const now = new Date();

  for (const exp of experiences) {
    const start = new Date(exp.startDate);
    const end = exp.current ? now : exp.endDate ? new Date(exp.endDate) : now;
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  const totalYears = totalMonths / 12;
  const expText = jobDescription.experienceLevel || '';
  let requiredYears = 0;

  const match = expText.match(/(\d+)/);
  if (match) requiredYears = parseInt(match[1], 10);

  let score: number;
  if (requiredYears === 0) {
    score = Math.min(100, 60 + totalYears * 8);
  } else {
    score = Math.min(100, (totalYears / requiredYears) * 100);
  }

  return { score, relevantYears: parseFloat(totalYears.toFixed(1)) };
}

function calculateEducationScore(
  education: ResumeContent['education'],
  jobDescription: ParsedJobDescription
): number {
  if (education.length === 0) return 50;

  const requiredEdu = (jobDescription.educationRequired || '').toLowerCase();
  const hasBachelor = education.some((e) => normalizeText(e.degree).includes('bachelor') || normalizeText(e.degree).includes('b.tech') || normalizeText(e.degree).includes('b.e'));
  const hasMaster = education.some((e) => normalizeText(e.degree).includes('master') || normalizeText(e.degree).includes('m.tech'));

  if (requiredEdu.includes('master') && hasMaster) return 100;
  if (requiredEdu.includes('bachelor') && hasBachelor) return 100;
  if (hasMaster) return 95;
  if (hasBachelor) return 85;

  return 60;
}

function calculateProjectScore(
  projects: ResumeContent['projects'],
  keywords: string[]
): number {
  if (projects.length === 0) return 30;

  let relevantCount = 0;
  for (const project of projects) {
    const projectText = `${project.name} ${project.description} ${project.technologies.join(' ')} ${project.highlights.join(' ')}`.toLowerCase();
    const keywordMatches = keywords.filter((k) => projectText.includes(k.toLowerCase())).length;
    if (keywordMatches > 0) relevantCount++;
  }

  const baseScore = Math.min(80, projects.length * 15);
  const relevanceBonus = projects.length > 0 ? (relevantCount / projects.length) * 20 : 0;

  return Math.min(100, baseScore + relevanceBonus);
}

function generateSuggestions(
  missingSkills: string[],
  missingKeywords: string[],
  scores: Partial<ATSScoreResult>
): string[] {
  const suggestions: string[] = [];

  if ((scores.skillsScore || 0) < 60) {
    suggestions.push(`Add these required skills to your profile: ${missingSkills.slice(0, 5).join(', ')}`);
  }

  if ((scores.keywordScore || 0) < 60) {
    suggestions.push(`Include these keywords in your resume: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  if ((scores.experienceScore || 0) < 60) {
    suggestions.push('Expand your experience descriptions with quantifiable achievements and metrics');
  }

  if ((scores.projectScore || 0) < 60) {
    suggestions.push('Add more projects that align with the job requirements');
  }

  suggestions.push('Use action verbs at the start of bullet points (Developed, Implemented, Led, Optimized)');
  suggestions.push('Quantify your achievements with numbers, percentages, or impact metrics');

  return suggestions;
}

function generateImprovements(
  missingKeywords: string[],
  scores: Partial<ATSScoreResult>
): string[] {
  const improvements: string[] = [];

  if (missingKeywords.length > 0) {
    improvements.push(`Incorporate these missing keywords naturally: ${missingKeywords.slice(0, 8).join(', ')}`);
  }

  if ((scores.overallScore || 0) < 70) {
    improvements.push('Tailor your professional summary to match the job description language');
    improvements.push('Mirror the exact terminology used in the job posting');
  }

  improvements.push('Ensure consistent formatting throughout the resume');
  improvements.push('Keep file name as FirstName-LastName-Resume.pdf for ATS processing');

  return improvements;
}

export function calculateATSScore(
  resumeContent: ResumeContent,
  jobDescription: ParsedJobDescription
): ATSScoreResult {
  const allSkills = resumeContent.skills.flatMap((sg) => sg.skills);

  const skillsAnalysis = calculateSkillsScore(
    allSkills,
    jobDescription.requiredSkills,
    jobDescription.preferredSkills
  );

  const resumeText = [
    resumeContent.summary,
    ...resumeContent.experience.flatMap((e) => [...e.description, ...e.technologies]),
    ...resumeContent.projects.flatMap((p) => [p.description, ...p.highlights, ...p.technologies]),
    ...resumeContent.skills.flatMap((sg) => sg.skills),
  ].join(' ');

  const keywordAnalysis = calculateKeywordScore(resumeText, jobDescription.keywords);

  const experienceAnalysis = calculateExperienceScore(
    resumeContent.experience,
    jobDescription
  );

  const educationScore = calculateEducationScore(resumeContent.education, jobDescription);

  const projectScore = calculateProjectScore(resumeContent.projects, jobDescription.keywords);

  const skillsScore = Math.round(skillsAnalysis.score);
  const keywordScore = Math.round(keywordAnalysis.score);
  const experienceScore = Math.round(experienceAnalysis.score);

  const overallScore = Math.round(
    skillsScore * 0.30 +
    keywordScore * 0.25 +
    experienceScore * 0.25 +
    educationScore * 0.10 +
    projectScore * 0.10
  );

  const scores = { skillsScore, keywordScore, experienceScore, educationScore, projectScore, overallScore };

  return {
    overallScore,
    skillsScore,
    experienceScore,
    keywordScore,
    educationScore,
    projectScore,
    missingKeywords: keywordAnalysis.missing,
    matchedKeywords: keywordAnalysis.found,
    suggestions: generateSuggestions(skillsAnalysis.missing, keywordAnalysis.missing, scores),
    improvements: generateImprovements(keywordAnalysis.missing, scores),
    details: {
      skillsAnalysis: {
        matched: skillsAnalysis.matched,
        missing: skillsAnalysis.missing,
        percentage: skillsScore,
      },
      keywordAnalysis: {
        found: keywordAnalysis.found,
        missing: keywordAnalysis.missing,
        density: keywordAnalysis.density,
      },
      experienceAnalysis: {
        relevantExperience: experienceAnalysis.relevantYears,
        requiredExperience: jobDescription.experienceLevel || 'Not specified',
        score: experienceScore,
      },
    },
  };
}
