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
  HiOutlineArrowPath,
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentText,
  HiOutlineFolderOpen,
  HiOutlineGlobeAlt,
  HiOutlineLink,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import { toast } from "sonner";

import {
  getResumeProfile,
  saveResumeProfile,
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
    description: "Your reusable professional introduction.",
    icon: HiOutlineDocumentText,
  },
  EXPERIENCE: {
    label: "Experience",
    description: "Your complete professional work history.",
    icon: HiOutlineBriefcase,
  },
  EDUCATION: {
    label: "Education",
    description: "Degrees, qualifications and academic background.",
    icon: HiOutlineAcademicCap,
  },
  SKILLS: {
    label: "Skills",
    description: "Technical and professional skills by category.",
    icon: HiOutlineWrenchScrewdriver,
  },
  PROJECTS: {
    label: "Projects",
    description: "Projects and practical work you may reuse.",
    icon: HiOutlineFolderOpen,
  },
  ACHIEVEMENTS: {
    label: "Achievements",
    description: "Professional and personal achievements.",
    icon: HiOutlineCheck,
  },
  CERTIFICATIONS: {
    label: "Certifications",
    description: "Professional credentials and certifications.",
    icon: HiOutlineCheck,
  },
  AWARDS: {
    label: "Awards",
    description: "Awards, honors and recognitions.",
    icon: HiOutlineCheck,
  },
  LANGUAGES: {
    label: "Languages",
    description: "Languages and proficiency information.",
    icon: HiOutlineGlobeAlt,
  },
  PUBLICATIONS: {
    label: "Publications",
    description: "Articles, papers and published work.",
    icon: HiOutlineDocumentText,
  },
  VOLUNTEER: {
    label: "Volunteer Experience",
    description: "Community and volunteer experience.",
    icon: HiOutlineUser,
  },
  CUSTOM: {
    label: "Custom Section",
    description: "Add a section with your own name and entries.",
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
   HELPERS
============================================================ */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getCount(section: ResumeSection) {
  if (section.type === "SUMMARY") {
    return typeof section.content === "string" &&
      section.content.trim()
      ? 1
      : 0;
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

function hasContent(section: ResumeSection) {
  return getCount(section) > 0;
}

function fieldValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
    : [];
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
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500 sm:mb-2 sm:text-[11px]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-zinc-600 sm:min-h-11 sm:px-3.5"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 7,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500 sm:mb-2 sm:text-[11px]">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-zinc-600 sm:px-3.5 sm:py-3"
      />
    </label>
  );
}

/* ============================================================
   COMMA-SEPARATED INPUT
============================================================ */

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
    const normalizedDraft = draft
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const normalizedItems = items
      .map((item) => item.trim())
      .filter(Boolean);

    /*
     * Only replace the draft when the external value actually
     * differs from what the user is editing.
     *
     * This preserves intermediate states such as:
     *   React,
     *   React, Type
     *   React, Type,
     */
    if (
      JSON.stringify(normalizedDraft) !==
      JSON.stringify(normalizedItems)
    ) {
      setDraft(value);
    }
  }, [items, value]);

  function handleChange(nextValue: string) {
    /*
     * Keep the exact input text locally. Do NOT rebuild the
     * input from items[] on every keystroke.
     */
    setDraft(nextValue);

    /*
     * Persist the normalized representation separately.
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
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500 sm:mb-2 sm:text-[11px]">
        {label}
      </span>

      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-zinc-600 sm:min-h-11 sm:px-3.5"
      />
    </label>
  );
}

/* ============================================================
   PERSONAL EDITOR
============================================================ */

function PersonalEditor({
  value,
  update,
}: {
  value: ResumeProfileContent;
  update: (patch: Partial<ResumeProfileContent>) => void;
}) {
  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <Field
          label="Full name"
          value={value.fullName ?? ""}
          placeholder="Rahul Kumar"
          onChange={(fullName) => update({ fullName })}
        />

        <Field
          label="Professional headline"
          value={value.headline ?? ""}
          placeholder="Full Stack Developer"
          onChange={(headline) => update({ headline })}
        />

        <Field
          label="Email"
          type="email"
          value={value.email ?? ""}
          placeholder="rahul@example.com"
          onChange={(email) => update({ email })}
        />

        <Field
          label="Phone"
          value={value.phone ?? ""}
          placeholder="+91 98765 43210"
          onChange={(phone) => update({ phone })}
        />

        <Field
          label="Location"
          value={value.location ?? ""}
          placeholder="Hyderabad, India"
          onChange={(location) => update({ location })}
        />
      </div>

      <div className="border-t border-slate-100 pt-5 dark:border-white/[0.06] sm:pt-6">
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 sm:size-9">
            <HiOutlineLink size={15} className="sm:size-[17px]" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Professional links
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              These links can be reused by every resume you create.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <Field
            label="Website"
            value={value.website ?? ""}
            placeholder="https://yourwebsite.com"
            onChange={(website) => update({ website })}
          />

          <Field
            label="LinkedIn"
            value={value.linkedin ?? ""}
            placeholder="https://linkedin.com/in/..."
            onChange={(linkedin) => update({ linkedin })}
          />

          <Field
            label="GitHub"
            value={value.github ?? ""}
            placeholder="https://github.com/..."
            onChange={(github) => update({ github })}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY
============================================================ */

function SummaryEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  return (
    <div>
      <TextArea
        label="Professional summary"
        value={typeof section.content === "string" ? section.content : ""}
        placeholder="Experienced software engineer with a strong background in..."
        rows={9}
        onChange={(content) => update({ content })}
      />

      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-500">
        Keep this broad enough to reuse, while still describing your strongest
        experience and professional value.
      </p>
    </div>
  );
}

/* ============================================================
   EXPERIENCE
============================================================ */

function ExperienceEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  const data =
    section.content && typeof section.content === "object"
      ? (section.content as { items?: ResumeExperience[] })
      : {};

  const items = Array.isArray(data.items) ? data.items : [];

  const setItems = (next: ResumeExperience[]) => {
    update({ content: { ...data, items: next } });
  };

  const patchItem = (
    id: string,
    patch: Partial<ResumeExperience>,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:p-5"
        >
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                Experience {index + 1}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {item.position || item.company || "New experience"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setItems(items.filter((entry) => entry.id !== item.id))
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-500 sm:size-9"
            >
              <HiOutlineTrash size={15} className="sm:size-[17px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <Field
              label="Company"
              value={item.company}
              placeholder="Company name"
              onChange={(company) => patchItem(item.id, { company })}
            />

            <Field
              label="Position"
              value={item.position}
              placeholder="Senior Software Engineer"
              onChange={(position) => patchItem(item.id, { position })}
            />

            <Field
              label="Location"
              value={item.location ?? ""}
              placeholder="Hyderabad, India"
              onChange={(location) => patchItem(item.id, { location })}
            />

            <Field
              label="Start date"
              value={item.startDate}
              placeholder="Jan 2024"
              onChange={(startDate) => patchItem(item.id, { startDate })}
            />

            {!item.currentlyWorking && (
              <Field
                label="End date"
                value={item.endDate ?? ""}
                placeholder="Dec 2025"
                onChange={(endDate) => patchItem(item.id, { endDate })}
              />
            )}
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-zinc-400 sm:mt-4">
            <input
              type="checkbox"
              checked={Boolean(item.currentlyWorking)}
              onChange={(event) =>
                patchItem(item.id, {
                  currentlyWorking: event.target.checked,
                  ...(event.target.checked ? { endDate: "" } : {}),
                })
              }
              className="size-4 rounded accent-indigo-600"
            />
            I currently work here
          </label>

          <div className="mt-3 sm:mt-4">
            <TextArea
              label="Responsibilities / achievements"
              value={item.description.join("\n")}
              placeholder={"Built...\nImproved...\nLed..."}
              rows={6}
              onChange={(text) =>
                patchItem(item.id, {
                  description: text
                    .split(/\r?\n/)
                    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setItems([...items, createEmptyExperience()])}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 px-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-500/5 dark:border-indigo-400/30 dark:text-indigo-300 sm:min-h-11 sm:w-auto sm:px-4"
      >
        <HiOutlinePlus size={15} className="sm:size-[17px]" />
        Add experience
      </button>
    </div>
  );
}

/* ============================================================
   EDUCATION
============================================================ */

function EducationEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  const data =
    section.content && typeof section.content === "object"
      ? (section.content as { items?: ResumeEducation[] })
      : {};

  const items = Array.isArray(data.items) ? data.items : [];

  const setItems = (next: ResumeEducation[]) => {
    update({ content: { ...data, items: next } });
  };

  const patchItem = (
    id: string,
    patch: Partial<ResumeEducation>,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:p-5"
        >
          <div className="mb-4 flex items-start justify-between sm:mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                Education {index + 1}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {item.degree || item.institution || "New qualification"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setItems(items.filter((entry) => entry.id !== item.id))
              }
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 sm:size-9"
            >
              <HiOutlineTrash size={15} className="sm:size-[17px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
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
              onChange={(fieldOfStudy) =>
                patchItem(item.id, { fieldOfStudy })
              }
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
              placeholder="2019"
              onChange={(startDate) => patchItem(item.id, { startDate })}
            />

            <Field
              label="End date"
              value={item.endDate ?? ""}
              placeholder="2023"
              onChange={(endDate) => patchItem(item.id, { endDate })}
            />

            <Field
              label="Grade"
              value={item.grade ?? ""}
              placeholder="8.5 CGPA"
              onChange={(grade) => patchItem(item.id, { grade })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setItems([...items, createEmptyEducation()])}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 px-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-500/5 dark:border-indigo-400/30 dark:text-indigo-300 sm:min-h-11 sm:w-auto sm:px-4"
      >
        <HiOutlinePlus size={15} className="sm:size-[17px]" />
        Add education
      </button>
    </div>
  );
}

/* ============================================================
   SKILLS
============================================================ */

/* ============================================================
   SKILLS
============================================================ */

function SkillsEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  const skills: ResumeSkillsContent =
    section.content &&
      typeof section.content === "object" &&
      Array.isArray((section.content as ResumeSkillsContent).categories)
      ? (section.content as ResumeSkillsContent)
      : { categories: [] };

  const setCategories = (categories: ResumeSkillCategory[]) => {
    update({
      content: {
        categories,
      },
    });
  };

  const updateCategoryName = (
    categoryId: string,
    name: string,
  ) => {
    setCategories(
      skills.categories.map((category) =>
        category.id === categoryId
          ? { ...category, name }
          : category,
      ),
    );
  };

  const updateCategoryItems = (
    categoryId: string,
    items: string[],
  ) => {
    setCategories(
      skills.categories.map((category) =>
        category.id === categoryId
          ? { ...category, items }
          : category,
      ),
    );
  };

  const removeCategory = (categoryId: string) => {
    setCategories(
      skills.categories.filter(
        (category) => category.id !== categoryId,
      ),
    );
  };

  const addCategory = () => {
    setCategories([
      ...skills.categories,
      createEmptySkillCategory(),
    ]);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {skills.categories.map((category, index) => (
        <div
          key={category.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex items-center gap-2 sm:items-end">
              <span className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 sm:size-8">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1 sm:flex-none">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500 sm:mb-2 sm:text-[11px]">
                  Category
                </label>
                <input
                  value={category.name}
                  placeholder="Category"
                  onChange={(event) =>
                    updateCategoryName(
                      category.id,
                      event.target.value,
                    )
                  }
                  className="min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-white sm:min-h-10 sm:w-[190px] sm:px-3"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <CommaSeparatedInput
                label="Skills"
                value={category.items.join(", ")}
                items={category.items}
                placeholder="React, TypeScript, Node.js..."
                onChange={(items) =>
                  updateCategoryItems(category.id, items)
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                removeCategory(category.id)
              }
              className="min-h-9 shrink-0 rounded-lg px-2.5 text-xs font-bold text-red-500 transition hover:bg-red-500/10 sm:min-h-10 sm:px-3"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 px-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-500/5 dark:border-indigo-400/30 dark:text-indigo-300 sm:min-h-11 sm:w-auto sm:px-4"
      >
        <HiOutlinePlus
          size={15}
          className="sm:size-[17px]"
        />
        Add skill category
      </button>
    </div>
  );
}

/* ============================================================
   PROJECTS
============================================================ */

function ProjectsEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  const data =
    section.content && typeof section.content === "object"
      ? (section.content as { items?: ResumeProject[] })
      : {};

  const items = Array.isArray(data.items) ? data.items : [];

  const setItems = (next: ResumeProject[]) => {
    update({ content: { ...data, items: next } });
  };

  const patchItem = (
    id: string,
    patch: Partial<ResumeProject>,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:p-5"
        >
          <div className="mb-4 flex items-start justify-between sm:mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                Project {index + 1}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {item.name || "New project"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setItems(items.filter((entry) => entry.id !== item.id))
              }
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 sm:size-9"
            >
              <HiOutlineTrash size={15} className="sm:size-[17px]" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Field
              label="Project name"
              value={item.name}
              placeholder="Team Report Tracker"
              onChange={(name) => patchItem(item.id, { name })}
            />

            <TextArea
              label="Description"
              value={item.description ?? ""}
              placeholder="Describe what you built and the problem it solves."
              rows={5}
              onChange={(description) =>
                patchItem(item.id, { description })
              }
            />

            <CommaSeparatedInput
              label="Technologies"
              value={arrayValue(item.technologies).join(", ")}
              items={arrayValue(item.technologies)}
              placeholder="React, TypeScript, Node.js, PostgreSQL"
              onChange={(technologies) =>
                patchItem(item.id, {
                  technologies,
                })
              }
            />

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <Field
                label="Project URL"
                value={item.url ?? ""}
                placeholder="https://..."
                onChange={(url) => patchItem(item.id, { url })}
              />

              <Field
                label="GitHub"
                value={item.github ?? ""}
                placeholder="https://github.com/..."
                onChange={(github) => patchItem(item.id, { github })}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setItems([...items, createEmptyProject()])}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 px-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-500/5 dark:border-indigo-400/30 dark:text-indigo-300 sm:min-h-11 sm:w-auto sm:px-4"
      >
        <HiOutlinePlus size={15} className="sm:size-[17px]" />
        Add project
      </button>
    </div>
  );
}

/* ============================================================
   GENERIC SECTION
============================================================ */

function GenericEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  const data =
    section.content && typeof section.content === "object"
      ? (section.content as Record<string, unknown>)
      : {};

  const rawItems = Array.isArray(data.items) ? data.items : [];

  const items = rawItems.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object",
  );

  const setItems = (next: Record<string, unknown>[]) => {
    update({ content: { ...data, items: next } });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => {
        const id =
          typeof item.id === "string"
            ? item.id
            : `generic-${index}`;

        const patch = (values: Record<string, unknown>) => {
          setItems(
            items.map((entry, entryIndex) =>
              entryIndex === index
                ? { ...entry, ...values }
                : entry,
            ),
          );
        };

        return (
          <div
            key={id}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                Entry {index + 1}
              </p>

              <button
                type="button"
                onClick={() =>
                  setItems(
                    items.filter((_, entryIndex) => entryIndex !== index),
                  )
                }
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 sm:size-9"
              >
                <HiOutlineTrash size={15} className="sm:size-[17px]" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <Field
                label="Title"
                value={fieldValue(item.title)}
                onChange={(title) => patch({ title })}
              />

              <Field
                label="Subtitle"
                value={fieldValue(item.subtitle)}
                onChange={(subtitle) => patch({ subtitle })}
              />

              <Field
                label="Date"
                value={fieldValue(item.date)}
                onChange={(date) => patch({ date })}
              />

              <Field
                label="Location"
                value={fieldValue(item.location)}
                onChange={(location) => patch({ location })}
              />

              <Field
                label="URL"
                value={fieldValue(item.url)}
                onChange={(url) => patch({ url })}
              />
            </div>

            <div className="mt-3 sm:mt-4">
              <TextArea
                label="Description"
                value={fieldValue(item.description)}
                onChange={(description) => patch({ description })}
                rows={5}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          setItems([
            ...items,
            {
              id: createResumeId("profile-item"),
              title: "",
              subtitle: "",
              date: "",
              location: "",
              url: "",
              description: "",
              bullets: [],
            },
          ])
        }
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 px-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-500/5 dark:border-indigo-400/30 dark:text-indigo-300 sm:min-h-11 sm:w-auto sm:px-4"
      >
        <HiOutlinePlus size={15} className="sm:size-[17px]" />
        Add entry
      </button>
    </div>
  );
}

