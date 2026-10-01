import React, {
  useEffect,
  useMemo,
  useRef,
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
  HiOutlineEllipsisVertical,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineFolderOpen,
  HiOutlineGlobeAlt,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineMagnifyingGlassPlus,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSquares2X2,
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
   Maps the editor onto the app's design tokens. Kept small on
   purpose: all layout / control styling lives in the classes
   below so nothing fights with global overrides.
============================================================ */

export const THEME_STYLES = `
.rs-scope {
  --rs-paper: var(--background);
  --rs-paper-raised: var(--surface);
  --rs-ink: var(--text-primary);
  --rs-ink-soft: var(--text-secondary);
  --rs-ink-faint: var(--text-muted);
  --rs-rule: var(--border);
  --rs-rule-strong: var(--border-strong);
  --rs-brass: var(--brand);
  --rs-brass-strong: var(--brand-hover);
  --rs-brass-wash: var(--brand-soft);
  --rs-moss: var(--success);
  --rs-rust: var(--danger);
  --rs-shadow: rgb(15 23 42 / 0.14);

  min-height: 100%;
  color: var(--text-primary);
  font-family: inherit;
}

.dark .rs-scope { --rs-shadow: rgb(0 0 0 / 0.35); }

.rs-scope input::placeholder,
.rs-scope textarea::placeholder { color: var(--text-muted); }

.rs-scope summary { list-style: none; }
.rs-scope summary::-webkit-details-marker { display: none; }

.rs-scope .rs-hide-scroll::-webkit-scrollbar { width: 0; height: 0; }

@keyframes rs-sheet-up {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.rs-sheet { animation: rs-sheet-up 180ms ease-out; }

@media (prefers-reduced-motion: reduce) {
  .rs-sheet { animation: none; }
}
`;

/* ============================================================
   SHARED CLASS STRINGS
   16px text on mobile prevents iOS from zooming on focus.
============================================================ */

const INPUT_CLS = `
  h-11 w-full rounded-lg border border-[var(--rs-rule)]
  bg-[var(--rs-paper)] px-3 text-[16px] text-[var(--rs-ink)]
  outline-none transition sm:text-[14px]
  focus:border-[var(--rs-brass)] focus:shadow-[0_0_0_3px_var(--rs-brass-wash)]
  disabled:cursor-not-allowed disabled:opacity-50
`;

const TEXTAREA_CLS = `
  w-full resize-y rounded-lg border border-[var(--rs-rule)]
  bg-[var(--rs-paper)] px-3 py-2.5 text-[16px] leading-6 text-[var(--rs-ink)]
  outline-none transition sm:text-[14px]
  focus:border-[var(--rs-brass)] focus:shadow-[0_0_0_3px_var(--rs-brass-wash)]
`;

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg text-[13.5px] font-medium transition disabled:opacity-50";

const BTN_GHOST = `${BTN_BASE} h-11 border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] px-4 text-[var(--rs-ink)] hover:border-[var(--rs-rule-strong)] hover:bg-[var(--rs-paper)]`;

const BTN_PRIMARY = `${BTN_BASE} h-11 bg-[var(--rs-brass)] px-5 font-semibold text-white hover:bg-[var(--rs-brass-strong)]`;

/* ============================================================
   SECTION META
============================================================ */

const SECTION_META: Record<
  ResumeSectionType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
  }
> = {
  SUMMARY: {
    label: "Professional Summary",
    description: "A short intro to your profile.",
    icon: HiOutlineDocumentText,
  },
  EXPERIENCE: {
    label: "Experience",
    description: "Your work history and achievements.",
    icon: HiOutlineBriefcase,
  },
  EDUCATION: {
    label: "Education",
    description: "Degrees and academic background.",
    icon: HiOutlineAcademicCap,
  },
  SKILLS: {
    label: "Skills",
    description: "Skills grouped by category.",
    icon: HiOutlineWrenchScrewdriver,
  },
  PROJECTS: {
    label: "Projects",
    description: "Selected projects and practical work.",
    icon: HiOutlineFolderOpen,
  },
  ACHIEVEMENTS: {
    label: "Achievements",
    description: "Professional or personal wins.",
    icon: HiOutlineCheck,
  },
  CERTIFICATIONS: {
    label: "Certifications",
    description: "Credentials and certificates.",
    icon: HiOutlineCheck,
  },
  AWARDS: {
    label: "Awards",
    description: "Awards, honors and recognition.",
    icon: HiOutlineCheck,
  },
  LANGUAGES: {
    label: "Languages",
    description: "Languages and proficiency.",
    icon: HiOutlineGlobeAlt,
  },
  PUBLICATIONS: {
    label: "Publications",
    description: "Articles, papers and published work.",
    icon: HiOutlineDocumentText,
  },
  VOLUNTEER: {
    label: "Volunteer Experience",
    description: "Volunteer and community work.",
    icon: HiOutlineUser,
  },
  CUSTOM: {
    label: "Custom Section",
    description: "Create your own section.",
    icon: HiOutlinePlus,
  },
};

