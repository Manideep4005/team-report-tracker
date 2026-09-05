import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  HiOutlineAcademicCap,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineFolderOpen,
  HiOutlineGlobeAlt,
  HiOutlineLink,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineViewColumns,
  HiOutlineWrenchScrewdriver,
  HiOutlineXMark,
} from "react-icons/hi2";

import { toast } from "sonner";

import {
  getResumeProfile,
  getResumeCustomization,
  createCustomizationFromProfile,
  saveResumeCustomization,
  downloadResumePdf,
} from "../../services/resume";

import {
  emptyResumeContent,
  type ResumeProfileContent,
  type ResumeSection,
  type ResumeSectionType,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeProject,
  type ResumeSkillsContent,
  type ResumeSkillCategory,
} from "../../types/resume";

import {
  createResumeId,
  createResumeSection,
  createEmptyExperience,
  createEmptyEducation,
  createEmptyProject,
  createEmptySkillCategory,
  normalizeResumeContent,
} from "../../utils/resume";

import ResumePreview from "./components/ResumePreview";

/* ============================================================
   SECTION META
============================================================ */

const SECTION_META: Record<
  ResumeSectionType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{
      size?: number | string;
      className?: string;
    }>;
  }
> = {
  SUMMARY: {
    label: "Professional Summary",
    description: "A concise introduction to your professional profile.",
    icon: HiOutlineDocumentText,
  },
  EXPERIENCE: {
    label: "Experience",
    description: "Your professional work history and accomplishments.",
    icon: HiOutlineBriefcase,
  },
  EDUCATION: {
    label: "Education",
    description: "Degrees, qualifications and academic background.",
    icon: HiOutlineAcademicCap,
  },
  SKILLS: {
    label: "Skills",
    description: "Technical and professional skills grouped by category.",
    icon: HiOutlineWrenchScrewdriver,
  },
  PROJECTS: {
    label: "Projects",
    description: "Selected projects and practical work.",
    icon: HiOutlineFolderOpen,
  },
  ACHIEVEMENTS: {
    label: "Achievements",
    description: "Professional or personal achievements.",
    icon: HiOutlineCheck,
  },
  CERTIFICATIONS: {
    label: "Certifications",
    description: "Professional certifications and credentials.",
    icon: HiOutlineCheck,
  },
  AWARDS: {
    label: "Awards",
    description: "Awards, honors and recognitions.",
    icon: HiOutlineCheck,
  },
  LANGUAGES: {
    label: "Languages",
    description: "Languages and proficiency levels.",
    icon: HiOutlineGlobeAlt,
  },
  PUBLICATIONS: {
    label: "Publications",
    description: "Articles, papers and published work.",
    icon: HiOutlineDocumentText,
  },
  VOLUNTEER: {
    label: "Volunteer Experience",
    description: "Volunteer and community experience.",
    icon: HiOutlineUser,
  },
  CUSTOM: {
    label: "Custom Section",
    description: "Create your own resume section.",
    icon: HiOutlinePlus,
  },
};

function SectionIcon({
  type,
  size = 17,
}: {
  type: ResumeSectionType;
  size?: number | string;
}) {
  const Icon = SECTION_META[type].icon;
  return <Icon size={size} />;
}

/* ============================================================
   SMALL UI HELPERS
============================================================ */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getSectionItemCount(section: ResumeSection): number {
  if (section.type === "SUMMARY") {
    return section.content ? 1 : 0;
  }

  if (section.content && typeof section.content === "object") {
    const data = section.content as Record<string, unknown>;

    if (Array.isArray(data.items)) {
      return data.items.length;
    }

    if (Array.isArray(data.categories)) {
      return data.categories.length;
    }
  }

  return 0;
}

function sectionHasFilledContent(section: ResumeSection): boolean {
  if (section.type === "SUMMARY") {
    return (
      typeof section.content === "string" &&
      section.content.trim().length > 0
    );
  }

  return getSectionItemCount(section) > 0;
}

function domId(sectionId: string) {
  return `resume-section-${sectionId}`;
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="
          min-h-11
          w-full
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-3.5
          text-sm
          text-[var(--text-primary)]
          outline-none
          transition
          placeholder:text-[var(--text-muted)]
          focus:border-indigo-500
          focus:ring-4
          focus:ring-indigo-500/10
        "
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="
          w-full
          resize-y
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-3.5
          py-3
          text-sm
          leading-6
          text-[var(--text-primary)]
          outline-none
          transition
          placeholder:text-[var(--text-muted)]
          focus:border-indigo-500
          focus:ring-4
          focus:ring-indigo-500/10
        "
      />
    </label>
  );
}

