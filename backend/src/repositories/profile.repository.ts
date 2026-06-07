import { prisma } from '../config/database';

export class ProfileRepository {
  async findByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        education: true,
        skills: true,
        experiences: { orderBy: { startDate: 'desc' } },
        projects: true,
        certifications: true,
        achievements: true,
      },
    });
  }

  async upsert(userId: string, data: {
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary?: string;
    targetRole?: string;
    yearsOfExperience?: number;
  }) {
    return prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
      include: {
        user: { select: { name: true, email: true } },
        education: true,
        skills: true,
        experiences: true,
        projects: true,
        certifications: true,
        achievements: true,
      },
    });
  }

  async addEducation(profileId: string, data: {
    degree: string;
    field: string;
    university: string;
    location?: string;
    startYear: number;
    endYear?: number;
    gpa?: number;
    honors?: string;
  }) {
    return prisma.education.create({ data: { profileId, ...data } });
  }

  async updateEducation(id: string, data: Record<string, unknown>) {
    return prisma.education.update({ where: { id }, data });
  }

  async deleteEducation(id: string) {
    return prisma.education.delete({ where: { id } });
  }

  async addSkill(profileId: string, data: { name: string; level?: string; category?: string }) {
    return prisma.skill.create({ data: { profileId, ...data } });
  }

  async replaceSkills(profileId: string, skills: Array<{ name: string; level?: string; category?: string }>) {
    await prisma.skill.deleteMany({ where: { profileId } });
    return prisma.skill.createMany({
      data: skills.map((s) => ({ profileId, ...s })),
    });
  }

  async addExperience(profileId: string, data: {
    company: string;
    role: string;
    type: string;
    location?: string;
    remote?: boolean;
    startDate: Date;
    endDate?: Date;
    current?: boolean;
    description: string[];
    technologies: string[];
    impact?: string;
  }) {
    return prisma.experience.create({ data: { profileId, ...data } });
  }

  async updateExperience(id: string, data: Record<string, unknown>) {
    return prisma.experience.update({ where: { id }, data });
  }

  async deleteExperience(id: string) {
    return prisma.experience.delete({ where: { id } });
  }

  async addProject(profileId: string, data: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    highlights: string[];
  }) {
    return prisma.project.create({ data: { profileId, ...data } });
  }

  async updateProject(id: string, data: Record<string, unknown>) {
    return prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string) {
    return prisma.project.delete({ where: { id } });
  }

  async addCertification(profileId: string, data: {
    name: string;
    issuer: string;
    issueDate?: Date;
    expiryDate?: Date;
    credentialId?: string;
    url?: string;
  }) {
    return prisma.certification.create({ data: { profileId, ...data } });
  }

  async deleteCertification(id: string) {
    return prisma.certification.delete({ where: { id } });
  }

  async addAchievement(profileId: string, data: {
    title: string;
    description: string;
    date?: Date;
    impact?: string;
  }) {
    return prisma.achievement.create({ data: { profileId, ...data } });
  }

  async deleteAchievement(id: string) {
    return prisma.achievement.delete({ where: { id } });
  }
}

export const profileRepository = new ProfileRepository();
