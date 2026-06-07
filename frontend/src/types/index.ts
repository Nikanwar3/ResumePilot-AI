// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Profile Types
export interface Profile {
  id: string;
  userId: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  targetRole?: string;
  yearsOfExperience?: number;
  education: Education[];
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  university: string;
  location?: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
  honors?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: string;
  category?: string;
}

export interface Experience {
  id: string;
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

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  url?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

// Resume Types
export interface Resume {
  id: string;
  userId: string;
  title: string;
  slug: string;
  template: string;
  content: ResumeContent;
  isPublic: boolean;
  views: number;
  downloads: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  atsReports: ATSReport[];
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  education: EducationContent[];
  skills: SkillGroup[];
  experience: ExperienceContent[];
  projects: ProjectContent[];
  certifications: CertificationContent[];
  achievements: AchievementContent[];
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

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface EducationContent {
  degree: string;
  field: string;
  university: string;
  location?: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
}

export interface ExperienceContent {
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

export interface ProjectContent {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  highlights: string[];
}

export interface CertificationContent {
  name: string;
  issuer: string;
  issueDate?: string;
  url?: string;
}

export interface AchievementContent {
  title: string;
  description: string;
  date?: string;
}

// ATS Types
export interface ATSReport {
  id: string;
  resumeId: string;
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
  createdAt: string;
}

// Interview Types
export interface InterviewSession {
  id: string;
  userId: string;
  messages: InterviewMessage[];
  status: 'active' | 'completed' | 'abandoned';
  phase: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Job Description Types
export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  content: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Template Types
export type ResumeTemplate =
  | 'software-engineer'
  | 'full-stack'
  | 'frontend'
  | 'backend'
  | 'mern';

export interface TemplateInfo {
  id: ResumeTemplate;
  name: string;
  description: string;
  tags: string[];
}