/* ============================================================
   SECTION CONTENT ROUTER
============================================================ */

function SectionContentEditor({
  section,
  update,
}: {
  section: ResumeSection;
  update: (patch: Partial<ResumeSection>) => void;
}) {
  switch (section.type) {
    case "SUMMARY":
      return <SummaryEditor section={section} update={update} />;

    case "EXPERIENCE":
      return <ExperienceEditor section={section} update={update} />;

    case "EDUCATION":
      return <EducationEditor section={section} update={update} />;

    case "SKILLS":
      return <SkillsEditor section={section} update={update} />;

    case "PROJECTS":
      return <ProjectsEditor section={section} update={update} />;

    default:
      return <GenericEditor section={section} update={update} />;
  }
}

/* ============================================================
   SECTION CARD
============================================================ */

function SectionCard({
  section,
  index,
  active,
  expanded,
  onActivate,
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isLast,
}: {
  section: ResumeSection;
  index: number;
  active: boolean;
  expanded: boolean;
  onActivate: () => void;
  onToggle: () => void;
  onUpdate: (patch: Partial<ResumeSection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isLast: boolean;
}) {
  return (
    <article
      id={`profile-section-${section.id}`}
      className={cn(
        "scroll-mt-28 overflow-hidden rounded-2xl border bg-white transition-all dark:bg-zinc-950 sm:rounded-3xl",
        active
          ? "border-indigo-300 shadow-[0_18px_50px_-32px_rgba(79,70,229,0.55)] dark:border-indigo-400/30"
          : "border-slate-200 shadow-[0_14px_45px_-32px_rgba(15,23,42,0.28)] dark:border-white/[0.07]",
      )}
      onClick={onActivate}
    >
      <div
        className={cn(
          "flex min-h-[60px] items-center gap-2 px-3 py-2 sm:min-h-[72px] sm:gap-3 sm:px-5",
          active && "bg-indigo-50/50 dark:bg-indigo-500/[0.035]",
        )}
      >
        <button
          type="button"
          onClick={onActivate}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl border transition sm:size-10",
            active
              ? "border-indigo-200 bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:border-indigo-400/20"
              : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-zinc-400",
          )}
        >
          <SectionIcon type={section.type} size={15} />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            {section.type === "CUSTOM" ? (
              <input
                type="text"
                value={section.title}
                placeholder="Custom section name"
                aria-label="Custom section name"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) =>
                  onUpdate({
                    title: event.target.value,
                  })
                }
                className={cn(
                  "min-w-0 flex-1 bg-transparent text-xs font-bold outline-none sm:text-sm",
                  "border-b border-transparent focus:border-indigo-400",
                  "text-slate-900 placeholder:text-slate-400 dark:text-white dark:placeholder:text-zinc-600",
                )}
              />
            ) : (
              <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                {section.title}
              </h3>
            )}

            {active && (
              <span className="hidden shrink-0 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white sm:inline-flex sm:px-2 sm:text-[9px]">
                Editing
              </span>
            )}
          </div>

          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-500 sm:text-[11px]">
            {hasContent(section)
              ? `${getCount(section)} ${section.type === "SUMMARY" ? "content block" : "entries"
              }`
              : "No content yet"}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp();
            }}
            className="hidden size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-white/[0.06] sm:flex sm:size-8"
            title="Move up"
          >
            <HiOutlineChevronUp size={14} className="sm:size-[16px]" />
          </button>

          <button
            type="button"
            disabled={isLast}
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown();
            }}
            className="hidden size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-25 sm:flex sm:size-8 dark:hover:bg-white/[0.06]"
            title="Move down"
          >
            <HiOutlineChevronDown size={14} className="sm:size-[16px]" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 sm:size-8"
            title="Delete section"
          >
            <HiOutlineTrash size={14} className="sm:size-[16px]" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] sm:size-8"
          >
            <HiOutlineChevronDown
              size={14}
              className={cn(
                "transition-transform sm:size-[16px]",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="border-t border-slate-100 px-3 py-4 dark:border-white/[0.05] sm:px-6 sm:py-6"
          onClick={(event) => event.stopPropagation()}
        >
          <SectionContentEditor
            section={section}
            update={onUpdate}
          />
        </div>
      )}
    </article>
  );
}

