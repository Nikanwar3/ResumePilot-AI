import puppeteer from 'puppeteer';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { ResumeContent } from '../types';

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Present';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function generateResumeHTML(content: ResumeContent): string {
  const { personalInfo, summary, education, skills, experience, projects, certifications, achievements } = content;

  const skillsHTML = skills
    .map(
      (group) => `
      <div class="skill-group">
        <span class="skill-category">${group.category}:</span>
        <span class="skill-list">${group.skills.join(' • ')}</span>
      </div>`
    )
    .join('');

  const experienceHTML = experience
    .map(
      (exp) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${exp.role}</div>
            <div class="entry-subtitle">${exp.company} | ${exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}${exp.location ? ` | ${exp.location}` : ''}</div>
          </div>
          <div class="entry-date">${formatDate(exp.startDate)} – ${exp.current ? 'Present' : formatDate(exp.endDate)}</div>
        </div>
        <ul class="bullets">
          ${exp.description.map((d) => `<li>${d}</li>`).join('')}
        </ul>
        ${exp.technologies.length ? `<div class="tech-used">Technologies: ${exp.technologies.join(', ')}</div>` : ''}
      </div>`
    )
    .join('');

  const projectsHTML = projects
    .map(
      (proj) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${proj.name}${proj.github ? ` | <a href="${proj.github}">${proj.github}</a>` : ''}${proj.url ? ` | <a href="${proj.url}">${proj.url}</a>` : ''}</div>
            <div class="entry-subtitle">${proj.technologies.join(' • ')}</div>
          </div>
        </div>
        <ul class="bullets">
          ${proj.highlights.map((h) => `<li>${h}</li>`).join('')}
        </ul>
      </div>`
    )
    .join('');

  const educationHTML = education
    .map(
      (edu) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${edu.degree} in ${edu.field}</div>
            <div class="entry-subtitle">${edu.university}${edu.location ? ` | ${edu.location}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
          </div>
          <div class="entry-date">${edu.startYear} – ${edu.endYear || 'Present'}</div>
        </div>
        ${edu.honors ? `<div class="honors">${edu.honors}</div>` : ''}
      </div>`
    )
    .join('');

  const certsHTML = certifications
    .map(
      (cert) => `
      <div class="cert-item">
        <span class="cert-name">${cert.name}</span> – ${cert.issuer}${cert.issueDate ? ` (${formatDate(cert.issueDate)})` : ''}
      </div>`
    )
    .join('');

  const achievementsHTML = achievements
    .map((a) => `<div class="achievement-item"><strong>${a.title}:</strong> ${a.description}</div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.name} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #1a1a1a;
      background: white;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; }
    .name { font-size: 22pt; font-weight: bold; letter-spacing: 1px; }
    .contact { font-size: 9pt; margin-top: 4px; color: #333; }
    .contact span { margin: 0 6px; }
    .contact a { color: #333; text-decoration: none; }
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #333;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }
    .entry { margin-bottom: 10px; }
    .entry-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .entry-title { font-weight: bold; font-size: 10.5pt; }
    .entry-subtitle { font-style: italic; color: #444; font-size: 9.5pt; }
    .entry-date { font-size: 9.5pt; white-space: nowrap; color: #444; }
    .bullets { margin-left: 16px; margin-top: 4px; }
    .bullets li { margin-bottom: 2px; font-size: 9.5pt; }
    .tech-used { font-size: 9pt; color: #555; margin-top: 3px; font-style: italic; }
    .skill-group { margin-bottom: 3px; font-size: 9.5pt; }
    .skill-category { font-weight: bold; }
    .skill-list { color: #333; }
    .cert-item, .achievement-item { font-size: 9.5pt; margin-bottom: 3px; }
    .summary-text { font-size: 9.5pt; text-align: justify; }
    .honors { font-size: 9pt; color: #555; margin-top: 2px; }
    a { color: #1a1a1a; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${personalInfo.name.toUpperCase()}</div>
    <div class="contact">
      ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
      ${personalInfo.phone ? `<span>| ${personalInfo.phone}</span>` : ''}
      ${personalInfo.location ? `<span>| ${personalInfo.location}</span>` : ''}
      ${personalInfo.linkedin ? `<span>| <a href="${personalInfo.linkedin}">LinkedIn</a></span>` : ''}
      ${personalInfo.github ? `<span>| <a href="${personalInfo.github}">GitHub</a></span>` : ''}
      ${personalInfo.website ? `<span>| <a href="${personalInfo.website}">${personalInfo.website}</a></span>` : ''}
    </div>
  </div>

  ${summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">${summary}</div>
  </div>` : ''}

  ${skills.length ? `
  <div class="section">
    <div class="section-title">Technical Skills</div>
    ${skillsHTML}
  </div>` : ''}

  ${experience.length ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${experienceHTML}
  </div>` : ''}

  ${projects.length ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${projectsHTML}
  </div>` : ''}

  ${education.length ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${educationHTML}
  </div>` : ''}

  ${certifications.length ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${certsHTML}
  </div>` : ''}

  ${achievements.length ? `
  <div class="section">
    <div class="section-title">Achievements</div>
    ${achievementsHTML}
  </div>` : ''}
</body>
</html>`;
}

export class ExportService {
  async generatePDF(content: ResumeContent): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      const html = generateResumeHTML(content);

      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        preferCSSPageSize: false,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async generateDOCX(content: ResumeContent): Promise<Buffer> {
    const { personalInfo, summary, skills, experience, projects, education, certifications, achievements } = content;

    const children: Paragraph[] = [];

    // Header
    children.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.name.toUpperCase(), bold: true, size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin, personalInfo.github].filter(Boolean);
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 18 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: { bottom: { color: '000000', style: BorderStyle.SINGLE, size: 6, space: 1 } },
      })
    );

    const addSection = (title: string) => {
      children.push(
        new Paragraph({
          text: title.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 3, space: 1 } },
        })
      );
    };

    // Summary
    if (summary) {
      addSection('Professional Summary');
      children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 19 })], spacing: { after: 100 } }));
    }

    // Skills
    if (skills.length) {
      addSection('Technical Skills');
      skills.forEach((group) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${group.category}: `, bold: true, size: 19 }),
              new TextRun({ text: group.skills.join(' • '), size: 19 }),
            ],
            spacing: { after: 60 },
          })
        );
      });
    }

    // Experience
    if (experience.length) {
      addSection('Experience');
      experience.forEach((exp) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.role, bold: true, size: 20 }), new TextRun({ text: `  ${formatDate(exp.startDate)} – ${exp.current ? 'Present' : formatDate(exp.endDate)}`, size: 18, color: '666666' })],
            spacing: { after: 40 },
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `${exp.company} | ${exp.type}${exp.location ? ` | ${exp.location}` : ''}`, italics: true, size: 19 })],
            spacing: { after: 60 },
          })
        );
        exp.description.forEach((bullet) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: bullet, size: 19 })],
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        });
      });
    }

    // Projects
    if (projects.length) {
      addSection('Projects');
      projects.forEach((proj) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.name, bold: true, size: 20 })],
            spacing: { after: 40 },
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.technologies.join(' • '), italics: true, size: 18 })],
            spacing: { after: 60 },
          })
        );
        proj.highlights.forEach((highlight) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: highlight, size: 19 })],
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        });
      });
    }

    // Education
    if (education.length) {
      addSection('Education');
      education.forEach((edu) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true, size: 20 }),
              new TextRun({ text: `  ${edu.startYear} – ${edu.endYear || 'Present'}`, size: 18, color: '666666' }),
            ],
            spacing: { after: 40 },
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `${edu.university}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`, italics: true, size: 19 })],
            spacing: { after: 100 },
          })
        );
      });
    }

    // Certifications
    if (certifications.length) {
      addSection('Certifications');
      certifications.forEach((cert) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true, size: 19 }),
              new TextRun({ text: ` – ${cert.issuer}${cert.issueDate ? ` (${formatDate(cert.issueDate)})` : ''}`, size: 19 }),
            ],
            spacing: { after: 60 },
          })
        );
      });
    }

    // Achievements
    if (achievements.length) {
      addSection('Achievements');
      achievements.forEach((a) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${a.title}: `, bold: true, size: 19 }),
              new TextRun({ text: a.description, size: 19 }),
            ],
            spacing: { after: 60 },
          })
        );
      });
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    return Packer.toBuffer(doc);
  }
}

export const exportService = new ExportService();
