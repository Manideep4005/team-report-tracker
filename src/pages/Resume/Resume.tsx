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
  HiOutlineArrowUpRight,
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineFolderOpen,
  HiOutlineGlobeAlt,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUser,
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
import PageTitle from "../../components/PageTitle";

/* ============================================================
   THEME
   A resume is a manuscript under construction — this treats the
   screen like a draft on a writing desk rather than a SaaS panel:
   warm paper, an ink/brass palette, a serif used only where the
   document's own "voice" appears (names, headings), and a plain
   working sans everywhere the interface is speaking.
============================================================ */

const THEME_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,380;0,9..144,480;0,9..144,600;1,9..144,480&family=Inter:wght@400;500;600&display=swap');

.rs-scope {
  --rs-paper: #FAF6EC;
  --rs-paper-raised: #F1E9D6;
  --rs-ink: #262218;
  --rs-ink-soft: #756B57;
  --rs-ink-faint: #ABA089;
  --rs-rule: #E0D3B4;
  --rs-rule-strong: #C7B486;
  --rs-brass: #93611F;
  --rs-brass-strong: #6E4A18;
  --rs-brass-wash: rgba(147, 97, 31, 0.08);
  --rs-moss: #4F6647;
  --rs-rust: #954632;
  --rs-shadow: rgba(38, 34, 24, 0.14);
  font-family: 'Inter', sans-serif;
  color: var(--rs-ink);
}

.dark .rs-scope {
  --rs-paper: #1A1812;
  --rs-paper-raised: #23201A;
  --rs-ink: #EEE7D6;
  --rs-ink-soft: #A79C85;
  --rs-ink-faint: #6E6551;
  --rs-rule: #38321F;
  --rs-rule-strong: #4C4526;
  --rs-brass: #D6A75A;
  --rs-brass-strong: #EAC482;
  --rs-brass-wash: rgba(214, 167, 90, 0.1);
  --rs-moss: #8FA57F;
  --rs-rust: #CC7C63;
  --rs-shadow: rgba(0, 0, 0, 0.4);
}

.rs-serif {
  font-family: 'Fraunces', serif;
}

.rs-scope input::placeholder,
.rs-scope textarea::placeholder {
  color: var(--rs-ink-faint);
}