function CommaSeparatedInput({
  label,
  value,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    /*
     * Only synchronize from the outside when the normalized
     * value actually represents a different value.
     *
     * This prevents:
     *
     * React,
     *
     * from immediately becoming:
     *
     * React
     *
     * while the user is typing.
     */
    const normalizedItems = draft
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const externalItems = items
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      JSON.stringify(normalizedItems) !==
      JSON.stringify(externalItems)
    ) {
      setDraft(value);
    }
  }, [items, value]);

  function handleChange(nextValue: string) {
    /*
     * Preserve exactly what the user types.
     */
    setDraft(nextValue);

    /*
     * Store the normalized representation separately.
     */
    onChange(
      nextValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </span>

      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        className="
          min-h-11
          w-full
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-3.5
          text-sm
          text-[var(--text-primary)]
          outline-none
          transition
          placeholder:text-[var(--text-muted)]
          focus:border-indigo-500
          focus:ring-4
          focus:ring-indigo-500/10
        "
      />
    </label>
  );
}

/* ============================================================
   PERSONAL INFO (document masthead)
============================================================ */

function PersonalInfoEditor({
  content,
  update,
}: {
  content: ResumeProfileContent;
  update: (patch: Partial<ResumeProfileContent>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          value={content.fullName ?? ""}
          placeholder="John Doe"
          onChange={(fullName) => update({ fullName })}
        />

        <Field
          label="Professional headline"
          value={content.headline ?? ""}
          placeholder="Senior Software Engineer"
          onChange={(headline) => update({ headline })}
        />

        <Field
          label="Email"
          type="email"
          value={content.email ?? ""}
          placeholder="john@example.com"
          onChange={(email) => update({ email })}
        />

        <Field
          label="Phone"
          value={content.phone ?? ""}
          placeholder="+91 98765 43210"
          onChange={(phone) => update({ phone })}
        />

        <Field
          label="Location"
          value={content.location ?? ""}
          placeholder="Hyderabad, India"
          onChange={(location) => update({ location })}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            <HiOutlineLink size={16} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Professional links
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              The profiles you want visible on your resume.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Website"
            value={content.website ?? ""}
            placeholder="https://example.com"
            onChange={(website) => update({ website })}
          />

          <Field
            label="LinkedIn"
            value={content.linkedin ?? ""}
            placeholder="https://linkedin.com/in/..."
            onChange={(linkedin) => update({ linkedin })}
          />

          <Field
            label="GitHub"
            value={content.github ?? ""}
            placeholder="https://github.com/..."
            onChange={(github) => update({ github })}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY EDITOR
============================================================ */

function SummaryEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  return (
    <div className="space-y-5">
      <TextArea
        label="Summary"
        value={typeof section.content === "string" ? section.content : ""}
        placeholder="Experienced software engineer with a strong background in..."
        rows={8}
        onChange={(content) => updateSection({ content })}
      />

      <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.04] p-4">
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          Keep this section focused on your experience, strengths, domain
          expertise and the value you bring.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   EXPERIENCE EDITOR
============================================================ */

function ExperienceEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  const content =
    section.content && typeof section.content === "object"
      ? (section.content as { items?: ResumeExperience[] })
      : {};

  const items = Array.isArray(content.items) ? content.items : [];

  function updateItems(next: ResumeExperience[]) {
    updateSection({ content: { ...content, items: next } });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 transition hover:border-indigo-300/60 sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-indigo-500">
                  Position {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {item.position || item.company || "New position"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateItems(items.filter((entry) => entry.id !== item.id))
                }
                className="flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
                title="Remove"
              >
                <HiOutlineTrash size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Position"
                value={item.position}
                placeholder="Senior Software Engineer"
                onChange={(position) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, position } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Company"
                value={item.company}
                placeholder="Company name"
                onChange={(company) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, company } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Location"
                value={item.location ?? ""}
                placeholder="Hyderabad, India"
                onChange={(location) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, location } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Start date"
                value={item.startDate}
                placeholder="Jan 2024"
                onChange={(startDate) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, startDate } : entry,
                    ),
                  )
                }
              />

              <Field
                label="End date"
                value={item.endDate ?? ""}
                placeholder="Present"
                onChange={(endDate) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, endDate } : entry,
                    ),
                  )
                }
              />

              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5">
                <input
                  type="checkbox"
                  checked={Boolean(item.currentlyWorking)}
                  onChange={(event) =>
                    updateItems(
                      items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, currentlyWorking: event.target.checked }
                          : entry,
                      ),
                    )
                  }
                  className="size-4 rounded accent-indigo-600"
                />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Currently working here
                </span>
              </label>
            </div>

            <div className="mt-4">
              <TextArea
                label="Description / achievements"
                value={item.description.join("\n")}
                placeholder={
                  "Built and maintained...\nImproved performance by...\nLed..."
                }
                rows={6}
                onChange={(value) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id
                        ? {
                          ...entry,
                          description: value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        }
                        : entry,
                    ),
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <AddButton
        onClick={() => updateItems([...items, createEmptyExperience()])}
        label="Add experience"
      />
    </div>
  );
}

/* ============================================================
   EDUCATION EDITOR
============================================================ */

function EducationEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  const content =
    section.content && typeof section.content === "object"
      ? (section.content as { items?: ResumeEducation[] })
      : {};

  const items = Array.isArray(content.items) ? content.items : [];

  function updateItems(next: ResumeEducation[]) {
    updateSection({ content: { ...content, items: next } });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-500">
                Education {index + 1}
              </p>

              <button
                type="button"
                onClick={() =>
                  updateItems(items.filter((entry) => entry.id !== item.id))
                }
                className="flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
              >
                <HiOutlineTrash size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Institution"
                value={item.institution}
                placeholder="University / College"
                onChange={(institution) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, institution } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Degree"
                value={item.degree}
                placeholder="Bachelor of Technology"
                onChange={(degree) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, degree } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Field of study"
                value={item.fieldOfStudy ?? ""}
                placeholder="Computer Science"
                onChange={(fieldOfStudy) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, fieldOfStudy } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Location"
                value={item.location ?? ""}
                placeholder="Hyderabad, India"
                onChange={(location) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, location } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Start date"
                value={item.startDate ?? ""}
                placeholder="2020"
                onChange={(startDate) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, startDate } : entry,
                    ),
                  )
                }
              />

              <Field
                label="End date"
                value={item.endDate ?? ""}
                placeholder="2024"
                onChange={(endDate) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, endDate } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Grade"
                value={item.grade ?? ""}
                placeholder="8.5 CGPA"
                onChange={(grade) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, grade } : entry,
                    ),
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <AddButton
        onClick={() => updateItems([...items, createEmptyEducation()])}
        label="Add education"
      />
    </div>
  );
}

/* ============================================================
   SKILLS EDITOR
============================================================ */

function SkillsEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  const skills: ResumeSkillsContent =
    section.content &&
      typeof section.content === "object" &&
      Array.isArray((section.content as ResumeSkillsContent).categories)
      ? (section.content as ResumeSkillsContent)
      : { categories: [] };

  function updateCategories(categories: ResumeSkillCategory[]) {
    updateSection({ content: { categories } });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {skills.categories.map((category, index) => (
          <div
            key={category.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                  {index + 1}
                </div>

                <input
                  value={category.name}
                  placeholder="Category name"
                  onChange={(event) =>
                    updateCategories(
                      skills.categories.map((entry) =>
                        entry.id === category.id
                          ? { ...entry, name: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="min-h-10 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  updateCategories(
                    skills.categories.filter(
                      (entry) => entry.id !== category.id,
                    ),
                  )
                }
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
              >
                <HiOutlineTrash size={17} />
              </button>
            </div>

            <CommaSeparatedInput
              label="Skills"
              value={category.items.join(", ")}
              items={category.items}
              placeholder="React, TypeScript, Node.js, PostgreSQL"
              onChange={(items) =>
                updateCategories(
                  skills.categories.map((entry) =>
                    entry.id === category.id
                      ? {
                        ...entry,
                        items,
                      }
                      : entry,
                  ),
                )
              }
            />
          </div>
        ))}
      </div>

      <AddButton
        onClick={() =>
          updateCategories([...skills.categories, createEmptySkillCategory()])
        }
        label="Add skill category"
      />
    </div>
  );
}

/* ============================================================
   PROJECTS EDITOR
============================================================ */

function ProjectsEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  const content =
    section.content && typeof section.content === "object"
      ? (section.content as { items?: ResumeProject[] })
      : {};

  const items = Array.isArray(content.items) ? content.items : [];

  function updateItems(next: ResumeProject[]) {
    updateSection({ content: { ...content, items: next } });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-500">
                Project {index + 1}
              </p>

              <button
                type="button"
                onClick={() =>
                  updateItems(items.filter((entry) => entry.id !== item.id))
                }
                className="flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
              >
                <HiOutlineTrash size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Project name"
                value={item.name}
                placeholder="Project name"
                onChange={(name) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, name } : entry,
                    ),
                  )
                }
              />

              <Field
                label="Project URL"
                value={item.url ?? ""}
                placeholder="https://..."
                onChange={(url) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, url } : entry,
                    ),
                  )
                }
              />

              <Field
                label="GitHub"
                value={item.github ?? ""}
                placeholder="https://github.com/..."
                onChange={(github) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, github } : entry,
                    ),
                  )
                }
              />

              <CommaSeparatedInput
                label="Technologies"
                value={(item.technologies ?? []).join(", ")}
                items={item.technologies ?? []}
                placeholder="React, Node.js, PostgreSQL"
                onChange={(technologies) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id
                        ? {
                          ...entry,
                          technologies,
                        }
                        : entry,
                    ),
                  )
                }
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Description"
                value={item.description ?? ""}
                placeholder="Describe what you built, your role and the impact..."
                rows={5}
                onChange={(description) =>
                  updateItems(
                    items.map((entry) =>
                      entry.id === item.id ? { ...entry, description } : entry,
                    ),
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <AddButton
        onClick={() => updateItems([...items, createEmptyProject()])}
        label="Add project"
      />
    </div>
  );
}

