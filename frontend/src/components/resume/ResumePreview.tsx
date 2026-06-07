import { ResumeContent } from '../../types';

interface ResumePreviewProps {
  content: ResumeContent;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Present';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ResumePreview({ content }: ResumePreviewProps) {
  const { personalInfo, summary, education, skills, experience, projects, certifications, achievements } = content;

  return (
    <div
      className="bg-white text-gray-900 font-serif"
      style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', lineHeight: 1.4, padding: '32px', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '12px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>
          {personalInfo.name?.toUpperCase()}
        </h1>
        <div style={{ fontSize: '9pt', marginTop: '4px', color: '#444' }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`, personalInfo.github && `GitHub: ${personalInfo.github}`]
            .filter(Boolean)
            .join(' | ')}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Professional Summary">
          <p style={{ fontSize: '9.5pt', textAlign: 'justify' }}>{summary}</p>
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Technical Skills">
          {skills.map((group) => (
            <div key={group.category} style={{ marginBottom: '3px', fontSize: '9.5pt' }}>
              <strong>{group.category}:</strong> {group.skills.join(' • ')}
            </div>
          ))}
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '10.5pt' }}>{exp.role}</strong>
                  <div style={{ fontStyle: 'italic', color: '#444', fontSize: '9.5pt' }}>
                    {exp.company} | {exp.type}{exp.location ? ` | ${exp.location}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#444', whiteSpace: 'nowrap' }}>
                  {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                </div>
              </div>
              <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
                {exp.description.map((d, j) => (
                  <li key={j} style={{ fontSize: '9.5pt', marginBottom: '2px' }}>{d}</li>
                ))}
              </ul>
              {exp.technologies.length > 0 && (
                <div style={{ fontSize: '9pt', color: '#555', fontStyle: 'italic', marginTop: '3px' }}>
                  Technologies: {exp.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <strong style={{ fontSize: '10.5pt' }}>{proj.name}</strong>
              {proj.github && <span style={{ fontSize: '9pt', color: '#555' }}> | {proj.github}</span>}
              <div style={{ fontStyle: 'italic', color: '#444', fontSize: '9.5pt' }}>
                {proj.technologies.join(' • ')}
              </div>
              <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
                {proj.highlights.map((h, j) => (
                  <li key={j} style={{ fontSize: '9.5pt', marginBottom: '2px' }}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '10.5pt' }}>{edu.degree} in {edu.field}</strong>
                  <div style={{ fontStyle: 'italic', color: '#444', fontSize: '9.5pt' }}>
                    {edu.university}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#444' }}>
                  {edu.startYear} – {edu.endYear || 'Present'}
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: '9.5pt', marginBottom: '3px' }}>
              <strong>{cert.name}</strong> – {cert.issuer}
              {cert.issueDate && ` (${formatDate(cert.issueDate)})`}
            </div>
          ))}
        </Section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Section title="Achievements">
          {achievements.map((a, i) => (
            <div key={i} style={{ fontSize: '9.5pt', marginBottom: '3px' }}>
              <strong>{a.title}:</strong> {a.description}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid #333',
        paddingBottom: '3px',
        marginBottom: '8px',
        margin: '0 0 8px 0',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
