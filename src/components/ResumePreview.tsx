import React, { forwardRef } from 'react';
import { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  template?: "professional" | "modern" | "creative";
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, template = "professional" }, ref) => {
    
    // Split description into bullet points for better rendering
    const renderBullets = (text: string, bulletClass: string = "text-[#333]") => {
      if (!text) return null;
      const bullets = text.split('\n').filter(b => b.trim().length > 0);
      return (
        <ul className={`list-disc pl-5 mt-2 space-y-1 text-[10.5pt] leading-relaxed ${bulletClass}`}>
          {bullets.map((bullet, idx) => (
            <li key={idx}>{bullet.replace(/^[•\-\*]\s*/, '')}</li>
          ))}
        </ul>
      );
    };

    if (template === "modern") {
      return (
        <div
          ref={ref}
          className="w-[210mm] min-h-[297mm] bg-white text-slate-800 flex shadow-none print:shadow-none print:p-0"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Sidebar */}
          <div className="w-[35%] bg-slate-100 p-[15mm] border-r border-slate-200">
            <h1 className="text-[24pt] font-extrabold tracking-tight text-slate-900 leading-tight mb-6 text-blue-900">
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            
            <div className="mb-8 space-y-3 text-[9.5pt] font-medium text-slate-600">
              {data.personalInfo.email && <div className="break-all">{data.personalInfo.email}</div>}
              {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
              {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
              {data.personalInfo.website && <div className="break-all">{data.personalInfo.website}</div>}
            </div>

            {data.skills && (
              <div className="mb-8">
                <h2 className="text-[11pt] font-bold uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-blue-500 inline-block pb-1">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 text-[8.5pt] rounded-md font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="w-[65%] p-[15mm]">
            {data.personalInfo.summary && (
              <div className="mb-8">
                <h2 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 mb-3 text-blue-900">
                  Profile
                </h2>
                <p className="text-[10pt] text-slate-600 leading-relaxed">
                  {data.personalInfo.summary}
                </p>
              </div>
            )}

            {data.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 mb-5 text-blue-900">
                  Experience
                </h2>
                <div className="space-y-6">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="relative pl-4 border-l-2 border-blue-100">
                      <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-[11pt] font-bold text-slate-900">{exp.position}</h3>
                      </div>
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="text-[10pt] font-semibold text-blue-700">{exp.company}</div>
                        <span className="text-[9pt] font-medium text-slate-500 uppercase tracking-wider">
                          {exp.startDate} {exp.startDate && exp.endDate && '—'} {exp.endDate}
                        </span>
                      </div>
                      {renderBullets(exp.description, "text-slate-600")}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 mb-5 text-blue-900">
                  Education
                </h2>
                <div className="space-y-5">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="text-[11pt] font-bold text-slate-900">{edu.degree}</h3>
                      <div className="flex justify-between items-baseline mt-0.5">
                        <div className="text-[10pt] text-slate-600">{edu.school}</div>
                        <span className="text-[9pt] font-medium text-slate-500 uppercase tracking-wider">
                          {edu.startDate} {edu.startDate && edu.endDate && '—'} {edu.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (template === "creative") {
      return (
        <div
          ref={ref}
          className="w-[210mm] min-h-[297mm] bg-[#FAF9F6] text-[#2D3748] px-[20mm] py-[20mm] mx-auto shadow-none print:shadow-none print:p-0"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-[32pt] font-black tracking-tighter text-[#1A202C] leading-none mb-4 lowercase">
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[9.5pt] font-semibold text-[#4A5568]">
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.phone && <span className="text-[#E2E8F0]">/</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.location && <span className="text-[#E2E8F0]">/</span>}
              {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
              {data.personalInfo.website && <span className="text-[#E2E8F0]">/</span>}
              {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
            </div>
          </div>

          {/* Summary */}
          {data.personalInfo.summary && (
            <div className="mb-10 text-center px-8">
              <p className="text-[11pt] text-[#4A5568] leading-relaxed font-medium italic">
                "{data.personalInfo.summary}"
              </p>
            </div>
          )}

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              {/* Experience */}
              {data.experience.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-[14pt] font-bold text-[#1A202C] mb-6 flex items-center">
                    <span className="w-8 h-1 bg-[#D53F8C] mr-3 rounded-full"></span>
                    Experience
                  </h2>
                  <div className="space-y-8">
                    {data.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-[12pt] font-bold text-[#2D3748]">{exp.position}</h3>
                          <span className="text-[9pt] font-bold text-[#718096] bg-[#EDF2F7] px-2 py-0.5 rounded-md">
                            {exp.startDate} {exp.startDate && exp.endDate && '-'} {exp.endDate}
                          </span>
                        </div>
                        <div className="text-[10.5pt] font-bold text-[#D53F8C] mb-2">{exp.company}</div>
                        {renderBullets(exp.description, "text-[#4A5568]")}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-4">
              {/* Education */}
              {data.education.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-[14pt] font-bold text-[#1A202C] mb-6 flex items-center">
                    <span className="w-8 h-1 bg-[#3182CE] mr-3 rounded-full"></span>
                    Education
                  </h2>
                  <div className="space-y-5">
                    {data.education.map((edu) => (
                      <div key={edu.id}>
                        <h3 className="text-[10.5pt] font-bold text-[#2D3748] leading-tight mb-1">{edu.degree}</h3>
                        <div className="text-[9.5pt] font-semibold text-[#3182CE] mb-1">{edu.school}</div>
                        <div className="text-[8.5pt] font-medium text-[#718096]">
                          {edu.startDate} {edu.startDate && edu.endDate && '-'} {edu.endDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.skills && (
                <div className="mb-10">
                  <h2 className="text-[14pt] font-bold text-[#1A202C] mb-6 flex items-center">
                    <span className="w-8 h-1 bg-[#38A169] mr-3 rounded-full"></span>
                    Skills
                  </h2>
                  <div className="flex flex-col gap-2">
                    {data.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="text-[10pt] font-medium text-[#4A5568] border-b border-[#E2E8F0] pb-1">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default: Professional
    return (
      <div
        ref={ref}
        className="w-[210mm] min-h-[297mm] bg-white text-[#111] px-[20mm] py-[20mm] mx-auto shadow-none print:shadow-none print:p-0"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header (Professional Style: Clean, left-aligned or centered, elegant) */}
        <div className="mb-8 border-b border-[#ddd] pb-6 text-center">
          <h1 className="text-[28pt] font-extrabold tracking-tight text-[#0a0a0a] uppercase leading-none mb-3">
            {data.personalInfo.fullName || "Your Name"}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[9.5pt] font-medium text-[#555]">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <><span className="text-[#ccc]">•</span><span>{data.personalInfo.phone}</span></>}
            {data.personalInfo.location && <><span className="text-[#ccc]">•</span><span>{data.personalInfo.location}</span></>}
            {data.personalInfo.website && <><span className="text-[#ccc]">•</span><span>{data.personalInfo.website}</span></>}
          </div>
        </div>

        {/* Summary */}
        {data.personalInfo.summary && (
          <div className="mb-7">
            <p className="text-[10.5pt] text-[#333] leading-relaxed">
              {data.personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-7">
            <h2 className="text-[12pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#000] pb-1 mb-4">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-[11.5pt] font-bold text-[#111]">{exp.position}</h3>
                    <span className="text-[9.5pt] font-medium text-[#666] whitespace-nowrap ml-4">
                      {exp.startDate} {exp.startDate && exp.endDate && '—'} {exp.endDate}
                    </span>
                  </div>
                  <div className="text-[10.5pt] font-semibold text-[#000] mb-1.5">{exp.company}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-7">
            <h2 className="text-[12pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#000] pb-1 mb-4">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-[11pt] font-bold text-[#111]">{edu.degree}</h3>
                    <span className="text-[9.5pt] font-medium text-[#666] whitespace-nowrap ml-4">
                      {edu.startDate} {edu.startDate && edu.endDate && '—'} {edu.endDate}
                    </span>
                  </div>
                  <div className="text-[10.5pt] text-[#444]">{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && (
          <div className="mb-7">
            <h2 className="text-[12pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#000] pb-1 mb-3">
              Core Competencies
            </h2>
            <p className="text-[10.5pt] text-[#333] leading-relaxed">
              {data.skills}
            </p>
          </div>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