/* ============================================================
   GENERIC SECTION EDITOR
============================================================ */

function GenericSectionEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  const content =
    section.content && typeof section.content === "object"
      ? (section.content as Record<string, unknown>)
      : {};

  const items = Array.isArray(content.items) ? content.items : [];

  function addItem() {
    updateSection({
      content: {
        ...content,
        items: [
          ...items,
          {
            id: createResumeId("custom-item"),
            title: "",
            subtitle: "",
            description: "",
            date: "",
            location: "",
            url: "",
            bullets: [],
          },
        ],
      },
    });
  }

  function updateItem(id: string, patch: Record<string, unknown>) {
    updateSection({
      content: {
        ...content,
        items: items.map((item) => {
          if (!item || typeof item !== "object") {
            return item;
          }
          const current = item as Record<string, unknown>;
          return current.id === id ? { ...current, ...patch } : current;
        }),
      },
    });
  }

  function removeItem(id: string) {
    updateSection({
      content: {
        ...content,
        items: items.filter((item) => {
          if (!item || typeof item !== "object") {
            return true;
          }
          return (item as Record<string, unknown>).id !== id;
        }),
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {items.map((rawItem, index) => {
          if (!rawItem || typeof rawItem !== "object") {
            return null;
          }

          const item = rawItem as Record<string, unknown>;
          const id =
            typeof item.id === "string" ? item.id : createResumeId("custom-item");

          return (
            <div
              key={id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold text-indigo-500">
                  Entry {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(id)}
                  className="flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <HiOutlineTrash size={17} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Title"
                  value={typeof item.title === "string" ? item.title : ""}
                  onChange={(title) => updateItem(id, { title })}
                />
                <Field
                  label="Subtitle"
                  value={typeof item.subtitle === "string" ? item.subtitle : ""}
                  onChange={(subtitle) => updateItem(id, { subtitle })}
                />
                <Field
                  label="Date"
                  value={typeof item.date === "string" ? item.date : ""}
                  onChange={(date) => updateItem(id, { date })}
                />
                <Field
                  label="Location"
                  value={typeof item.location === "string" ? item.location : ""}
                  onChange={(location) => updateItem(id, { location })}
                />
                <Field
                  label="URL"
                  value={typeof item.url === "string" ? item.url : ""}
                  onChange={(url) => updateItem(id, { url })}
                />
              </div>

              <div className="mt-4">
                <TextArea
                  label="Description"
                  value={
                    typeof item.description === "string" ? item.description : ""
                  }
                  rows={5}
                  onChange={(description) => updateItem(id, { description })}
                />
              </div>
            </div>
          );
        })}
      </div>

      <AddButton
        onClick={addItem}
        label={`Add ${section.title.toLowerCase()} entry`}
      />
    </div>
  );
}

/* ============================================================
   SECTION EDITOR ROUTER
============================================================ */

function SectionEditor({
  section,
  updateSection,
}: {
  section: ResumeSection;
  updateSection: (patch: Partial<ResumeSection>) => void;
}) {
  switch (section.type) {
    case "SUMMARY":
      return <SummaryEditor section={section} updateSection={updateSection} />;
    case "EXPERIENCE":
      return <ExperienceEditor section={section} updateSection={updateSection} />;
    case "EDUCATION":
      return <EducationEditor section={section} updateSection={updateSection} />;
    case "SKILLS":
      return <SkillsEditor section={section} updateSection={updateSection} />;
    case "PROJECTS":
      return <ProjectsEditor section={section} updateSection={updateSection} />;
    default:
      return (
        <GenericSectionEditor section={section} updateSection={updateSection} />
      );
  }
}

/* ============================================================
   ADD BUTTON
============================================================ */

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        min-h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-dashed
        border-indigo-400/50
        bg-indigo-500/[0.03]
        px-4
        text-sm
        font-semibold
        text-indigo-600
        transition
        hover:border-indigo-500
        hover:bg-indigo-500/[0.07]
        active:scale-[0.99]
        dark:text-indigo-300
      "
    >
      <HiOutlinePlus size={17} />
      {label}
    </button>
  );
}

/* ============================================================
   ADD SECTION MENU (modal — unchanged behaviour)
============================================================ */

function AddSectionMenu({
  onSelect,
  onClose,
}: {
  onSelect: (type: ResumeSectionType) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-[6px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Add a section"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Add a section
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Choose what you want to add to this resume.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <div className="grid max-h-[70vh] grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
          {(Object.keys(SECTION_META) as ResumeSectionType[]).map((type) => {
            const meta = SECTION_META[type];

            return (
              <button
                type="button"
                key={type}
                onClick={() => {
                  onSelect(type);
                  onClose();
                }}
                className="group flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-500/[0.04]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-indigo-600 shadow-sm transition group-hover:bg-indigo-600 group-hover:text-white dark:text-indigo-300">
                  <SectionIcon type={type} size={19} />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[var(--text-primary)]">
                    {meta.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                    {meta.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACCORDION SECTION CARD
   Each resume section is a row in the document — collapsed by
   default once filled, with its controls inline in the row
   itself rather than a separate settings panel.
============================================================ */

function AccordionSectionCard({
  section,
  isFirst,
  isLast,
  expanded,
  onToggleExpanded,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: ResumeSection;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (patch: Partial<ResumeSection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const filled = sectionHasFilledContent(section);

  return (
    <div
      id={domId(section.id)}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_-30px_rgba(15,23,42,0.35)] dark:border-white/[0.07] dark:bg-zinc-950"
    >
      {/* Row header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          <SectionIcon type={section.type} size={17} />
        </span>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <input
              value={section.title}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onUpdate({ title: event.target.value })}
              className="w-full min-w-0 truncate bg-transparent text-sm font-bold text-slate-950 outline-none dark:text-white"
            />

            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-500">
              {filled ? (
                <span className="inline-flex size-1.5 rounded-full bg-emerald-500" />
              ) : (
                <span className="inline-flex size-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              )}
              {getSectionItemCount(section)}{" "}
              {section.type === "SUMMARY" ? "content" : "entries"}
              {!section.visible && " · Hidden from PDF"}
            </span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="hidden size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-white/[0.06] sm:flex"
            title="Move up"
          >
            <HiOutlineChevronUp size={16} />
          </button>

          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="hidden size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-white/[0.06] sm:flex"
            title="Move down"
          >
            <HiOutlineChevronDown size={16} />
          </button>

          <button
            type="button"
            onClick={() => onUpdate({ visible: !section.visible })}
            className={cn(
              "hidden rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition sm:inline-flex",
              section.visible
                ? "text-emerald-600 hover:bg-emerald-500/10"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]",
            )}
          >
            {section.visible ? "Visible" : "Hidden"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
            title="Delete section"
          >
            <HiOutlineTrash size={16} />
          </button>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            title={expanded ? "Collapse" : "Expand"}
          >
            <HiOutlineChevronDown
              size={16}
              className={cn(
                "transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-5 dark:border-white/[0.05] sm:px-6 sm:py-6">
          <SectionEditor section={section} updateSection={onUpdate} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SECTION RAIL (desktop) — a slim vertical index, not a
   full sidebar. Reflects that a resume really is a sequence.
============================================================ */

function SectionRail({
  sections,
  activeSectionId,
  onJump,
  onAdd,
}: {
  sections: ResumeSection[];
  activeSectionId: string;
  onJump: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="hidden lg:sticky lg:top-24 lg:flex lg:h-fit lg:w-14 lg:flex-col lg:items-center lg:gap-1">
      <button
        type="button"
        onClick={() => onJump("__personal__")}
        className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md transition hover:bg-slate-700 dark:bg-white dark:text-slate-950"
        title="Personal information"
      >
        <HiOutlineUser size={17} />
      </button>

      <div className="my-1 h-4 w-px bg-slate-200 dark:bg-white/10" />

      {sections.map((section) => {
        const active = activeSectionId === section.id;

        return (
          <React.Fragment key={section.id}>
            <button
              type="button"
              onClick={() => onJump(section.id)}
              title={section.title}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl border transition",
                active
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400",
              )}
            >
              <SectionIcon type={section.type} size={16} />
            </button>

            <div className="h-3 w-px bg-slate-200 dark:bg-white/10" />
          </React.Fragment>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="flex size-10 items-center justify-center rounded-xl border border-dashed border-indigo-300 text-indigo-500 transition hover:bg-indigo-500/5 dark:border-indigo-400/30"
        title="Add section"
      >
        <HiOutlinePlus size={17} />
      </button>
    </div>
  );
}

/* ============================================================
   MOBILE JUMP CHIPS
============================================================ */

function MobileJumpChips({
  sections,
  activeSectionId,
  onJump,
  onAdd,
}: {
  sections: ResumeSection[];
  activeSectionId: string;
  onJump: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="lg:hidden">
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/[0.07] dark:bg-zinc-950">
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => onJump("__personal__")}
            className={cn(
              "flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[11px] font-bold transition",
              activeSectionId === "__personal__"
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.07]",
            )}
          >
            <HiOutlineUser size={15} />
            Personal
          </button>

          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              onClick={() => onJump(section.id)}
              className={cn(
                "flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[11px] font-bold transition",
                activeSectionId === section.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.07]",
              )}
            >
              <SectionIcon type={section.type} size={15} />
              <span className="max-w-[110px] truncate">{section.title}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="flex min-h-9 shrink-0 items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-3 text-[11px] font-bold text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-500/[0.08] dark:text-indigo-300"
          >
            <HiOutlinePlus size={15} />
            Add section
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PREVIEW PANEL (drawer below xl, dockable column at xl+)
============================================================ */

function PreviewPanel({
  content,
  docked,
  onClose,
}: {
  content: ResumeProfileContent;
  docked: boolean;
  onClose: () => void;
}) {
  if (docked) {
    return (
      <div className="hidden xl:block">
        <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-[#e9ebef] shadow-[0_18px_55px_-32px_rgba(15,23,42,0.35)] dark:border-white/[0.07] dark:bg-zinc-900">
          <div className="flex min-h-[56px] items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-white/[0.06] dark:bg-zinc-950">
            <p className="text-xs font-semibold text-indigo-500">
              Live preview
            </p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
              A4
            </span>
          </div>

          <div className="max-h-[calc(100vh-160px)] overflow-auto p-4">
            <ResumePreview resume={content} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/55 backdrop-blur-[6px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex h-full w-full max-w-[560px] flex-col bg-[#eef0f4] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Resume preview"
      >
        <div className="flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Resume preview</p>
            <p className="text-[10px] text-slate-500">Matches your PDF layout</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <HiOutlineXMark size={21} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-[680px] shadow-2xl">
            <ResumePreview resume={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMPLETENESS
============================================================ */

function computeCompleteness(content: ResumeProfileContent): number {
  const personalChecks = [
    Boolean(content.fullName?.trim()),
    Boolean(content.headline?.trim()),
    Boolean(content.email?.trim()),
    Boolean(content.phone?.trim()),
    Boolean(content.location?.trim()),
  ];

  const sections = content.sections ?? [];
  const sectionChecks = sections.map((section) => sectionHasFilledContent(section));
  const checks = [...personalChecks, ...sectionChecks];

  if (checks.length === 0) {
    return 0;
  }

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ============================================================
   MAIN
============================================================ */

export default function Resume() {
  const queryClient = useQueryClient();

  const [content, setContent] = useState<ResumeProfileContent>(emptyResumeContent);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string>("__personal__");
  const [hasInitializedExpanded, setHasInitializedExpanded] = useState(false);

  const [showAddSection, setShowAddSection] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocked, setPreviewDocked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  /* ------------------------------------------------------------
     MODAL BEHAVIOUR
     Preview / Add Section are true application-level overlays.
     Lock the document behind them and support Escape-to-close.
  ------------------------------------------------------------ */
  useEffect(() => {
    const modalOpen = showAddSection || previewOpen;

    if (!modalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setShowAddSection(false);
      setPreviewOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showAddSection, previewOpen]);

  const profileQuery = useQuery({
    queryKey: ["resume", "profile"],
    queryFn: async () => {
      const response = await getResumeProfile();
      return response.data.data;
    },
  });

  const customizationQuery = useQuery({
    queryKey: ["resume", "customization"],
    queryFn: async () => {
      const response = await getResumeCustomization();
      return response.data.data;
    },
  });

  /* LOAD CUSTOMIZATION */
  useEffect(() => {
    if (customizationQuery.data?.content) {
      setContent(normalizeResumeContent(customizationQuery.data.content));
    }
  }, [customizationQuery.data]);

  /* INITIALIZE WHICH SECTIONS START EXPANDED — filled ones open,
     empty ones collapsed, so the document isn't a wall of empty forms */
  useEffect(() => {
    if (hasInitializedExpanded) {
      return;
    }

    const sections = customizationQuery.data?.content?.sections ?? [];

    if (sections.length === 0) {
      return;
    }

    setHasInitializedExpanded(true);

    const filledIds = sections
      .filter((section: ResumeSection) => sectionHasFilledContent(section))
      .map((section: ResumeSection) => section.id);

    if (filledIds.length > 0) {
      setExpandedIds(new Set(filledIds));
      setActiveSectionId(filledIds[0]);
    } else {
      setExpandedIds(new Set([sections[0].id]));
      setActiveSectionId(sections[0].id);
    }
  }, [customizationQuery.data, hasInitializedExpanded]);

  /* SAVE */
  const saveMutation = useMutation({
    mutationFn: saveResumeCustomization,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["resume", "customization"],
      });
      toast.success(response.data.message || "Resume saved successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to save resume.");
    },
  });

  /* IMPORT */
  const importMutation = useMutation({
    mutationFn: createCustomizationFromProfile,
    onSuccess: async (response) => {
      const imported = response.data.data;

      if (imported?.content) {
        setContent(normalizeResumeContent(imported.content));
      }

      await queryClient.invalidateQueries({
        queryKey: ["resume", "customization"],
      });

      toast.success("Profile imported into your resume.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to import profile.");
    },
  });

  /* REPLACE FROM PROFILE */
  const replaceMutation = useMutation({
    mutationFn: async () => {
      const response = await getResumeProfile();

      if (!response.data.data) {
        throw new Error("No profile data found.");
      }

      return response.data.data;
    },
    onSuccess: (profile) => {
      setContent(normalizeResumeContent(profile));
      toast.success("Resume replaced with your latest profile.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Unable to load profile.");
    },
  });

  const sections = content.sections ?? [];

  const completeness = useMemo(() => computeCompleteness(content), [content]);

  /* SECTION HELPERS — operate by id, since the document renders
     every section inline rather than routing through one "active" one */

  function updateSectionById(id: string, patch: Partial<ResumeSection>) {
    setContent((previous) => ({
      ...previous,
      sections:
        previous.sections?.map((section) =>
          section.id === id ? { ...section, ...patch } : section,
        ) ?? [],
    }));
  }

  function updatePersonal(patch: Partial<ResumeProfileContent>) {
    setContent((previous) => ({ ...previous, ...patch }));
  }

  function addSection(type: ResumeSectionType) {
    const section = createResumeSection(type);

    setContent((previous) => ({
      ...previous,
      sections: [...(previous.sections ?? []), section],
    }));

    setExpandedIds((previous) => new Set(previous).add(section.id));
    setActiveSectionId(section.id);

    requestAnimationFrame(() => {
      document
        .getElementById(domId(section.id))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function deleteSection(id: string) {
    const deletedIndex = sections.findIndex((section) => section.id === id);
    const nextSections = sections.filter((section) => section.id !== id);

    setContent((previous) => ({
      ...previous,
      sections: nextSections,
    }));

    setExpandedIds((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });

    if (activeSectionId === id) {
      const fallbackSection =
        nextSections[Math.min(Math.max(deletedIndex, 0), nextSections.length - 1)];

      setActiveSectionId(fallbackSection?.id ?? "__personal__");
    }
  }

  function moveSection(id: string, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.id === id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= sections.length) {
      return;
    }

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];

    setContent((previous) => ({ ...previous, sections: next }));
  }

  function toggleExpanded(id: string) {
    setActiveSectionId(id);

    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function jumpTo(id: string) {
    setActiveSectionId(id);

    if (id !== "__personal__") {
      setExpandedIds((previous) => new Set(previous).add(id));
    }

    requestAnimationFrame(() => {
      const targetId = id === "__personal__" ? "resume-masthead" : domId(id);
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function save() {
    saveMutation.mutate(content);
  }

  async function download() {
    try {
      setIsDownloading(true);

      const response = await downloadResumePdf();
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;

      const name = content.fullName?.trim()?.replace(/\s+/g, "-") || "resume";
      anchor.download = `${name}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Resume downloaded successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to download resume.");
    } finally {
      setIsDownloading(false);
    }
  }

  /* LOADING */
  if (profileQuery.isLoading || customizationQuery.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-600/10">
            <HiOutlineArrowPath size={24} className="animate-spin text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Preparing Resume Studio…
          </p>
        </div>
      </div>
    );
  }

  /* ERROR */
  if (profileQuery.isError || customizationQuery.isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-xl">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <HiOutlineDocumentText size={24} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[var(--text-primary)]">
            Unable to load Resume Studio
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Something went wrong while loading your resume.
          </p>

          <button
            type="button"
            onClick={() => {
              profileQuery.refetch();
              customizationQuery.refetch();
            }}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <HiOutlineArrowPath size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* NO CUSTOMIZATION */
  if (!customizationQuery.data) {
    const hasProfile = Boolean(profileQuery.data);

    return (
      <main className="min-h-full w-full p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-slate-900/5">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-7 sm:p-10 lg:p-14">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <HiOutlineDocumentText size={24} />
                </div>

                <p className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-indigo-500">
                  <HiOutlineSparkles size={15} />
                  Resume Studio
                </p>

                <h1 className="mt-2 max-w-lg text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  Build a resume that feels like you.
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                  Start with your master profile and turn it into a focused,
                  customizable resume for each opportunity.
                </p>

                {!hasProfile ? (
                  <div className="mt-7 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700 dark:text-amber-300">
                    Complete your Profile first. Your resume will be created
                    from that information.
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={importMutation.isPending}
                    onClick={() => importMutation.mutate()}
                    className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {importMutation.isPending ? (
                      <HiOutlineArrowPath size={18} className="animate-spin" />
                    ) : (
                      <HiOutlinePlus size={18} />
                    )}
                    {importMutation.isPending ? "Creating..." : "Create from profile"}
                  </button>
                )}
              </div>

              <div className="hidden min-h-[440px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 lg:block">
                <div className="flex h-full items-center justify-center">
                  <div className="w-full max-w-sm rounded-xl bg-white p-7 shadow-2xl">
                    <div className="h-3 w-32 rounded-full bg-slate-900" />
                    <div className="mt-2 h-2 w-24 rounded-full bg-slate-200" />
                    <div className="mt-7 h-2 w-full rounded-full bg-slate-100" />
                    <div className="mt-2 h-2 w-5/6 rounded-full bg-slate-100" />
                    <div className="mt-2 h-2 w-4/6 rounded-full bg-slate-100" />
                    <div className="mt-7 h-2 w-28 rounded-full bg-slate-300" />
                    <div className="mt-4 space-y-2">
                      <div className="h-2 rounded-full bg-slate-100" />
                      <div className="h-2 w-11/12 rounded-full bg-slate-100" />
                      <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-7 h-2 w-24 rounded-full bg-slate-300" />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-7 rounded bg-slate-100" />
                      <div className="h-7 rounded bg-slate-100" />
                      <div className="h-7 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* BUILDER */
  return (
    <main className="min-h-full w-full bg-[#f5f6fa] text-slate-900 dark:bg-[#09090b] dark:text-white">
      {/* HEADER */}
      <header className="relative z-10 border-b border-slate-200 bg-white/95 dark:border-white/[0.07] dark:bg-zinc-950/95">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-950/10 dark:from-white dark:to-zinc-200 dark:text-slate-950">
              <HiOutlineDocumentText size={19} />
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-950" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-slate-950 dark:text-white">
                Resume Studio
              </h1>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-zinc-500">
                {content.fullName || "Untitled resume"} · {completeness}% complete
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => { setPreviewDocked((value) => !value); setPreviewOpen(false); }}
              className={cn(
                "hidden min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold shadow-sm transition xl:inline-flex",
                previewDocked
                  ? "border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.07]",
              )}
              title="Toggle split view"
            >
              <HiOutlineViewColumns size={15} />
              Split view
            </button>

            <button
              type="button"
              onClick={() => replaceMutation.mutate()}
              disabled={replaceMutation.isPending}
              className="hidden min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.07] md:inline-flex"
            >
              <HiOutlineArrowPath
                size={14}
                className={replaceMutation.isPending ? "animate-spin" : ""}
              />
              Sync profile
            </button>

            <button
              type="button"
              onClick={() => { setPreviewDocked(false); setPreviewOpen(true); }}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.07]",
                previewDocked && "xl:hidden",
              )}
            >
              <HiOutlineEye size={15} />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              type="button"
              onClick={download}
              disabled={isDownloading}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.07]"
            >
              {isDownloading ? (
                <HiOutlineArrowPath size={15} className="animate-spin" />
              ) : (
                <HiOutlineArrowDownTray size={15} />
              )}
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saveMutation.isPending}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-zinc-200"
            >
              {saveMutation.isPending ? (
                <HiOutlineArrowPath size={15} className="animate-spin" />
              ) : (
                <HiOutlineCheck size={15} />
              )}
              <span>{saveMutation.isPending ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>

        {/* thin completeness thread under the header */}
        <div className="h-[3px] w-full bg-slate-100 dark:bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-6">
        <div
          className={cn(
            "mx-auto flex gap-6",
            previewDocked ? "max-w-none xl:items-start" : "max-w-[760px]",
          )}
        >
          {/* rail */}
          <SectionRail
            sections={sections}
            activeSectionId={activeSectionId}
            onJump={jumpTo}
            onAdd={() => setShowAddSection(true)}
          />

          {/* document column */}
          <div className={cn("min-w-0 flex-1 space-y-4", previewDocked && "xl:max-w-[720px]")}>
            <MobileJumpChips
              sections={sections}
              activeSectionId={activeSectionId}
              onJump={jumpTo}
              onAdd={() => setShowAddSection(true)}
            />

            {/* masthead — personal info, edited directly in place */}
            <div
              id="resume-masthead"
              className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-[0_14px_45px_-30px_rgba(15,23,42,0.35)] dark:border-white/[0.07] dark:from-zinc-950 dark:to-zinc-950"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/[0.05]">
                <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <HiOutlineUser size={17} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    Personal information
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                    The header block of your document
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <PersonalInfoEditor content={content} update={updatePersonal} />
              </div>
            </div>

            {/* resume sections, in document order */}
            {sections.map((section, index) => (
              <AccordionSectionCard
                key={section.id}
                section={section}
                index={index}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                expanded={expandedIds.has(section.id)}
                onToggleExpanded={() => toggleExpanded(section.id)}
                onUpdate={(patch) => updateSectionById(section.id, patch)}
                onDelete={() => deleteSection(section.id)}
                onMoveUp={() => moveSection(section.id, -1)}
                onMoveDown={() => moveSection(section.id, 1)}
              />
            ))}

            {sections.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-12">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                  <HiOutlinePlus size={24} />
                </div>

                <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Start building your resume
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-500">
                  Add the sections that matter for this application — they'll
                  appear here in the order you arrange them.
                </p>

                <button
                  type="button"
                  onClick={() => setShowAddSection(true)}
                  className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                >
                  <HiOutlinePlus size={17} />
                  Add your first section
                </button>
              </div>
            )}

            <AddButton
              onClick={() => setShowAddSection(true)}
              label="Add another section"
            />
          </div>

          {previewDocked && (
            <div className="w-[420px] shrink-0">
              <PreviewPanel content={content} docked onClose={() => setPreviewDocked(false)} />
            </div>
          )}
        </div>
      </div>

      {showAddSection && (
        <AddSectionMenu onSelect={addSection} onClose={() => setShowAddSection(false)} />
      )}

      {previewOpen && (
        <PreviewPanel
          content={content}
          docked={false}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </main>
  );
}