function SectionIcon({
  type,
  size = 18,
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
    return typeof section.content === "string" && section.content.trim()
      ? 1
      : 0;
  }

  if (section.content && typeof section.content === "object") {
    const data = section.content as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items.length;
    if (Array.isArray(data.categories)) return data.categories.length;
  }

  return 0;
}

function sectionHasFilledContent(section: ResumeSection): boolean {
  return getSectionItemCount(section) > 0;
}

function sectionSummary(section: ResumeSection): string {
  const count = getSectionItemCount(section);

  if (section.type === "SUMMARY") {
    return count ? "Written" : "Empty";
  }
  if (section.type === "SKILLS") {
    return count ? `${count} ${count === 1 ? "category" : "categories"}` : "Empty";
  }
  return count ? `${count} ${count === 1 ? "entry" : "entries"}` : "Empty";
}

function domId(sectionId: string) {
  return `resume-section-${sectionId}`;
}

const PERSONAL_ID = "__personal__";

/** One bullet per non-empty line. */
function parseLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/* ============================================================
   FIELDS
============================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--rs-ink-soft)]">
        {label}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLS}
      />
    </label>
  );
}

/** Plain text area: value passes straight through, so Enter works. */
function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--rs-ink-soft)]">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={TEXTAREA_CLS}
      />
      {hint && (
        <span className="mt-1.5 block text-[12px] leading-5 text-[var(--rs-ink-faint)]">
          {hint}
        </span>
      )}
    </label>
  );
}

/**
 * Bullet-point text area for string[] data.
 *
 * The bug this fixes: the old version converted the text into a
 * trimmed, empty-line-free array on every keystroke and then
 * rendered the array back with join("\n"). Pressing Enter produced
 * a trailing "\n" which was immediately filtered away, so the new
 * line could never appear.
 *
 * Here the raw text lives in a local draft (newlines intact) and
 * only the parsed array is sent upward.
 */
function BulletsTextArea({
  label,
  lines,
  onChange,
  placeholder,
  rows = 6,
}: {
  label: string;
  lines: string[];
  onChange: (lines: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [draft, setDraft] = useState(lines.join("\n"));

  /* Re-sync only when the data changed from outside (e.g. profile sync). */
  useEffect(() => {
    if (JSON.stringify(parseLines(draft)) !== JSON.stringify(lines)) {
      setDraft(lines.join("\n"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--rs-ink-soft)]">
        {label}
      </span>
      <textarea
        value={draft}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => {
          setDraft(event.target.value);
          onChange(parseLines(event.target.value));
        }}
        className={TEXTAREA_CLS}
      />
      <span className="mt-1.5 block text-[12px] leading-5 text-[var(--rs-ink-faint)]">
        One point per line. Press Enter to start a new bullet.
      </span>
    </label>
  );
}

function CommaSeparatedInput({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState(items.join(", "));

  const parse = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  useEffect(() => {
    if (JSON.stringify(parse(draft)) !== JSON.stringify(items)) {
      setDraft(items.join(", "));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--rs-ink-soft)]">
        {label}
      </span>
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => {
          setDraft(event.target.value);
          onChange(parse(event.target.value));
        }}
        className={INPUT_CLS}
      />
      <span className="mt-1.5 block text-[12px] text-[var(--rs-ink-faint)]">
        Separate with commas.
      </span>
    </label>
  );
}

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
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--rs-rule-strong)] text-[14px] font-medium text-[var(--rs-brass)] transition hover:border-[var(--rs-brass)] hover:bg-[var(--rs-brass-wash)] sm:w-auto sm:px-5"
    >
      <HiOutlinePlus size={17} />
      {label}
    </button>
  );
}

/* ============================================================
   ENTRY CARD — a repeatable item (job, school, project...).
   Collapsible so long lists stay scannable on a phone.
============================================================ */

