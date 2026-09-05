/* ============================================================
   RESUME SECTION TYPES
============================================================ */

export const RESUME_SECTION_TYPES = [
  "SUMMARY",
  "EXPERIENCE",
  "EDUCATION",
  "SKILLS",
  "PROJECTS",
  "ACHIEVEMENTS",
  "CERTIFICATIONS",
  "AWARDS",
  "LANGUAGES",
  "PUBLICATIONS",
  "VOLUNTEER",
  "CUSTOM",
] as const;

export type ResumeSectionType =
  (typeof RESUME_SECTION_TYPES)[number];

/* ============================================================
   PERSONAL / HEADER INFORMATION
============================================================ */

export interface ResumePersonalInfo {
  fullName?: string | null;
  email?: string | null;
  headline?: string | null;
  phone?: string | null;
  location?: string | null;

  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

/* ============================================================
   SKILLS
============================================================ */

export interface ResumeSkillCategory {
  id: string;
  name: string;
  items: string[];
}

export interface ResumeSkillsContent {
  categories: ResumeSkillCategory[];
}

/* ============================================================
   RESUME SECTION
============================================================ */

export interface ResumeSection {
  /**
   * Stable frontend/backend identity.
   *
   * Never use array index as the identity.
   */
  id: string;

  /**
   * Determines how the section is rendered.
   */
  type: ResumeSectionType;

  /**
   * User-visible section heading.
   *
   * Example:
   * "Professional Experience"
   * "Technical Skills"
   * "My Projects"
   */
  title: string;

  /**
   * Hidden sections remain stored.
   */
  visible: boolean;

  /**
   * Section-specific payload.
   *
   * The editor for `type` is responsible for
   * understanding this content.
   */
  content: unknown;
}

/* ============================================================
   SECTION CONTENT TYPES
============================================================ */

/**
 * SUMMARY
 */
export type ResumeSummaryContent = string;

/**
 * EXPERIENCE
 */

export interface ResumeExperience {
  id: string;

  company: string;
  position: string;
  location?: string;

  startDate: string;
  endDate?: string;

  currentlyWorking?: boolean;

  description: string[];
}

/**
 * EDUCATION
 */

export interface ResumeEducation {
  id: string;

  institution: string;
  degree: string;
  fieldOfStudy?: string;

  startDate?: string;
  endDate?: string;

  grade?: string;
  location?: string;
}

/**
 * PROJECTS
 */

export interface ResumeProject {
  id: string;

  name: string;
  description?: string;

  technologies?: string[];

  url?: string;
  github?: string;
}

/**
 * ACHIEVEMENTS
 */

export interface ResumeAchievement {
  id: string;

  title: string;
  description?: string;

  date?: string;
}

/**
 * CERTIFICATIONS
 */

export interface ResumeCertification {
  id: string;

  name: string;
  issuer?: string;

  issueDate?: string;
  expiryDate?: string;

  credentialId?: string;
  credentialUrl?: string;
}

/**
 * AWARDS
 */

export interface ResumeAward {
  id: string;

  title: string;
  issuer?: string;

  date?: string;
  description?: string;
}

/**
 * LANGUAGES
 */

export interface ResumeLanguage {
  id: string;

  language: string;
  proficiency?: string;
}

/**
 * PUBLICATIONS
 */

export interface ResumePublication {
  id: string;

  title: string;
  publisher?: string;

  date?: string;
  url?: string;

  description?: string;
}

/**
 * VOLUNTEER
 */

export interface ResumeVolunteer {
  id: string;

  organization: string;
  role?: string;

  startDate?: string;
  endDate?: string;

  description: string[];
}

/**
 * CUSTOM SECTION
 *
 * This deliberately remains flexible.
 */
export interface ResumeCustomItem {
  id: string;

  title?: string;
  subtitle?: string;
  description?: string;

  date?: string;
  location?: string;
  url?: string;

  bullets?: string[];
}

export interface ResumeCustomContent {
  items: ResumeCustomItem[];
}

/* ============================================================
   PROFILE CONTENT
============================================================ */

export interface ResumeProfileContent extends ResumePersonalInfo {
  sections?: ResumeSection[];
}

/**
 * Content stored inside ResumeCustomization.
 */
export interface ResumeCustomizationContent
  extends ResumeProfileContent { }

/* ============================================================
   API MODELS
============================================================ */

export interface ResumeProfile
  extends ResumeProfileContent {
  id?: string;
  userId?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeCustomization {
  id: string;
  userId: string;

  content: ResumeCustomizationContent | null;

  template: string;

  createdAt: string;
  updatedAt: string;
}

/* ============================================================
   DEFAULT CONTENT
============================================================ */

export const emptyResumeContent: ResumeProfileContent = {
  fullName: "",
  email: "",
  headline: "",
  phone: "",
  location: "",

  website: "",
  linkedin: "",
  github: "",

  sections: [],
};