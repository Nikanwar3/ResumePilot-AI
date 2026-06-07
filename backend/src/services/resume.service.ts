import { profileRepository } from '../repositories/profile.repository';
import { resumeRepository } from '../repositories/resume.repository';
import { geminiService } from './gemini.service';
import { calculateATSScore } from '../utils/ats.utils';
import { generateResumeSlug } from '../utils/slug.utils';
import { AppError } from '../middleware/error.middleware';
import { ResumeContent, ParsedJobDescription } from '../types';

export class ResumeService {
  async generateResume(
    userId: string,
    options: {
      title: string;
      template: string;
      jobDescription?: ParsedJobDescription;
      targetRole?: string;
    }
  ) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) throw new AppError(404, 'Profile not found. Complete the interview first.');

    const allSkillNames = profile.skills.map((s) => s.name);
    const skillGroups = await geminiService.generateSkillsSection(allSkillNames, options.targetRole || profile.targetRole || 'Software Engineer');

    const improvedExperiences = await Promise.all(
      profile.experiences.map(async (exp) => {
        const improved = await geminiService.improveBulletPoints(
          exp.description,
          exp.role,
          exp.company
        );
        return {
          company: exp.company,
          role: exp.role,
          type: exp.type,
          location: exp.location ?? undefined,
          remote: exp.remote,
          startDate: exp.startDate.toISOString(),
          endDate: exp.endDate?.toISOString(),
          current: exp.current,
          description: improved,
          technologies: exp.technologies,
        };
      })
    );

    const improvedProjects = await Promise.all(
      profile.projects.map(async (proj) => {
        const highlights = proj.highlights.length > 0
          ? proj.highlights
          : await geminiService.generateProjectHighlights({
              name: proj.name,
              description: proj.description,
              technologies: proj.technologies,
            });
        return {
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
          url: proj.url ?? undefined,
          github: proj.github ?? undefined,
          highlights,
        };
      })
    );

    const summary = await geminiService.generateProfessionalSummary(
      {
        name: profile.user?.name,
        skills: allSkillNames,
        yearsOfExperience: profile.yearsOfExperience,
        experiences: profile.experiences.map((e) => ({ role: e.role, company: e.company, type: e.type })),
        projects: profile.projects.map((p) => p.name),
      },
      options.targetRole || profile.targetRole || 'Software Engineer',
      options.jobDescription?.keywords
    );

    const content: ResumeContent = {
      personalInfo: {
        name: (profile as unknown as { user: { name: string } }).user?.name || '',
        email: (profile as unknown as { user: { email: string } }).user?.email || '',
        phone: profile.phone ?? undefined,
        location: profile.location ?? undefined,
        linkedin: profile.linkedin ?? undefined,
        github: profile.github ?? undefined,
        website: profile.website ?? undefined,
      },
      summary,
      education: profile.education.map((e) => ({
        degree: e.degree,
        field: e.field,
        university: e.university,
        location: e.location ?? undefined,
        startYear: e.startYear,
        endYear: e.endYear ?? undefined,
        gpa: e.gpa ?? undefined,
        honors: e.honors ?? undefined,
      })),
      skills: skillGroups,
      experience: improvedExperiences,
      projects: improvedProjects,
      certifications: profile.certifications.map((c) => ({
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate?.toISOString(),
        url: c.url ?? undefined,
      })),
      achievements: profile.achievements.map((a) => ({
        title: a.title,
        description: a.description,
        date: a.date?.toISOString(),
      })),
    };

    const user = (profile as unknown as { user: { name: string } }).user;
    const slug = generateResumeSlug(user?.name || 'user', options.title);

    const resume = await resumeRepository.create({
      userId,
      title: options.title,
      slug,
      template: options.template,
      content,
    });

    if (options.jobDescription) {
      const atsScore = calculateATSScore(content, options.jobDescription);
      await resumeRepository.createATSReport({
        resumeId: resume.id,
        overallScore: atsScore.overallScore,
        skillsScore: atsScore.skillsScore,
        experienceScore: atsScore.experienceScore,
        keywordScore: atsScore.keywordScore,
        educationScore: atsScore.educationScore,
        projectScore: atsScore.projectScore,
        missingKeywords: atsScore.missingKeywords,
        matchedKeywords: atsScore.matchedKeywords,
        suggestions: atsScore.suggestions,
        improvements: atsScore.improvements,
        details: atsScore.details as unknown as Record<string, unknown>,
      });
    }

    return resume;
  }

  async getResume(resumeId: string, userId: string) {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) throw new AppError(404, 'Resume not found');
    if (resume.userId !== userId && !resume.isPublic) {
      throw new AppError(403, 'Access denied');
    }
    return resume;
  }

  async getPublicResume(slug: string) {
    const resume = await resumeRepository.findBySlug(slug);
    if (!resume || !resume.isPublic) throw new AppError(404, 'Resume not found');
    await resumeRepository.incrementViews(resume.id);
    return resume;
  }

  async getUserResumes(userId: string) {
    return resumeRepository.findByUserId(userId);
  }

  async updateResume(resumeId: string, userId: string, data: {
    title?: string;
    template?: string;
    content?: ResumeContent;
    isPublic?: boolean;
  }) {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) throw new AppError(404, 'Resume not found');
    if (resume.userId !== userId) throw new AppError(403, 'Access denied');

    return resumeRepository.update(resumeId, data);
  }

  async deleteResume(resumeId: string, userId: string) {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) throw new AppError(404, 'Resume not found');
    if (resume.userId !== userId) throw new AppError(403, 'Access denied');

    return resumeRepository.delete(resumeId);
  }

  async analyzeATSScore(resumeId: string, userId: string, jobDescription: ParsedJobDescription) {
    const resume = await this.getResume(resumeId, userId);
    const content = resume.content as unknown as ResumeContent;

    const atsScore = calculateATSScore(content, jobDescription);

    await resumeRepository.createATSReport({
      resumeId,
      overallScore: atsScore.overallScore,
      skillsScore: atsScore.skillsScore,
      experienceScore: atsScore.experienceScore,
      keywordScore: atsScore.keywordScore,
      educationScore: atsScore.educationScore,
      projectScore: atsScore.projectScore,
      missingKeywords: atsScore.missingKeywords,
      matchedKeywords: atsScore.matchedKeywords,
      suggestions: atsScore.suggestions,
      improvements: atsScore.improvements,
      details: atsScore.details as unknown as Record<string, unknown>,
    });

    return atsScore;
  }

  async createVersion(resumeId: string, userId: string, title: string) {
    const original = await this.getResume(resumeId, userId);
    const slug = generateResumeSlug(title, 'v' + (original.version + 1));

    return resumeRepository.create({
      userId,
      title,
      slug,
      template: original.template,
      content: original.content as unknown as ResumeContent,
      version: original.version + 1,
      parentId: original.id,
    });
  }
}

export const resumeService = new ResumeService();