function EntryCard({
  title,
  subtitle,
  defaultOpen,
  onRemove,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)]">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 px-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-semibold text-[var(--rs-ink)]">
              {title}
            </span>
            {subtitle && (
              <span className="mt-0.5 block truncate text-[12.5px] text-[var(--rs-ink-soft)]">
                {subtitle}
              </span>
            )}
          </span>
          <HiOutlineChevronDown
            size={18}
            className={cn(
              "shrink-0 text-[var(--rs-ink-faint)] transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Remove this entry?")) onRemove();
          }}
          className="flex w-12 shrink-0 items-center justify-center text-[var(--rs-ink-faint)] transition hover:bg-[var(--rs-rust)]/10 hover:text-[var(--rs-rust)]"
          title="Remove entry"
          aria-label="Remove entry"
        >
          <HiOutlineTrash size={18} />
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--rs-rule)] p-4">{children}</div>
      )}
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
    <TextArea
      label="Summary"
      value={typeof section.content === "string" ? section.content : ""}
      placeholder="Experienced software engineer with a strong background in..."
      rows={7}
      hint="Two to four sentences on your experience, strengths and the value you bring."
      onChange={(content) => updateSection({ content })}
    />
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

  function patchItem(id: string, patch: Partial<ResumeExperience>) {
    updateItems(
      items.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          title={item.position || item.company || `Position ${index + 1}`}
          subtitle={item.position ? item.company : undefined}
          defaultOpen={items.length === 1 || !(item.position || item.company)}
          onRemove={() => updateItems(items.filter((e) => e.id !== item.id))}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Position"
              value={item.position}
              placeholder="Senior Software Engineer"
              onChange={(position) => patchItem(item.id, { position })}
            />
            <Field
              label="Company"
              value={item.company}
              placeholder="Company name"
              onChange={(company) => patchItem(item.id, { company })}
            />
            <Field
              label="Location"
              value={item.location ?? ""}
              placeholder="Hyderabad, India"
              onChange={(location) => patchItem(item.id, { location })}
            />
            <div className="hidden sm:block" />
            <Field
              label="Start date"
              value={item.startDate}
              placeholder="Jan 2024"
              onChange={(startDate) => patchItem(item.id, { startDate })}
            />
            <Field
              label="End date"
              value={item.currentlyWorking ? "Present" : (item.endDate ?? "")}
              placeholder="Dec 2025"
              disabled={Boolean(item.currentlyWorking)}
              onChange={(endDate) => patchItem(item.id, { endDate })}
            />
          </div>

          <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-[var(--rs-rule)] bg-[var(--rs-paper)] px-3">
            <input
              type="checkbox"
              checked={Boolean(item.currentlyWorking)}
              onChange={(event) =>
                patchItem(item.id, { currentlyWorking: event.target.checked })
              }
              className="size-5 shrink-0 accent-[var(--rs-brass)]"
            />
            <span className="text-[14px] text-[var(--rs-ink)]">
              I currently work here
            </span>
          </label>

          <div className="mt-4">
            <BulletsTextArea
              label="Description / achievements"
              lines={item.description ?? []}
              placeholder={
                "Built and maintained...\nImproved performance by...\nLed a team of..."
              }
              rows={6}
              onChange={(description) => patchItem(item.id, { description })}
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

  function patchItem(id: string, patch: Partial<ResumeEducation>) {
    updateItems(
      items.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          title={item.institution || item.degree || `Education ${index + 1}`}
          subtitle={item.institution ? item.degree : undefined}
          defaultOpen={items.length === 1 || !(item.institution || item.degree)}
          onRemove={() => updateItems(items.filter((e) => e.id !== item.id))}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Institution"
              value={item.institution}
              placeholder="University / College"
              onChange={(institution) => patchItem(item.id, { institution })}
            />
            <Field
              label="Degree"
              value={item.degree}
              placeholder="Bachelor of Technology"
              onChange={(degree) => patchItem(item.id, { degree })}
            />
            <Field
              label="Field of study"
              value={item.fieldOfStudy ?? ""}
              placeholder="Computer Science"
              onChange={(fieldOfStudy) => patchItem(item.id, { fieldOfStudy })}
            />
            <Field
              label="Location"
              value={item.location ?? ""}
              placeholder="Hyderabad, India"
              onChange={(location) => patchItem(item.id, { location })}
            />
            <Field
              label="Start date"
              value={item.startDate ?? ""}
              placeholder="2020"
              onChange={(startDate) => patchItem(item.id, { startDate })}
            />
            <Field
              label="End date"
              value={item.endDate ?? ""}
              placeholder="2024"
              onChange={(endDate) => patchItem(item.id, { endDate })}
            />
            <Field
              label="Grade"
              value={item.grade ?? ""}
              placeholder="8.5"
              onChange={(grade) => patchItem(item.id, { grade })}
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

  function patchCategory(id: string, patch: Partial<ResumeSkillCategory>) {
    updateCategories(
      skills.categories.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {skills.categories.map((category) => (
        <div
          key={category.id}
          className="rounded-xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] p-4"
        >
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Field
                label="Category"
                value={category.name}
                placeholder="Frontend"
                onChange={(name) => patchCategory(category.id, { name })}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remove this category?")) {
                  updateCategories(
                    skills.categories.filter((e) => e.id !== category.id),
                  );
                }
              }}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[var(--rs-rule)] text-[var(--rs-ink-faint)] transition hover:border-[var(--rs-rust)] hover:text-[var(--rs-rust)]"
              title="Remove category"
              aria-label="Remove category"
            >
              <HiOutlineTrash size={18} />
            </button>
          </div>

          <div className="mt-4">
            <CommaSeparatedInput
              label="Skills"
              items={category.items}
              placeholder="React, TypeScript, Node.js"
              onChange={(items) => patchCategory(category.id, { items })}
            />
          </div>
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

  function patchItem(id: string, patch: Partial<ResumeProject>) {
    updateItems(
      items.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          title={item.name || `Project ${index + 1}`}
          subtitle={(item.technologies ?? []).slice(0, 4).join(", ") || undefined}
          defaultOpen={items.length === 1 || !item.name}
          onRemove={() => updateItems(items.filter((e) => e.id !== item.id))}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Project name"
              value={item.name}
              placeholder="Project name"
              onChange={(name) => patchItem(item.id, { name })}
            />
            <CommaSeparatedInput
              label="Technologies"
              items={item.technologies ?? []}
              placeholder="React, Node.js, PostgreSQL"
              onChange={(technologies) => patchItem(item.id, { technologies })}
            />
            <Field
              label="Live URL"
              type="url"
              value={item.url ?? ""}
              placeholder="https://..."
              onChange={(url) => patchItem(item.id, { url })}
            />
            <Field
              label="GitHub URL"
              type="url"
              value={item.github ?? ""}
              placeholder="https://github.com/..."
              onChange={(github) => patchItem(item.id, { github })}
            />
          </div>

          <div className="mt-4">
            <TextArea
              label="Description"
              value={item.description ?? ""}
              placeholder={
                "What you built and your role...\nThe impact it had..."
              }
              rows={5}
              hint="One point per line. Press Enter to start a new bullet."
              onChange={(description) => patchItem(item.id, { description })}
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
   GENERIC / CUSTOM SECTION EDITOR
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

  function setItems(next: unknown[]) {
    updateSection({ content: { ...content, items: next } });
  }

  function addItem() {
    setItems([
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
    ]);
  }

  function updateItem(id: string, patch: Record<string, unknown>) {
    setItems(
      items.map((item) => {
        if (!item || typeof item !== "object") return item;
        const current = item as Record<string, unknown>;
        return current.id === id ? { ...current, ...patch } : current;
      }),
    );
  }

  function removeItem(id: string) {
    setItems(
      items.filter((item) => {
        if (!item || typeof item !== "object") return true;
        return (item as Record<string, unknown>).id !== id;
      }),
    );
  }

  const str = (value: unknown) => (typeof value === "string" ? value : "");

  return (
    <div className="space-y-3">
      {items.map((rawItem, index) => {
        if (!rawItem || typeof rawItem !== "object") return null;

        const item = rawItem as Record<string, unknown>;
        const id = typeof item.id === "string" ? item.id : `custom-${index}`;

        return (
          <EntryCard
            key={id}
            title={str(item.title) || `Entry ${index + 1}`}
            subtitle={str(item.subtitle) || undefined}
            defaultOpen={items.length === 1 || !str(item.title)}
            onRemove={() => removeItem(id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                value={str(item.title)}
                onChange={(title) => updateItem(id, { title })}
              />
              <Field
                label="Subtitle"
                value={str(item.subtitle)}
                onChange={(subtitle) => updateItem(id, { subtitle })}
              />
              <Field
                label="Date"
                value={str(item.date)}
                placeholder="2024"
                onChange={(date) => updateItem(id, { date })}
              />
              <Field
                label="Location"
                value={str(item.location)}
                onChange={(location) => updateItem(id, { location })}
              />
              <Field
                label="URL"
                type="url"
                value={str(item.url)}
                onChange={(url) => updateItem(id, { url })}
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Description"
                value={str(item.description)}
                rows={5}
                hint="One point per line. Press Enter to start a new bullet."
                onChange={(description) => updateItem(id, { description })}
              />
            </div>
          </EntryCard>
        );
      })}

      <AddButton onClick={addItem} label="Add entry" />
    </div>
  );
}

/* ============================================================
   PERSONAL DETAILS EDITOR
============================================================ */

function PersonalInfoEditor({
  content,
  update,
}: {
  content: ResumeProfileContent;
  update: (patch: Partial<ResumeProfileContent>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Full name"
        value={content.fullName ?? ""}
        placeholder="Your name"
        onChange={(fullName) => update({ fullName })}
      />
      <Field
        label="Professional headline"
        value={content.headline ?? ""}
        placeholder="Full Stack Developer"
        onChange={(headline) => update({ headline })}
      />
      <Field
        label="Email"
        type="email"
        inputMode="email"
        value={content.email ?? ""}
        placeholder="email@example.com"
        onChange={(email) => update({ email })}
      />
      <Field
        label="Phone"
        type="tel"
        inputMode="tel"
        value={content.phone ?? ""}
        placeholder="+91 98765 43210"
        onChange={(phone) => update({ phone })}
      />
      <Field
        label="Location"
        value={content.location ?? ""}
        placeholder="City, Country"
        onChange={(location) => update({ location })}
      />
      <Field
        label="Website"
        type="url"
        value={content.website ?? ""}
        placeholder="yoursite.com"
        onChange={(website) => update({ website })}
      />
      <Field
        label="LinkedIn"
        value={content.linkedin ?? ""}
        placeholder="linkedin.com/in/you"
        onChange={(linkedin) => update({ linkedin })}
      />
      <Field
        label="GitHub"
        value={content.github ?? ""}
        placeholder="github.com/you"
        onChange={(github) => update({ github })}
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
   ACCORDION ITEM — one per section. Only one is open at a time,
   so the page stays short and the thumb never has to hunt.
============================================================ */

function AccordionItem({
  id,
  icon,
  title,
  meta,
  status,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  meta?: string;
  status?: "filled" | "empty" | "hidden";
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-4 overflow-hidden rounded-2xl border bg-[var(--rs-paper-raised)] transition-colors",
        open
          ? "border-[var(--rs-brass)]/50 shadow-[0_2px_14px_var(--rs-shadow)]"
          : "border-[var(--rs-rule)]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[64px] w-full items-center gap-3 px-4 text-left"
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            open
              ? "bg-[var(--rs-brass)] text-white"
              : "bg-[var(--rs-brass-wash)] text-[var(--rs-brass)]",
          )}
        >
          {icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15.5px] font-semibold text-[var(--rs-ink)]">
            {title || "Untitled section"}
          </span>
          {meta && (
            <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[var(--rs-ink-soft)]">
              {status && (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    status === "filled" && "bg-[var(--rs-moss)]",
                    status === "empty" && "bg-[var(--rs-ink-faint)]",
                    status === "hidden" && "bg-[var(--rs-rust)]",
                  )}
                />
              )}
              {meta}
            </span>
          )}
        </span>

        <HiOutlineChevronDown
          size={20}
          className={cn(
            "shrink-0 text-[var(--rs-ink-faint)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--rs-rule)] p-4 sm:p-5">
          {children}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   SECTION SETTINGS — rename, reorder, hide, delete.
   Tucked in a disclosure so it doesn't crowd the editor.
============================================================ */

function SectionSettings({
  section,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: ResumeSection;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<ResumeSection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const actionCls =
    "flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--rs-rule)] bg-[var(--rs-paper)] px-3 text-[13px] font-medium text-[var(--rs-ink)] transition hover:border-[var(--rs-rule-strong)] disabled:opacity-40";

  return (
    <details className="group mt-5 rounded-xl border border-[var(--rs-rule)] bg-[var(--rs-paper)]">
      <summary className="flex min-h-[48px] cursor-pointer items-center justify-between px-4 text-[13.5px] font-medium text-[var(--rs-ink-soft)]">
        Section settings
        <HiOutlineChevronDown
          size={16}
          className="transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="space-y-3 border-t border-[var(--rs-rule)] p-4">
        <Field
          label="Section title (shown on resume)"
          value={section.title}
          onChange={(title) => onUpdate({ title })}
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className={actionCls}
          >
            <HiOutlineChevronUp size={16} />
            Move up
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className={actionCls}
          >
            <HiOutlineChevronDown size={16} />
            Move down
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ visible: !section.visible })}
            className={actionCls}
          >
            {section.visible ? (
              <HiOutlineEyeSlash size={16} />
            ) : (
              <HiOutlineEye size={16} />
            )}
            {section.visible ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              actionCls,
              "text-[var(--rs-rust)] hover:border-[var(--rs-rust)]",
            )}
          >
            <HiOutlineTrash size={16} />
            Delete
          </button>
        </div>
      </div>
    </details>
  );
}

/* ============================================================
   ADD SECTION SHEET — bottom sheet on phones, dialog on desktop
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
      className="rs-scope fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="rs-sheet flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Add a section"
      >
        <div className="flex items-center justify-between border-b border-[var(--rs-rule)] px-5 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--rs-ink)]">
              Add a section
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--rs-ink-soft)]">
              Pick what to add to your resume.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-lg text-[var(--rs-ink-soft)] hover:bg-[var(--rs-paper)]"
          >
            <HiOutlineXMark size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 overflow-y-auto p-3 pb-6 sm:grid-cols-2">
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
                className="flex min-h-[64px] items-center gap-3 rounded-xl border border-[var(--rs-rule)] bg-[var(--rs-paper)] p-3 text-left transition hover:border-[var(--rs-brass)] hover:bg-[var(--rs-brass-wash)]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--rs-brass-wash)] text-[var(--rs-brass)]">
                  <SectionIcon type={type} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-[var(--rs-ink)]">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-5 text-[var(--rs-ink-soft)]">
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
   PREVIEW — the A4 page is scaled to fit its container so a
   phone sees the whole page; "Zoom" shows it at real size.
============================================================ */

const A4_PX = 794;

function ScaledPreview({
  content,
  zoomed = false,
}: {
  content: ResumeProfileContent;
  zoomed?: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      setFit(Math.min(1, outer.clientWidth / A4_PX));
      setHeight(inner.offsetHeight);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);

    return () => observer.disconnect();
  }, []);

  const scale = zoomed ? 1 : fit;

  return (
    <div
      ref={outerRef}
      className={cn("w-full", zoomed ? "overflow-x-auto" : "overflow-hidden")}
      style={{ height: height * scale || undefined }}
    >
      <div
        ref={innerRef}
        style={{
          width: A4_PX,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResumePreview resume={content} />
      </div>
    </div>
  );
}

function PreviewSheet({
  content,
  onClose,
}: {
  content: ResumeProfileContent;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div
      className="rs-scope fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="rs-sheet flex h-full w-full flex-col bg-[var(--rs-paper-raised)] shadow-2xl md:max-w-[680px]"
        role="dialog"
        aria-modal="true"
        aria-label="Resume preview"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--rs-rule)] px-4">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[var(--rs-ink)]">
              Preview
            </p>
            <p className="text-[12px] text-[var(--rs-ink-soft)]">
              Matches your PDF layout
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomed((value) => !value)}
              className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-[var(--rs-ink-soft)] hover:bg-[var(--rs-paper)]"
            >
              {zoomed ? (
                <HiOutlineMagnifyingGlassMinus size={18} />
              ) : (
                <HiOutlineMagnifyingGlassPlus size={18} />
              )}
              {zoomed ? "Fit page" : "Zoom"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="flex size-11 items-center justify-center rounded-lg text-[var(--rs-ink-soft)] hover:bg-[var(--rs-paper)]"
            >
              <HiOutlineXMark size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--rs-paper)] p-3 sm:p-5">
          <div className="shadow-[0_10px_30px_var(--rs-shadow)]">
            <ScaledPreview content={content} zoomed={zoomed} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DockedPreview({ content }: { content: ResumeProfileContent }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-4 overflow-hidden rounded-2xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)]">
        <div className="flex h-12 items-center justify-between border-b border-[var(--rs-rule)] px-4">
          <p className="text-[13px] font-semibold text-[var(--rs-ink)]">
            Live preview
          </p>
          <span className="rounded-md border border-[var(--rs-rule)] px-2 py-0.5 text-[11px] font-medium text-[var(--rs-ink-soft)]">
            A4
          </span>
        </div>

        <div className="max-h-[calc(100vh-150px)] overflow-auto bg-[var(--rs-paper)] p-3">
          <div className="shadow-[0_10px_30px_var(--rs-shadow)]">
            <ScaledPreview content={content} />
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   PROGRESS RING — initials inside a completion arc
============================================================ */

function getInitials(name?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const size = 68;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Resume ${value}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rs-rule)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rs-brass)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>

      <div className="absolute inset-[7px] flex items-center justify-center rounded-full bg-[var(--rs-brass-wash)] text-[18px] font-semibold text-[var(--rs-brass)]">
        {label || <HiOutlineUser size={22} />}
      </div>
    </div>
  );
}

/* ============================================================
   MORE MENU — secondary actions out of the way
============================================================ */

function MoreMenu({
  onExport,
  onSync,
  onToggleSplit,
  exporting,
  syncing,
  splitActive,
}: {
  onExport: () => void;
  onSync: () => void;
  onToggleSplit: () => void;
  exporting: boolean;
  syncing: boolean;
  splitActive: boolean;
}) {
  const [open, setOpen] = useState(false);

  const itemCls =
    "flex min-h-[48px] w-full items-center gap-3 px-4 text-left text-[14px] text-[var(--rs-ink)] transition hover:bg-[var(--rs-paper)] disabled:opacity-50";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="More actions"
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-lg border border-[var(--rs-rule)] text-[var(--rs-ink)] transition hover:border-[var(--rs-rule-strong)]"
      >
        <HiOutlineEllipsisVertical size={20} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] py-1 shadow-xl">
            <button
              type="button"
              disabled={exporting}
              onClick={() => {
                setOpen(false);
                onExport();
              }}
              className={itemCls}
            >
              {exporting ? (
                <HiOutlineArrowPath size={18} className="animate-spin" />
              ) : (
                <HiOutlineArrowDownTray size={18} />
              )}
              Export as PDF
            </button>

            <button
              type="button"
              disabled={syncing}
              onClick={() => {
                setOpen(false);
                onSync();
              }}
              className={itemCls}
            >
              <HiOutlineArrowPath
                size={18}
                className={syncing ? "animate-spin" : ""}
              />
              Replace with profile data
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleSplit();
              }}
              className={cn(itemCls, "hidden xl:flex")}
            >
              <HiOutlineSquares2X2 size={18} />
              {splitActive ? "Hide side-by-side preview" : "Side-by-side preview"}
            </button>
          </div>
        </>
      )}
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

  const sectionChecks = (content.sections ?? []).map((section) =>
    sectionHasFilledContent(section),
  );

  const checks = [...personalChecks, ...sectionChecks];

  if (checks.length === 0) return 0;

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ============================================================
   MAIN