/* ============================================================
   ADD SECTION MODAL
============================================================ */

function AddSectionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (type: ResumeSectionType) => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-3xl overflow-hidden rounded-t-3xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/[0.07] sm:px-6 sm:py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
              Master profile
            </p>
            <h2 className="mt-1 text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
              Add a reusable section
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500 sm:mt-1">
              This section becomes part of your master profile and can be reused
              when building resumes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] sm:size-9"
          >
            ×
          </button>
        </div>

        <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto p-3 sm:max-h-[70vh] sm:grid-cols-2 sm:gap-3 sm:p-6">
          {(Object.keys(SECTION_META) as ResumeSectionType[]).map((type) => {
            const meta = SECTION_META[type];

            return (
              <button
                type="button"
                key={type}
                onClick={() => onAdd(type)}
                className="group flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/[0.05] sm:gap-3 sm:p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-white/[0.05] dark:text-indigo-300 sm:size-10">
                  <SectionIcon type={type} size={17} />
                </span>

                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-zinc-500 sm:mt-1">
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
   PROFILE COMPLETENESS
============================================================ */

function completeness(value: ResumeProfileContent) {
  const personal = [
    value.fullName,
    value.email,
    value.headline,
    value.phone,
    value.location,
  ].filter((item) => Boolean(item?.trim())).length;

  const sections = (value.sections ?? []).filter(hasContent).length;

  const total =
    5 + Math.max((value.sections ?? []).length, 1);

  return Math.min(
    100,
    Math.round(((personal + sections) / total) * 100),
  );
}

/* ============================================================
   MAIN
============================================================ */

export default function Profile() {
  const queryClient = useQueryClient();

  const [form, setForm] =
    useState<ResumeProfileContent>(emptyResumeContent);

  const [activeId, setActiveId] =
    useState<string>("__personal__");

  const [expandedIds, setExpandedIds] =
    useState<Set<string>>(new Set());

  const [addOpen, setAddOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["resume", "profile"],
    queryFn: async () => {
      const response = await getResumeProfile();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      const normalized =
        normalizeResumeContent(profileQuery.data);

      setForm(normalized);

      const first =
        normalized.sections?.[0];

      if (first) {
        setActiveId(first.id);
        setExpandedIds(new Set([first.id]));
      }
    }
  }, [profileQuery.data]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    if (addOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [addOpen]);

  const saveMutation = useMutation({
    mutationFn: saveResumeProfile,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["resume", "profile"],
      });

      toast.success(
        response?.data?.message ||
        "Master profile saved successfully.",
      );
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
        "Unable to save master profile.",
      );
    },
  });

  const sections = form.sections ?? [];



  const score = useMemo(
    () => completeness(form),
    [form],
  );

  function updatePersonal(
    patch: Partial<ResumeProfileContent>,
  ) {
    setForm((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  function updateSection(
    id: string,
    patch: Partial<ResumeSection>,
  ) {
    setForm((previous) => ({
      ...previous,
      sections:
        previous.sections?.map((section) =>
          section.id === id
            ? { ...section, ...patch }
            : section,
        ) ?? [],
    }));
  }

  function addSection(type: ResumeSectionType) {
    const section =
      createResumeSection(type);

    setForm((previous) => ({
      ...previous,
      sections: [
        ...(previous.sections ?? []),
        section,
      ],
    }));

    setActiveId(section.id);
    setExpandedIds(
      (previous) =>
        new Set(previous).add(section.id),
    );
    setAddOpen(false);

    requestAnimationFrame(() => {
      document
        .getElementById(
          `profile-section-${section.id}`,
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  function deleteSection(id: string) {
    const index =
      sections.findIndex(
        (section) => section.id === id,
      );

    const next =
      sections.filter(
        (section) => section.id !== id,
      );

    setForm((previous) => ({
      ...previous,
      sections: next,
    }));

    setExpandedIds((previous) => {
      const nextExpanded = new Set(previous);
      nextExpanded.delete(id);
      return nextExpanded;
    });

    if (activeId === id) {
      const replacement =
        next[index] ??
        next[index - 1] ??
        null;

      setActiveId(
        replacement?.id ?? "__personal__",
      );
    }
  }

  function moveSection(
    id: string,
    direction: -1 | 1,
  ) {
    const index =
      sections.findIndex(
        (section) => section.id === id,
      );

    const target = index + direction;

    if (
      index < 0 ||
      target < 0 ||
      target >= sections.length
    ) {
      return;
    }

    const next = [...sections];

    [
      next[index],
      next[target],
    ] = [
        next[target],
        next[index],
      ];

    setForm((previous) => ({
      ...previous,
      sections: next,
    }));
  }

  function toggleExpanded(id: string) {
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

  function activate(id: string) {
    setActiveId(id);

    if (id !== "__personal__") {
      setExpandedIds(
        (previous) =>
          new Set(previous).add(id),
      );
    }

    requestAnimationFrame(() => {
      const element =
        document.getElementById(
          id === "__personal__"
            ? "profile-identity"
            : `profile-section-${id}`,
        );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function save() {
    saveMutation.mutate(form);
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (profileQuery.isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-500">
          <HiOutlineArrowPath
            size={20}
            className="animate-spin"
          />
          Loading master profile...
        </div>
      </main>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (profileQuery.isError) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-white/10 dark:bg-zinc-950 sm:p-8">
          <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 sm:size-12">
            <HiOutlineUser size={20} className="sm:size-[23px]" />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-950 dark:text-white sm:mt-5 sm:text-lg">
            Unable to load master profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-500">
            Something went wrong while loading your professional profile.
          </p>

          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 sm:mt-6 sm:min-h-11 sm:px-5"
          >
            <HiOutlineArrowPath size={15} className="sm:size-[17px]" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <main className="min-h-full w-full bg-[#f5f6fa] text-slate-900 dark:bg-[#09090b] dark:text-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white dark:border-white/[0.07] dark:bg-zinc-950">
        <div className="mx-auto flex min-h-[56px] w-full max-w-[1280px] items-center justify-between px-3 sm:min-h-[64px] sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
              Profile
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 sm:hidden">
              Master
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 dark:border-white/10 dark:bg-white/[0.035] sm:h-10 sm:gap-2 sm:px-3">
              <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
                Score
              </span>

              <span className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                {score}%
              </span>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saveMutation.isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 text-[10px] font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-zinc-200 sm:h-10 sm:gap-2 sm:px-5 sm:text-xs"
            >
              {saveMutation.isPending ? (
                <HiOutlineArrowPath
                  size={13}
                  className="animate-spin sm:size-[16px]"
                />
              ) : (
                <HiOutlineCheck size={13} className="sm:size-[16px]" />
              )}

              <span className="hidden sm:inline">
                {saveMutation.isPending ? "Saving..." : "Save profile"}
              </span>

              <span className="sm:hidden">
                {saveMutation.isPending ? "..." : "Save"}
              </span>
            </button>
          </div>
        </div>

        <div className="h-[2px] bg-slate-100 dark:bg-white/[0.05]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </header>

      {/* ======================================================
          WORKSPACE
      ====================================================== */}

      <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Mobile header */}
        <div className="mb-3 flex items-center justify-between lg:hidden sm:mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Your Profile
          </h2>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-indigo-300 px-2.5 text-xs font-bold text-indigo-600 dark:border-indigo-400/30 dark:text-indigo-300 sm:h-9 sm:gap-2 sm:px-3"
          >
            <HiOutlinePlus size={14} className="sm:size-[16px]" />
            Add
          </button>
        </div>

        <div className="grid items-start gap-4 lg:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* ====================================================
              NAVIGATION - Desktop
          ==================================================== */}

          <aside className="hidden lg:block lg:sticky lg:top-[92px] lg:max-h-[calc(100vh-108px)] lg:min-h-0">
            <div className="max-h-[calc(100vh-108px)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_14px_45px_-32px_rgba(15,23,42,0.35)] [scrollbar-width:thin] dark:border-white/[0.07] dark:bg-zinc-950">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.035]">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                  Profile map
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Your information
                  </p>

                  <span className="flex size-7 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-zinc-300">
                    {sections.length}
                  </span>
                </div>
              </div>

              <nav className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => activate("__personal__")}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition",
                    activeId === "__personal__"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-white/[0.05]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      activeId === "__personal__"
                        ? "bg-white/15"
                        : "bg-slate-100 dark:bg-white/[0.05]",
                    )}
                  >
                    <HiOutlineUser size={16} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">
                      Identity
                    </span>
                    <span
                      className={cn(
                        "block truncate text-[10px]",
                        activeId === "__personal__"
                          ? "text-indigo-100"
                          : "text-slate-400 dark:text-zinc-600",
                      )}
                    >
                      Contact & links
                    </span>
                  </span>
                </button>

                {sections.map((section, index) => {
                  const active =
                    activeId === section.id;

                  return (
                    <button
                      type="button"
                      key={section.id}
                      onClick={() =>
                        activate(section.id)
                      }
                      className={cn(
                        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition",
                        active
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-white/[0.05]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          active
                            ? "bg-white/15"
                            : "bg-slate-100 dark:bg-white/[0.05]",
                        )}
                      >
                        <SectionIcon
                          type={section.type}
                          size={15}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">
                          {section.title}
                        </span>
                        <span
                          className={cn(
                            "block truncate text-[10px]",
                            active
                              ? "text-indigo-100"
                              : "text-slate-400 dark:text-zinc-600",
                          )}
                        >
                          {hasContent(section)
                            ? `${getCount(section)} ${section.type === "SUMMARY"
                              ? "content"
                              : "entries"
                            }`
                            : `Section ${index + 1}`}
                        </span>
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 px-3 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/30 dark:text-indigo-300 dark:hover:bg-indigo-500/[0.06]"
                >
                  <HiOutlinePlus size={16} />
                  Add section
                </button>
              </nav>
            </div>
          </aside>

          {/* ====================================================
              MAIN DOCUMENT
          ==================================================== */}

          <section className="min-w-0 space-y-4 sm:space-y-5">
            {/* mobile navigation */}
            <div className="lg:hidden">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-white/[0.07] dark:bg-zinc-950">
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      activate("__personal__")
                    }
                    className={cn(
                      "flex min-h-8 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[10px] font-bold whitespace-nowrap sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[11px]",
                      activeId === "__personal__"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-50 text-slate-600 dark:bg-white/[0.04] dark:text-zinc-300",
                    )}
                  >
                    <HiOutlineUser size={13} className="sm:size-[15px]" />
                    Identity
                  </button>

                  {sections.map((section) => (
                    <button
                      type="button"
                      key={section.id}
                      onClick={() =>
                        activate(section.id)
                      }
                      className={cn(
                        "flex min-h-8 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[10px] font-bold whitespace-nowrap sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[11px]",
                        activeId === section.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-50 text-slate-600 dark:bg-white/[0.04] dark:text-zinc-300",
                      )}
                    >
                      <SectionIcon
                        type={section.type}
                        size={13}
                      />
                      <span className="max-w-[80px] truncate sm:max-w-[120px]">
                        {section.title}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="flex min-h-8 shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-indigo-300 px-2.5 text-[10px] font-bold text-indigo-600 dark:border-indigo-400/30 dark:text-indigo-300 whitespace-nowrap sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[11px]"
                  >
                    <HiOutlinePlus size={13} className="sm:size-[15px]" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* identity */}
            <section
              id="profile-identity"
              className={cn(
                "scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-[0_16px_50px_-35px_rgba(15,23,42,0.4)] transition-all dark:bg-zinc-950 sm:rounded-3xl",
                activeId === "__personal__"
                  ? "border-indigo-300 dark:border-indigo-400/30"
                  : "border-slate-200 dark:border-white/[0.07]",
              )}
            >
              <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-white/[0.05] dark:bg-white/[0.025] sm:px-7 sm:py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 sm:size-11">
                      <HiOutlineUser size={17} className="sm:size-[20px]" />
                    </div>

                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-indigo-500 sm:text-[9px]">
                        Foundation
                      </p>
                      <h2 className="mt-0.5 text-base font-bold tracking-tight text-slate-950 dark:text-white sm:mt-1 sm:text-lg">
                        Personal identity
                      </h2>
                    </div>
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300 sm:px-3 sm:py-1.5 sm:text-[10px]">
                    Used across resumes
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-7">
                <PersonalEditor
                  value={form}
                  update={updatePersonal}
                />
              </div>
            </section>

            {/* section heading */}
            <div className="flex items-end justify-between gap-3 px-0.5 pt-1 sm:gap-4 sm:pt-2">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-indigo-500 sm:text-[9px]">
                  Master content
                </p>

                <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950 dark:text-white sm:mt-1 sm:text-2xl">
                  Professional sections
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500 sm:mt-1">
                  Keep the complete version here. Your resumes can select what
                  they need later.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="hidden min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-zinc-200 dark:hover:bg-white/[0.06] sm:inline-flex sm:min-h-10 sm:px-3.5"
              >
                <HiOutlinePlus size={14} className="sm:size-[16px]" />
                Add section
              </button>
            </div>

            {/* sections */}
            {sections.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-white/10 dark:bg-zinc-950 sm:p-12">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 sm:size-14">
                  <HiOutlinePlus size={20} className="sm:size-[24px]" />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white sm:mt-5 sm:text-lg">
                  Add your first professional section
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-500">
                  Your master profile can contain your complete experience,
                  education, skills, projects and any additional sections.
                </p>

                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 sm:mt-6 sm:min-h-11 sm:px-5"
                >
                  <HiOutlinePlus size={15} className="sm:size-[17px]" />
                  Add section
                </button>
              </div>
            ) : (
              sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  active={activeId === section.id}
                  expanded={expandedIds.has(section.id)}
                  onActivate={() =>
                    setActiveId(section.id)
                  }
                  onToggle={() =>
                    toggleExpanded(section.id)
                  }
                  onUpdate={(patch) =>
                    updateSection(
                      section.id,
                      patch,
                    )
                  }
                  onDelete={() =>
                    deleteSection(section.id)
                  }
                  onMoveUp={() =>
                    moveSection(
                      section.id,
                      -1,
                    )
                  }
                  onMoveDown={() =>
                    moveSection(
                      section.id,
                      1,
                    )
                  }
                  isLast={index === sections.length - 1}
                />
              ))
            )}

            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/40 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/30 dark:bg-indigo-500/[0.04] dark:text-indigo-300 dark:hover:bg-indigo-500/[0.08] sm:min-h-12 sm:text-sm"
            >
              <HiOutlinePlus size={16} className="sm:size-[18px]" />
              Add another profile section
            </button>

            {/* bottom save */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Keep your master profile current
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500 sm:mt-1">
                  Changes here affect the information available for future
                  resume imports.
                </p>
              </div>

              <button
                type="button"
                onClick={save}
                disabled={saveMutation.isPending}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60 sm:min-h-11 sm:w-auto sm:px-5"
              >
                {saveMutation.isPending ? (
                  <HiOutlineArrowPath
                    size={15}
                    className="animate-spin sm:size-[17px]"
                  />
                ) : (
                  <HiOutlineCheck size={15} className="sm:size-[17px]" />
                )}

                {saveMutation.isPending
                  ? "Saving..."
                  : "Save master profile"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {addOpen && (
        <AddSectionModal
          onClose={() => setAddOpen(false)}
          onAdd={addSection}
        />
      )}
    </main>
  );
}