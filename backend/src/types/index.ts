import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interview Types
export interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface InterviewPhase {
  name: 'personal' | 'education' | 'skills' | 'experience' | 'projects' | 'certifications' | 'achievements' | 'target';
  completed: boolean;
  data: Record<string, unknown>;
}

// Resume Content Types
export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface EducationEntry {
  degree: string;
  field: string;
  university: string;
  location?: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
  honors?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  type: string;
  location?: string;
  remote: boolean;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  technologies: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  highlights: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  issueDate?: string;
  url?: string;
}

export interface AchievementEntry {
  title: string;
  description: string;
  date?: string;
}

// ATS Types
export interface ATSScoreResult {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  keywordScore: number;
  educationScore: number;
  projectScore: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  improvements: string[];
  details: ATSDetails;
}

export interface ATSDetails {
  skillsAnalysis: {
    matched: string[];
    missing: string[];
    percentage: number;
  };
  keywordAnalysis: {
    found: string[];
    missing: string[];
    density: number;
  };
  experienceAnalysis: {
    relevantExperience: number;
    requiredExperience: string;
    score: number;
  };
}

// Job Description Types
export interface ParsedJobDescription {
  title: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  roleType?: string;
  experienceLevel?: string;
  educationRequired?: string;
}
