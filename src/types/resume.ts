export interface ResumeExperience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  location?: string;
}

export interface ResumeProject {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github?: string;
}

// export interface ResumeSkills {
//   [category: string]: string[];
// }

export interface ResumeContent {
  fullName: string;
  email: string;
  headline: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  projects: ResumeProject[];
}

export interface ResumeProfile extends Partial<ResumeContent> {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeCustomization {
  id: string;
  userId: string;
  content: ResumeContent | null;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export const emptyResumeContent: ResumeContent = {
  fullName: "",
  email: "",
  headline: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
  experience: [],
  education: [],
  skills: {},
  projects: [],
};

export type ResumeSkills = Record<string, string[]> & {
  __order?: string[];
};
