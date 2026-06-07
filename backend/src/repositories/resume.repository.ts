import { prisma } from '../config/database';
import { ResumeContent } from '../types';

export class ResumeRepository {
  async create(data: {
    userId: string;
    title: string;
    slug: string;
    template: string;
    content: ResumeContent;
    isPublic?: boolean;
    version?: number;
    parentId?: string;
  }) {
    return prisma.resume.create({
      data: {
        ...data,
        content: data.content as unknown as import('@prisma/client').Prisma.InputJsonValue,
      },
      include: { atsReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: { atsReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async findBySlug(slug: string) {
    return prisma.resume.findUnique({
      where: { slug },
      include: { atsReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async findByUserId(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      include: { atsReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, data: Partial<{
    title: string;
    template: string;
    content: ResumeContent;
    isPublic: boolean;
  }>) {
    return prisma.resume.update({
      where: { id },
      data: data as Record<string, unknown>,
      include: { atsReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async delete(id: string) {
    return prisma.resume.delete({ where: { id } });
  }

  async incrementViews(id: string) {
    return prisma.resume.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async incrementDownloads(id: string) {
    return prisma.resume.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
  }

  async createATSReport(data: {
    resumeId: string;
    jobDescriptionId?: string;
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
    details: Record<string, unknown>;
  }) {
    return prisma.aTSReport.create({
      data: {
        ...data,
        details: data.details as unknown as import('@prisma/client').Prisma.InputJsonValue,
      },
    });
  }

  async getATSReports(resumeId: string) {
    return prisma.aTSReport.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const resumeRepository = new ResumeRepository();