============================================================ */

export default function Resume() {
  const queryClient = useQueryClient();

  const [content, setContent] = useState<ResumeProfileContent>(emptyResumeContent);
  const savedSnapshot = useRef<string>("");

  const [openId, setOpenId] = useState<string | null>(PERSONAL_ID);
  const [showAddSection, setShowAddSection] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocked, setPreviewDocked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  /* MODAL BEHAVIOUR: lock page scroll, close on Escape */
  useEffect(() => {
    if (!showAddSection && !previewOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowAddSection(false);
      setPreviewOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
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
      const normalized = normalizeResumeContent(customizationQuery.data.content);
      setContent(normalized);
      savedSnapshot.current = JSON.stringify(normalized);
    }
  }, [customizationQuery.data]);

  const saveMutation = useMutation({
    mutationFn: saveResumeCustomization,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["resume", "customization"],
      });
      toast.success(response.data.message || "Resume saved.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to save resume.");
    },
  });

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

  const isDirty = useMemo(
    () => JSON.stringify(content) !== savedSnapshot.current,
    [content],
  );

  /* ---------------- actions ---------------- */

  function scrollToId(targetId: string) {
    requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleOpen(id: string) {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen) {
      scrollToId(id === PERSONAL_ID ? "resume-personal" : domId(id));
    }
  }

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

    setOpenId(section.id);
    scrollToId(domId(section.id));
  }

  function deleteSection(id: string) {
    const target = sections.find((section) => section.id === id);

    if (!window.confirm(`Delete "${target?.title || "this section"}"?`)) {
      return;
    }

    setContent((previous) => ({
      ...previous,
      sections: (previous.sections ?? []).filter((section) => section.id !== id),
    }));

    if (openId === id) setOpenId(null);
  }

  function moveSection(id: string, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.id === id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];

    setContent((previous) => ({ ...previous, sections: next }));
    scrollToId(domId(id));
  }

  function syncFromProfile() {
    if (
      isDirty &&
      !window.confirm(
        "This replaces your current edits with your profile data. Continue?",
      )
    ) {
      return;
    }
    replaceMutation.mutate();
  }

  function save() {
    saveMutation.mutate(content);
  }

  async function download() {
    try {
      setIsDownloading(true);

      const response = await downloadResumePdf();
      const url = window.URL.createObjectURL(response.data);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${content.fullName?.trim()?.replace(/\s+/g, "-") || "resume"}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Resume downloaded.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to download resume.");
    } finally {
      setIsDownloading(false);
    }
  }

  /* ---------------- LOADING ---------------- */
  if (profileQuery.isLoading || customizationQuery.isLoading) {
    return (
      <div className="rs-scope flex min-h-[70vh] items-center justify-center bg-[var(--rs-paper)]">
        <style>{THEME_STYLES}</style>
        <div className="flex flex-col items-center gap-3">
          <HiOutlineArrowPath size={24} className="animate-spin text-[var(--rs-brass)]" />
          <p className="text-[14px] text-[var(--rs-ink-soft)]">Loading your resume…</p>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (profileQuery.isError || customizationQuery.isError) {
    return (
      <div className="rs-scope flex min-h-[70vh] items-center justify-center bg-[var(--rs-paper)] px-5">
        <style>{THEME_STYLES}</style>
        <div className="w-full max-w-md rounded-2xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[var(--rs-rust)]/10 text-[var(--rs-rust)]">
            <HiOutlineDocumentText size={24} />
          </div>
          <h2 className="mt-4 text-[18px] font-semibold text-[var(--rs-ink)]">
            Couldn&rsquo;t load your resume
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[var(--rs-ink-soft)]">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              profileQuery.refetch();
              customizationQuery.refetch();
            }}
            className={cn(BTN_PRIMARY, "mt-6")}
          >
            <HiOutlineArrowPath size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- NO CUSTOMIZATION YET ---------------- */
  if (!customizationQuery.data) {
    const hasProfile = Boolean(profileQuery.data);

    return (
      <main className="rs-scope min-h-full w-full bg-[var(--rs-paper)] p-4 sm:p-6">
        <style>{THEME_STYLES}</style>
        <PageTitle title="Resume Editor" />

        <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] p-6 text-center sm:p-10">
            <h1 className="text-[24px] font-semibold leading-tight text-[var(--rs-ink)] sm:text-[28px]">
              Create your resume
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-6 text-[var(--rs-ink-soft)]">
              Start from your profile, then tailor it for each job you apply to.
            </p>

            {!hasProfile ? (
              <div className="mx-auto mt-6 rounded-lg border border-[var(--rs-rust)]/30 bg-[var(--rs-rust)]/10 p-4 text-[13.5px] leading-6 text-[var(--rs-rust)]">
                Complete your Profile first. Your resume is built from it.
              </div>
            ) : (
              <button
                type="button"
                disabled={importMutation.isPending}
                onClick={() => importMutation.mutate()}
                className={cn(BTN_PRIMARY, "mt-6 w-full sm:w-auto")}
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
      </main>
    );
  }

  /* ---------------- BUILDER ---------------- */
  return (
    <main className="rs-scope min-h-full w-full bg-[var(--rs-paper)]">
      <style>{THEME_STYLES}</style>
      <PageTitle title="Resume Editor" />

      {/* Hero header: identity, progress, and primary actions */}
      <header className="px-4 pt-4 sm:px-6">
        <div
          className={cn(
            "relative mx-auto rounded-3xl border border-[var(--rs-rule)] bg-[var(--rs-paper-raised)] p-4 shadow-[0_10px_30px_-12px_var(--rs-shadow)] sm:p-6",
            previewDocked ? "max-w-[1240px]" : "max-w-[760px]",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl bg-[radial-gradient(90%_140%_at_100%_0%,var(--rs-brass-wash),transparent_65%)]"
          />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <ProgressRing
                value={completeness}
                label={getInitials(content.fullName)}
              />

              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold leading-tight tracking-tight text-[var(--rs-ink)] sm:text-[24px]">
                  {content.fullName?.trim() || "Your resume"}
                </h1>
                <p className="mt-0.5 truncate text-[13.5px] text-[var(--rs-ink-soft)]">
                  {content.headline?.trim() || "Add a headline in Personal details"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full border border-[var(--rs-rule)] bg-[var(--rs-paper)] px-2.5 py-1 text-[12px] font-medium text-[var(--rs-ink)]">
                    {completeness}% complete
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rs-rule)] bg-[var(--rs-paper)] px-2.5 py-1 text-[12px] font-medium text-[var(--rs-ink-soft)]">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isDirty ? "bg-amber-500" : "bg-[var(--rs-moss)]",
                      )}
                    />
                    {isDirty ? "Unsaved changes" : "All changes saved"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                aria-label="Preview resume"
                className={cn(
                  "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--rs-rule)] bg-[var(--rs-paper)] px-4 text-[13.5px] font-medium text-[var(--rs-ink)] transition hover:border-[var(--rs-rule-strong)] md:flex-none",
                  previewDocked && "xl:hidden",
                )}
              >
                <HiOutlineEye size={18} />
                Preview
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saveMutation.isPending}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--rs-brass)] px-5 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-8px_var(--rs-brass)] transition hover:bg-[var(--rs-brass-strong)] disabled:opacity-60 md:flex-none"
              >
                {saveMutation.isPending ? (
                  <HiOutlineArrowPath size={16} className="animate-spin" />
                ) : (
                  <HiOutlineCheck size={16} />
                )}
                {saveMutation.isPending ? "Saving…" : "Save"}
              </button>

              <MoreMenu
                onExport={download}
                onSync={syncFromProfile}
                onToggleSplit={() => setPreviewDocked((value) => !value)}
                exporting={isDownloading}
                syncing={replaceMutation.isPending}
                splitActive={previewDocked}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div
        className={cn(
          "mx-auto w-full px-4 pb-24 pt-4 sm:px-6",
          previewDocked
            ? "max-w-[1240px] xl:grid xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-6"
            : "max-w-[760px]",
        )}
      >
        <div className="min-w-0 space-y-3">
          <AccordionItem
            id="resume-personal"
            icon={<HiOutlineUser size={19} />}
            title="Personal details"
            meta={
              [content.email, content.phone].filter(Boolean).join(" · ") ||
              "Name, contact and links"
            }
            open={openId === PERSONAL_ID}
            onToggle={() => toggleOpen(PERSONAL_ID)}
          >
            <PersonalInfoEditor content={content} update={updatePersonal} />
          </AccordionItem>

          {sections.map((section, index) => (
            <AccordionItem
              key={section.id}
              id={domId(section.id)}
              icon={<SectionIcon type={section.type} size={19} />}
              title={section.title}
              meta={
                section.visible === false
                  ? `${sectionSummary(section)} · hidden from PDF`
                  : sectionSummary(section)
              }
              status={
                section.visible === false
                  ? "hidden"
                  : sectionHasFilledContent(section)
                    ? "filled"
                    : "empty"
              }
              open={openId === section.id}
              onToggle={() => toggleOpen(section.id)}
            >
              <SectionEditor
                section={section}
                updateSection={(patch) => updateSectionById(section.id, patch)}
              />

              <SectionSettings
                section={section}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                onUpdate={(patch) => updateSectionById(section.id, patch)}
                onDelete={() => deleteSection(section.id)}
                onMoveUp={() => moveSection(section.id, -1)}
                onMoveDown={() => moveSection(section.id, 1)}
              />
            </AccordionItem>
          ))}

          {sections.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--rs-rule-strong)] px-5 py-10 text-center">
              <h2 className="text-[18px] font-semibold text-[var(--rs-ink)]">
                Add your first section
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-[14px] leading-6 text-[var(--rs-ink-soft)]">
                Sections appear on your resume in the order you arrange them.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddSection(true)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--rs-rule-strong)] text-[14.5px] font-semibold text-[var(--rs-brass)] transition hover:border-[var(--rs-brass)] hover:bg-[var(--rs-brass-wash)]"
          >
            <HiOutlinePlus size={18} />
            Add section
          </button>
        </div>

        {previewDocked && <DockedPreview content={content} />}
      </div>

      {showAddSection && (
        <AddSectionMenu
          onSelect={addSection}
          onClose={() => setShowAddSection(false)}
        />
      )}

      {previewOpen && (
        <PreviewSheet content={content} onClose={() => setPreviewOpen(false)} />
      )}
    </main>
  );
}