.rs-scrollbar::-webkit-scrollbar {
  height: 0px;
  width: 0px;
}
`;

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
  size = 16,
}: {
  type: ResumeSectionType;
  size?: number | string;
}) {
  const Icon = SECTION_META[type].icon;
  return <Icon size={size} />;
}

/* ============================================================
   SMALL HELPERS
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

function ordinal(index: number) {
  return String(index + 1).padStart(2, "0");
}

/* ============================================================
   FIELDS — underlined, written-on-the-page inputs rather than
   boxed form controls.
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
      <span className="mb-1 block text-[11.5px] font-medium text-[var(--rs-ink-soft)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-9
          w-full
          border-0
          border-b
          border-[var(--rs-rule)]
          bg-transparent
          px-0
          text-[14px]
          text-[var(--rs-ink)]
          outline-none
          transition
          focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]
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
      <span className="mb-1.5 block text-[11.5px] font-medium text-[var(--rs-ink-soft)]">
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
          rounded-[4px]
          border
          border-[var(--rs-rule)]
          bg-[var(--rs-paper)]
          px-3
          py-2.5
          text-[14px]
          leading-6
          text-[var(--rs-ink)]
          outline-none
          transition
          focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]
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
    setDraft(nextValue);

    onChange(
      nextValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[var(--rs-ink-soft)]">
        {label}
      </span>

      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => handleChange(event.target.value)}
        className="
          h-9
          w-full
          border-0
          border-b
          border-[var(--rs-rule)]
          bg-transparent
          px-0
          text-[14px]
          text-[var(--rs-ink)]
          outline-none
          transition
          focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]
        "
      />
    </label>
  );
}

/* ============================================================
   PERSONAL INFO — the title page of the manuscript
============================================================ */

function PersonalInfoEditor({
  content,
  update,
}: {
  content: ResumeProfileContent;
  update: (patch: Partial<ResumeProfileContent>) => void;
}) {
  return (
    <div>
      <input
        value={content.fullName ?? ""}
        placeholder="Your name"
        onChange={(event) => update({ fullName: event.target.value })}
        className="rs-serif w-full border-0 bg-transparent p-0 text-[34px] font-medium leading-tight text-[var(--rs-ink)] outline-none sm:text-[44px]"
      />

      <input
        value={content.headline ?? ""}
        placeholder="Professional headline"
        onChange={(event) => update({ headline: event.target.value })}
        className="rs-serif mt-2 w-full border-0 bg-transparent p-0 text-[16px] italic text-[var(--rs-ink-soft)] outline-none sm:text-[18px]"
      />

      <div className="mt-6 flex flex-wrap items-center gap-x-1 gap-y-2 text-[13.5px]">
        <input
          type="email"
          value={content.email ?? ""}
          placeholder="email@example.com"
          onChange={(event) => update({ email: event.target.value })}
          className="min-w-[120px] max-w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[var(--rs-ink)] outline-none transition focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
        />
        <span className="px-1.5 text-[var(--rs-ink-faint)]">&middot;</span>
        <input
          value={content.phone ?? ""}
          placeholder="Phone number"
          onChange={(event) => update({ phone: event.target.value })}
          className="min-w-[110px] max-w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[var(--rs-ink)] outline-none transition focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
        />
        <span className="px-1.5 text-[var(--rs-ink-faint)]">&middot;</span>
        <input
          value={content.location ?? ""}
          placeholder="City, Country"
          onChange={(event) => update({ location: event.target.value })}
          className="min-w-[130px] max-w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[var(--rs-ink)] outline-none transition focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2 text-[13.5px] text-[var(--rs-brass)]">
        <input
          value={content.website ?? ""}
          placeholder="Website"
          onChange={(event) => update({ website: event.target.value })}
          className="min-w-[100px] max-w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[var(--rs-brass)] outline-none transition focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
        />
        <span className="px-1.5 text-[var(--rs-ink-faint)]">&middot;</span>
        <input
          value={content.linkedin ?? ""}
          placeholder="LinkedIn"
          onChange={(event) => update({ linkedin: event.target.value })}
          className="min-w-[100px] max-w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[var(--rs-brass)] outline-none transition focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
        />
        <span className="px-1.5 text-[var(--rs-ink-faint)]">&middot;</span>
        <input
          value={content.github ?? ""}
          placeholder="GitHub"
          onChange={(event) => update({ github: event.target.value })}
          className="min-w-[100px] max-w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[var(--rs-brass)] outline-none transition focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
        />
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
    <div className="space-y-4">
      <TextArea
        label="Summary"
        value={typeof section.content === "string" ? section.content : ""}
        placeholder="Experienced software engineer with a strong background in..."
        rows={7}
        onChange={(content) => updateSection({ content })}
      />

      <p className="border-l-2 border-[var(--rs-brass)] pl-3 text-[12.5px] leading-5 text-[var(--rs-ink-soft)]">
        Keep this focused on your experience, strengths, domain expertise and
        the value you bring.
      </p>
    </div>
  );
}

/* ============================================================
   ENTRY CARD — shared shell for repeatable items (experience,
   education, projects, custom). Flat, ruled, no drop shadows.
============================================================ */

function EntryCard({
  eyebrow,
  onRemove,
  children,
}: {
  eyebrow: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[4px] border border-[var(--rs-rule)] bg-[var(--rs-paper)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wide text-[var(--rs-brass)]">
          {eyebrow}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="flex size-7 items-center justify-center rounded-[4px] text-[var(--rs-ink-faint)] transition hover:bg-[var(--rs-rust)]/10 hover:text-[var(--rs-rust)]"
          title="Remove"
        >
          <HiOutlineTrash size={15} />
        </button>
      </div>

      {children}
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
    <div className="space-y-4">
      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          eyebrow={item.position || item.company || `Position ${index + 1}`}
          onRemove={() =>
            updateItems(items.filter((entry) => entry.id !== item.id))
          }
        >
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

            <label className="flex h-9 items-center gap-2 self-end pb-0.5">
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
                className="size-3.5 accent-[var(--rs-brass)]"
              />
              <span className="text-[13px] text-[var(--rs-ink-soft)]">
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
              rows={5}
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
        </EntryCard>
      ))}

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
    <div className="space-y-4">
      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          eyebrow={item.institution || `Education ${index + 1}`}
          onRemove={() =>
            updateItems(items.filter((entry) => entry.id !== item.id))
          }
        >
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
        </EntryCard>
      ))}

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
    <div className="space-y-4">
      {skills.categories.map((category, index) => (
        <div
          key={category.id}
          className="rounded-[4px] border border-[var(--rs-rule)] bg-[var(--rs-paper)] p-4 sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="rs-serif shrink-0 text-[13px] text-[var(--rs-ink-faint)]">
                {ordinal(index)}
              </span>

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
                className="h-8 min-w-0 flex-1 border-0 border-b border-[var(--rs-rule)] bg-transparent px-0 text-[14px] font-medium text-[var(--rs-ink)] outline-none focus:border-[var(--rs-brass-strong)] focus:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--rs-brass-wash)]"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                updateCategories(
                  skills.categories.filter((entry) => entry.id !== category.id),
                )
              }
              className="flex size-7 shrink-0 items-center justify-center rounded-[4px] text-[var(--rs-ink-faint)] transition hover:bg-[var(--rs-rust)]/10 hover:text-[var(--rs-rust)]"
            >
              <HiOutlineTrash size={15} />
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
                  entry.id === category.id ? { ...entry, items } : entry,
                ),
              )
            }
          />
        </div>
      ))}

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
    <div className="space-y-4">
      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          eyebrow={item.name || `Project ${index + 1}`}
          onRemove={() =>
            updateItems(items.filter((entry) => entry.id !== item.id))
          }
        >
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
                    entry.id === item.id ? { ...entry, technologies } : entry,
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
              rows={4}
              onChange={(description) =>
                updateItems(
                  items.map((entry) =>
                    entry.id === item.id ? { ...entry, description } : entry,
                  ),
                )
              }
            />
          </div>
        </EntryCard>
      ))}

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
    <div className="space-y-4">
      {items.map((rawItem, index) => {
        if (!rawItem || typeof rawItem !== "object") {
          return null;
        }

        const item = rawItem as Record<string, unknown>;
        const id =
          typeof item.id === "string" ? item.id : createResumeId("custom-item");

        return (
          <EntryCard
            key={id}
            eyebrow={
              typeof item.title === "string" && item.title
                ? item.title
                : `Entry ${index + 1}`
            }
            onRemove={() => removeItem(id)}
          >
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
                rows={4}
                onChange={(description) => updateItem(id, { description })}
              />
            </div>
          </EntryCard>
        );
      })}

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
        h-9
        items-center
        justify-center
        gap-1.5
        rounded-[4px]
        border
        border-dashed
        border-[var(--rs-rule-strong)]
        px-3.5
        text-[13px]
        font-medium
        text-[var(--rs-brass)]
        transition
        hover:border-[var(--rs-brass)]
        hover:bg-[var(--rs-brass-wash)]
      "
    >
      <HiOutlinePlus size={15} />
      {label}
    </button>
  );
}

/* ============================================================
   ADD SECTION MENU — a small catalogue of section types
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
      className="rs-scope fixed inset-0 z-[9999] flex items-end justify-center bg-[var(--rs-ink)]/50 p-3 backdrop-blur-[3px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[6px] border border-[var(--rs-rule)] bg-[var(--rs-paper)] shadow-[0_20px_60px_var(--rs-shadow)]"
        role="dialog"
        aria-modal="true"
        aria-label="Add a section"
      >
        <div className="flex items-center justify-between border-b border-[var(--rs-rule)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="rs-serif text-[19px] text-[var(--rs-ink)]">
              Add a section
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[var(--rs-ink-soft)]">
              Choose what belongs in this draft.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-[4px] text-[var(--rs-ink-soft)] hover:bg-[var(--rs-paper-raised)]"
          >
            <HiOutlineXMark size={19} />
          </button>
        </div>

        <div className="grid max-h-[70vh] grid-cols-1 gap-px overflow-y-auto bg-[var(--rs-rule)] p-px sm:grid-cols-2">
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
                className="group flex items-start gap-3 bg-[var(--rs-paper)] p-4 text-left transition hover:bg-[var(--rs-brass-wash)]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[4px] border border-[var(--rs-rule)] text-[var(--rs-brass)] transition group-hover:border-[var(--rs-brass)]">
                  <SectionIcon type={type} size={17} />
                </span>

                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-[var(--rs-ink)]">
                    {meta.label}
                  </span>
                  <span className="mt-1 block text-[12px] leading-5 text-[var(--rs-ink-soft)]">
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
   SECTION BLOCK — a numbered entry in the document sequence.
   Ruled rather than boxed, since the resume reads as one
   continuous manuscript, not a stack of cards.
============================================================ */

function SectionBlock({
  section,
  index,
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
      className="scroll-mt-6 border-t border-[var(--rs-rule)]"
    >
      <div className="flex items-start gap-3 py-4 sm:gap-4">
        <span className="rs-serif hidden pt-0.5 text-[15px] text-[var(--rs-ink-faint)] sm:block">
          {ordinal(index)}
        </span>

        <span className="flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-[var(--rs-rule)] text-[var(--rs-brass)] sm:hidden">
          <SectionIcon type={section.type} size={15} />
        </span>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
        >
          <input
            value={section.title}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onUpdate({ title: event.target.value })}
            className="rs-serif w-full min-w-0 truncate border-0 bg-transparent p-0 text-[19px] text-[var(--rs-ink)] outline-none"
          />

          <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--rs-ink-soft)]">
            <span
              className={cn(
                "inline-flex size-1.5 rounded-full",
                filled ? "bg-[var(--rs-moss)]" : "bg-[var(--rs-ink-faint)]",
              )}
            />
            {getSectionItemCount(section)}{" "}
            {section.type === "SUMMARY" ? "content" : "entries"}
            {!section.visible && " · hidden from PDF"}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="hidden size-7 items-center justify-center rounded-[4px] text-[var(--rs-ink-faint)] transition hover:bg-[var(--rs-paper-raised)] disabled:opacity-20 sm:flex"
            title="Move up"
          >
            <HiOutlineChevronUp size={15} />
          </button>

          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="hidden size-7 items-center justify-center rounded-[4px] text-[var(--rs-ink-faint)] transition hover:bg-[var(--rs-paper-raised)] disabled:opacity-20 sm:flex"
            title="Move down"
          >
            <HiOutlineChevronDown size={15} />
          </button>

          <button
            type="button"
            onClick={() => onUpdate({ visible: !section.visible })}
            className="flex size-7 items-center justify-center rounded-[4px] text-[var(--rs-ink-soft)] transition hover:bg-[var(--rs-paper-raised)]"
            title={section.visible ? "Visible in PDF" : "Hidden from PDF"}
          >
            {section.visible ? (
              <HiOutlineEye size={15} />
            ) : (
              <HiOutlineEyeSlash size={15} />
            )}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex size-7 items-center justify-center rounded-[4px] text-[var(--rs-ink-faint)] transition hover:bg-[var(--rs-rust)]/10 hover:text-[var(--rs-rust)]"
            title="Delete section"
          >
            <HiOutlineTrash size={15} />
          </button>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex size-7 items-center justify-center rounded-[4px] text-[var(--rs-ink-soft)] transition hover:bg-[var(--rs-paper-raised)]"
            title={expanded ? "Collapse" : "Expand"}
          >
            <HiOutlineChevronDown
              size={15}
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pb-6 pl-0 sm:pl-8">
          <SectionEditor section={section} updateSection={onUpdate} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SECTION TABS — one horizontal, scrollable strip used at every
   breakpoint (replaces a separate desktop rail / mobile chip
   pattern) so navigation reads as chapter tabs on a folder, not
   an app sidebar.
============================================================ */

function SectionTabs({
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
    <div className="rs-section-nav rs-scrollbar -mx-5 flex gap-2 overflow-x-auto rounded-[8px] border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] p-1.5 px-2 sm:mx-0 sm:px-2">
      <button
        type="button"
        onClick={() => onJump("__personal__")}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-[6px] border px-3 py-2.5 text-[12.5px] font-medium transition-all duration-200",
          activeSectionId === "__personal__"
            ? "border-[var(--rs-brass)] bg-[var(--rs-paper)] text-[var(--rs-ink)] shadow-[0_2px_8px_var(--rs-shadow)]"
            : "border-transparent text-[var(--rs-ink-soft)] hover:border-[var(--rs-rule-strong)] hover:bg-[var(--rs-paper)] hover:text-[var(--rs-ink)]",
        )}
      >
        <HiOutlineUser size={14} />
        Personal
      </button>

      {sections.map((section) => {
        const active = activeSectionId === section.id;

        return (
          <button
            type="button"
            key={section.id}
            onClick={() => onJump(section.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[6px] border px-3 py-2.5 text-[12.5px] font-medium transition-all duration-200",
              active
                ? "border-[var(--rs-brass)] bg-[var(--rs-paper)] text-[var(--rs-ink)] shadow-[0_2px_8px_var(--rs-shadow)]"
                : "border-transparent text-[var(--rs-ink-soft)] hover:border-[var(--rs-rule-strong)] hover:bg-[var(--rs-paper)] hover:text-[var(--rs-ink)]",
            )}
          >
            <SectionIcon type={section.type} size={14} />
            <span className="max-w-[130px] truncate">{section.title}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="flex shrink-0 items-center gap-1.5 rounded-[6px] border border-dashed border-[var(--rs-rule-strong)] px-3 py-2.5 text-[12.5px] font-semibold text-[var(--rs-brass)] transition-all duration-200 hover:border-[var(--rs-brass)] hover:bg-[var(--rs-brass-wash)] hover:text-[var(--rs-brass-strong)]"
      >
        <HiOutlinePlus size={14} />
        Add section
      </button>
    </div>
  );
}

/* ============================================================
   PREVIEW PANEL — a loose page laid beside/over the draft.
   Never sticky: it scrolls with the page like everything else.
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
        <div className="overflow-hidden rounded-[6px] border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)]">
          <div className="flex h-12 items-center justify-between border-b border-[var(--rs-rule)] bg-[var(--rs-paper)] px-4">
            <p className="text-[11.5px] font-semibold text-[var(--rs-brass)]">
              Live preview
            </p>
            <span className="rounded-[4px] border border-[var(--rs-rule)] px-2 py-0.5 text-[10px] font-medium text-[var(--rs-ink-soft)]">
              A4
            </span>
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-auto p-4">
            <div className="shadow-[0_16px_40px_var(--rs-shadow)]">
              <ResumePreview resume={content} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rs-scope fixed inset-0 z-[9999] flex justify-end bg-[var(--rs-ink)]/50 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex h-full w-full max-w-[560px] flex-col bg-[var(--rs-paper-raised)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Resume preview"
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--rs-rule)] bg-[var(--rs-paper)] px-4">
          <div>
            <p className="rs-serif text-[15px] text-[var(--rs-ink)]">
              Resume preview
            </p>
            <p className="text-[10.5px] text-[var(--rs-ink-soft)]">
              Matches your PDF layout
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-[4px] text-[var(--rs-ink-soft)] hover:bg-[var(--rs-paper-raised)]"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-[680px] shadow-[0_16px_40px_var(--rs-shadow)]">
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

  /* INITIALIZE WHICH SECTIONS START EXPANDED */
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
      <div className="rs-scope flex min-h-[70vh] items-center justify-center bg-[var(--rs-paper)]">
        <style>{THEME_STYLES}</style>
        <div className="flex flex-col items-center gap-4">
          <HiOutlineArrowPath size={22} className="animate-spin text-[var(--rs-brass)]" />
          <p className="rs-serif text-[15px] italic text-[var(--rs-ink-soft)]">
            Preparing your draft…
          </p>
        </div>
      </div>
    );
  }

  /* ERROR */
  if (profileQuery.isError || customizationQuery.isError) {
    return (
      <div className="rs-scope flex min-h-[70vh] items-center justify-center bg-[var(--rs-paper)] px-5">
        <style>{THEME_STYLES}</style>
        <div className="w-full max-w-md rounded-[6px] border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] p-8 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-[4px] border border-[var(--rs-rust)]/40 text-[var(--rs-rust)]">
            <HiOutlineDocumentText size={22} />
          </div>

          <h2 className="rs-serif mt-5 text-[20px] text-[var(--rs-ink)]">
            The draft won&rsquo;t open
          </h2>

          <p className="mt-2 text-[13.5px] leading-6 text-[var(--rs-ink-soft)]">
            Something went wrong while loading your resume.
          </p>

          <button
            type="button"
            onClick={() => {
              profileQuery.refetch();
              customizationQuery.refetch();
            }}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-[4px] bg-[var(--rs-ink)] px-5 text-[13.5px] font-medium text-[var(--rs-paper)] transition hover:bg-[var(--rs-brass-strong)]"
          >
            <HiOutlineArrowPath size={15} />
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
      <main className="rs-scope min-h-full w-full bg-[var(--rs-paper)] p-4 sm:p-6 lg:p-8">
        <style>{THEME_STYLES}</style>
        <PageTitle title="Resume Editor" />

        <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[8px] border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)]">
            <div className="p-8 text-center sm:p-14">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--rs-brass)]" style={{ letterSpacing: "0.08em" }}>
                Resume Studio
              </p>

              <h1 className="rs-serif mx-auto mt-3 max-w-xl text-[32px] leading-[1.15] text-[var(--rs-ink)] sm:text-[40px]">
                Every resume starts as a blank page.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-[var(--rs-ink-soft)]">
                Start from your master profile and shape it into a focused
                draft for this opportunity.
              </p>

              {!hasProfile ? (
                <div className="mx-auto mt-8 max-w-sm rounded-[4px] border border-[var(--rs-rust)]/30 bg-[var(--rs-rust)]/10 p-4 text-[13px] leading-6 text-[var(--rs-rust)]">
                  Complete your Profile first — your resume is built from
                  that information.
                </div>
              ) : (
                <button
                  type="button"
                  disabled={importMutation.isPending}
                  onClick={() => importMutation.mutate()}
                  className="mt-8 inline-flex h-11 items-center gap-2 rounded-[4px] bg-[var(--rs-ink)] px-6 text-[13.5px] font-medium text-[var(--rs-paper)] transition hover:bg-[var(--rs-brass-strong)] disabled:opacity-60"
                >
                  {importMutation.isPending ? (
                    <HiOutlineArrowPath size={16} className="animate-spin" />
                  ) : (
                    <HiOutlinePencil size={16} />
                  )}
                  {importMutation.isPending ? "Creating…" : "Start from profile"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* BUILDER */
  return (
    <main className="rs-scope min-h-full w-full bg-[var(--rs-paper)]">
      <style>{THEME_STYLES}</style>
      <PageTitle title="Resume Editor" />

      {/* masthead band — scrolls away with the page, not sticky */}
      <section className="border-b border-[var(--rs-rule)] bg-[var(--rs-paper-raised)]">
        <div className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <PersonalInfoEditor content={content} update={updatePersonal} />
            </div>

            <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
              <div className="text-left lg:text-right">
                <p className="rs-serif text-[26px] text-[var(--rs-ink)]">
                  {completeness}<span className="text-[15px] text-[var(--rs-ink-faint)]">/100</span>
                </p>
                <p className="text-[11px] text-[var(--rs-ink-soft)]">draft complete</p>
                <div className="mt-1.5 h-[3px] w-24 bg-[var(--rs-rule)] lg:ml-auto">
                  <div
                    className="h-full bg-[var(--rs-brass)] transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPreviewDocked((value) => !value);
                setPreviewOpen(false);
              }}
              className={cn(
                "hidden h-9 items-center gap-1.5 rounded-[4px] border px-3.5 text-[12.5px] font-medium transition xl:inline-flex",
                previewDocked
                  ? "border-[var(--rs-brass)] bg-[var(--rs-brass-wash)] text-[var(--rs-brass-strong)]"
                  : "border-[var(--rs-rule)] text-[var(--rs-ink-soft)] hover:border-[var(--rs-rule-strong)] hover:text-[var(--rs-ink)]",
              )}
            >
              <HiOutlineArrowUpRight size={14} />
              Split view
            </button>

            <button
              type="button"
              onClick={() => replaceMutation.mutate()}
              disabled={replaceMutation.isPending}
              className="hidden h-9 items-center gap-1.5 rounded-[4px] border border-[var(--rs-rule)] px-3.5 text-[12.5px] font-medium text-[var(--rs-ink-soft)] transition hover:border-[var(--rs-rule-strong)] hover:text-[var(--rs-ink)] disabled:opacity-50 md:inline-flex"
            >
              <HiOutlineArrowPath
                size={13}
                className={replaceMutation.isPending ? "animate-spin" : ""}
              />
              Sync profile
            </button>

            <button
              type="button"
              onClick={() => {
                setPreviewDocked(false);
                setPreviewOpen(true);
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-[var(--rs-rule)] px-3.5 text-[12.5px] font-medium text-[var(--rs-ink-soft)] transition hover:border-[var(--rs-rule-strong)] hover:text-[var(--rs-ink)]",
                previewDocked && "xl:hidden",
              )}
            >
              <HiOutlineEye size={14} />
              Preview
            </button>

            <button
              type="button"
              onClick={download}
              disabled={isDownloading}
              className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-[var(--rs-rule)] px-3.5 text-[12.5px] font-medium text-[var(--rs-ink-soft)] transition hover:border-[var(--rs-rule-strong)] hover:text-[var(--rs-ink)] disabled:opacity-50"
            >
              {isDownloading ? (
                <HiOutlineArrowPath size={14} className="animate-spin" />
              ) : (
                <HiOutlineArrowDownTray size={14} />
              )}
              Export PDF
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saveMutation.isPending}
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[var(--rs-ink)] px-4 text-[12.5px] font-semibold text-[var(--rs-paper)] transition hover:bg-[var(--rs-brass-strong)] disabled:opacity-60"
            >
              {saveMutation.isPending ? (
                <HiOutlineArrowPath size={14} className="animate-spin" />
              ) : (
                <HiOutlineCheck size={14} />
              )}
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </section>

      {/* workspace */}
      <div className="mx-auto w-full max-w-[860px] px-5 pb-16 sm:px-8">
        <div
          id="resume-masthead"
          className={cn("flex gap-10", previewDocked && "xl:max-w-none")}
        >
          <div className="min-w-0 flex-1">
            <div className="pt-4">
              <SectionTabs
                sections={sections}
                activeSectionId={activeSectionId}
                onJump={jumpTo}
                onAdd={() => setShowAddSection(true)}
              />
            </div>

            {sections.map((section, index) => (
              <SectionBlock
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
              <div className="border-t border-[var(--rs-rule)] py-14 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-[4px] border border-dashed border-[var(--rs-rule-strong)] text-[var(--rs-brass)]">
                  <HiOutlinePlus size={20} />
                </div>

                <h2 className="rs-serif mt-5 text-[22px] text-[var(--rs-ink)]">
                  Start building your resume
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-[var(--rs-ink-soft)]">
                  Add the sections that matter for this application — they
                  appear here in the order you arrange them.
                </p>

                <button
                  type="button"
                  onClick={() => setShowAddSection(true)}
                  className="mt-7 inline-flex h-10 items-center gap-2 rounded-[4px] bg-[var(--rs-ink)] px-5 text-[13.5px] font-medium text-[var(--rs-paper)] transition hover:bg-[var(--rs-brass-strong)]"
                >
                  <HiOutlinePlus size={16} />
                  Add your first section
                </button>
              </div>
            )}

            {sections.length > 0 && (
              <div className="border-t border-[var(--rs-rule)] pt-5">
                <AddButton
                  onClick={() => setShowAddSection(true)}
                  label="Add another section"
                />
              </div>
            )}
          </div>

          {previewDocked && (
            <div className="hidden w-[380px] shrink-0 pt-4 xl:block">
              <PreviewPanel
                content={content}
                docked
                onClose={() => setPreviewDocked(false)}
              />
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