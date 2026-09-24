import { z } from 'zod';

export const homeSchema = z.object({
  jobDescription: z
    .string()
    .min(10, { message: 'Job description must be at least 10 characters long' })
    .max(5000, { message: 'Job description cannot exceed 5000 characters' }),
  selfDescription: z
    .string()
    .max(2000, { message: 'Self description cannot exceed 2000 characters' })
    .optional()
    .or(z.literal('')),
  resumeFile: z.any().optional()
}).refine(
  (data) => {
    const hasResume = data.resumeFile && data.resumeFile.length > 0;
    const hasSelfDesc = Boolean(data.selfDescription && data.selfDescription.trim().length >= 10);
    return hasResume || hasSelfDesc;
  },
  {
    message: 'Please either upload a resume file (PDF/DOCX) or provide a detailed self-description (at least 10 characters).',
    path: ['selfDescription']
  }
);
