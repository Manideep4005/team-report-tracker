import {
    useEffect,
    useState,
    type ReactNode,
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
    HiOutlineFolderOpen,
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
    type ResumeContent,
    type ResumeExperience,
    type ResumeEducation,
    type ResumeProject,
    type ResumeSkills,
} from "../../types/resume";
import React from "react";



/* ============================================================
   HELPERS
============================================================ */

function stringValue(
    value: unknown
): string {

    return typeof value === "string"
        ? value
        : "";
}


function stringArray(
    value: unknown
): string[] {

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (
                item
            ): item is string =>
                typeof item === "string"
        )
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);
}


function normalizeExperience(
    value: unknown
): ResumeExperience[] {

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            item =>
                Boolean(item) &&
                typeof item === "object"
        )
        .map(
            item => {

                const data =
                    item as Record<string, unknown>;

                return {
                    company:
                        stringValue(
                            data.company
                        ),

                    position:
                        stringValue(
                            data.position
                        ),

                    location:
                        stringValue(
                            data.location
                        ),

                    startDate:
                        stringValue(
                            data.startDate
                        ),

                    endDate:
                        stringValue(
                            data.endDate
                        ),

                    currentlyWorking:
                        Boolean(
                            data.currentlyWorking ??
                            data.current
                        ),

                    description:
                        stringArray(
                            data.description
                        ),
                };
            }
        );
}


function normalizeEducation(
    value: unknown
): ResumeEducation[] {

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            item =>
                Boolean(item) &&
                typeof item === "object"
        )
        .map(
            item => {

                const data =
                    item as Record<string, unknown>;

                return {
                    institution:
                        stringValue(
                            data.institution
                        ),

                    degree:
                        stringValue(
                            data.degree
                        ),

                    /*
                     * Current frontend type is
                     * `fieldOfStudy`.
                     *
                     * Support old `field` data
                     * while converting it.
                     */
                    fieldOfStudy:
                        stringValue(
                            data.fieldOfStudy ??
                            data.field
                        ),

                    startDate:
                        stringValue(
                            data.startDate
                        ),

                    endDate:
                        stringValue(
                            data.endDate
                        ),

                    grade:
                        stringValue(
                            data.grade
                        ),

                    location:
                        stringValue(
                            data.location
                        ),
                };
            }
        );
}


function normalizeProjects(
    value: unknown
): ResumeProject[] {

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            item =>
                Boolean(item) &&
                typeof item === "object"
        )
        .map(
            item => {

                const data =
                    item as Record<string, unknown>;

                return {
                    name:
                        stringValue(
                            data.name
                        ),

                    /*
                     * Current type expects a string.
                     *
                     * If older data contains an array,
                     * convert it to readable text.
                     */
                    description:
                        Array.isArray(
                            data.description
                        )
                            ? stringArray(
                                data.description
                            ).join("\n")
                            : stringValue(
                                data.description
                            ),

                    technologies:
                        stringArray(
                            data.technologies
                        ),

                    url:
                        stringValue(
                            data.url
                        ),

                    github:
                        stringValue(
                            data.github
                        ),
                };
            }
        );
}


function normalizeSkills(
    value: unknown
): ResumeSkills {

    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        return {};
    }

    const result: ResumeSkills = {};

    Object.entries(
        value as Record<string, unknown>
    ).forEach(
        (
            [category, skills]
        ) => {

            const normalized =
                stringArray(
                    skills
                );

            if (
                normalized.length > 0
            ) {
                result[category] =
                    normalized;
            }
        }
    );

    return result;
}


function normalizeProfile(
    value: unknown
): ResumeContent {

    if (
        !value ||
        typeof value !== "object"
    ) {
        return {
            ...emptyResumeContent,
        };
    }

    const data =
        value as Record<string, unknown>;

    return {

        fullName:
            stringValue(
                data.fullName
            ),

        email:
            stringValue(
                data.email
            ),

        headline:
            stringValue(
                data.headline
            ),

        phone:
            stringValue(
                data.phone
            ),

        location:
            stringValue(
                data.location
            ),

        website:
            stringValue(
                data.website
            ),

        linkedin:
            stringValue(
                data.linkedin
            ),

        github:
            stringValue(
                data.github
            ),

        summary:
            stringValue(
                data.summary
            ),

        experience:
            normalizeExperience(
                data.experience
            ),

        education:
            normalizeEducation(
                data.education
            ),

        skills:
            normalizeSkills(
                data.skills
            ),

        projects:
            normalizeProjects(
                data.projects
            ),
    };
}


/* ============================================================
   REUSABLE FIELD
============================================================ */

function Field({
    label,
    value,
    placeholder,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (
        value: string
    ) => void;
    type?: string;
}) {

    return (
        <label className="block min-w-0">

            <span
                className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[var(--text-secondary)]
                "
            >
                {label}
            </span>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={
                    event =>
                        onChange(
                            event.target.value
                        )
                }
                className="
                    min-h-11
                    w-full
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    px-3.5
                    py-2.5
                    text-sm
                    text-[var(--text-primary)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-subtle)]
                    hover:border-[var(--border-strong)]
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    dark:focus:border-indigo-400
                    dark:focus:ring-indigo-400/10
                "
            />

        </label>
    );
}


/* ============================================================
   TEXTAREA FIELD
============================================================ */

function TextAreaField({
    label,
    value,
    placeholder,
    onChange,
    rows = 5,
}: {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (
        value: string
    ) => void;
    rows?: number;
}) {

    return (
        <label className="block">

            <span
                className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[var(--text-secondary)]
                "
            >
                {label}
            </span>

            <textarea
                value={value}
                placeholder={placeholder}
                rows={rows}
                onChange={
                    event =>
                        onChange(
                            event.target.value
                        )
                }
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
                    placeholder:text-[var(--text-subtle)]
                    hover:border-[var(--border-strong)]
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    dark:focus:border-indigo-400
                    dark:focus:ring-indigo-400/10
                "
            />

        </label>
    );
}


/* ============================================================
   SECTION
============================================================ */

function Section({
    icon,
    title,
    description,
    children,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
}) {

    return (
        <section
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                shadow-sm
                transition-all
                hover:shadow-md
            "
        >

            <div
                className="
                    flex
                    items-start
                    gap-3
                    border-b
                    border-[var(--border-subtle)]
                    bg-gradient-to-r
                    from-indigo-500/5
                    to-transparent
                    px-4
                    py-4
                    sm:px-6
                    sm:py-5
                "
            >

                <div
                    className="
                        flex
                        size-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-500/10
                        text-indigo-600
                        transition-colors
                        group-hover:bg-indigo-500/20
                        dark:text-indigo-400
                    "
                >
                    {icon}
                </div>

                <div className="min-w-0">

                    <h2
                        className="
                            text-sm
                            font-bold
                            text-[var(--text-primary)]
                            sm:text-[15px]
                        "
                    >
                        {title}
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-[var(--text-muted)]
                            sm:text-sm
                        "
                    >
                        {description}
                    </p>

                </div>

            </div>

            <div
                className="
                    space-y-5
                    p-4
                    sm:p-6
                "
            >
                {children}
            </div>

        </section>
    );
}


/* ============================================================
   EXPERIENCE EDITOR
============================================================ */

function ExperienceEditor({
    value,
    onChange,
}: {
    value: ResumeContent["experience"];
    onChange: (
        value: ResumeContent["experience"]
    ) => void;
}) {

    function addExperience() {

        const item: ResumeExperience = {
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            currentlyWorking: false,
            description: [],
        };

        onChange([
            ...value,
            item,
        ]);
    }


    function updateExperience(
        index: number,
        patch: Partial<ResumeExperience>
    ) {

        onChange(
            value.map(
                (
                    item,
                    itemIndex
                ) =>
                    itemIndex === index
                        ? {
                            ...item,
                            ...patch,
                        }
                        : item
            )
        );
    }


    function removeExperience(
        index: number
    ) {

        onChange(
            value.filter(
                (
                    _,
                    itemIndex
                ) =>
                    itemIndex !== index
            )
        );
    }


    function updateDescription(
        index: number,
        text: string
    ) {

        updateExperience(
            index,
            {
                description:
                    text
                        .split(/\r?\n/)
                        .map(
                            line =>
                                line
                                    .replace(
                                        /^[-•*]\s*/,
                                        ""
                                    )
                                    .trim()
                        )
                        .filter(Boolean),
            }
        );
    }


    return (
        <div className="space-y-4">

            {value.length === 0 && (
                <EmptyEditorState
                    text="No experience added yet."
                />
            )}

            {value.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-subtle)]
                            p-4
                            transition-all
                            hover:border-[var(--border-strong)]
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                mb-5
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[var(--text-primary)]
                                    "
                                >
                                    Experience {index + 1}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[var(--text-muted)]
                                    "
                                >
                                    Professional work experience
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    removeExperience(
                                        index
                                    )
                                }
                                className="
                                    inline-flex
                                    size-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-[var(--text-muted)]
                                    transition
                                    hover:bg-red-500/10
                                    hover:text-red-500
                                "
                                aria-label="Remove experience"
                            >
                                <HiOutlineTrash
                                    size={17}
                                />
                            </button>

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                            "
                        >

                            <Field
                                label="Company"
                                value={
                                    item.company
                                }
                                placeholder="Company name"
                                onChange={
                                    company =>
                                        updateExperience(
                                            index,
                                            {
                                                company,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Position"
                                value={
                                    item.position
                                }
                                placeholder="Software Engineer"
                                onChange={
                                    position =>
                                        updateExperience(
                                            index,
                                            {
                                                position,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Location"
                                value={
                                    item.location ?? ""
                                }
                                placeholder="Hyderabad, India"
                                onChange={
                                    location =>
                                        updateExperience(
                                            index,
                                            {
                                                location,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Start date"
                                value={
                                    item.startDate
                                }
                                placeholder="Jan 2024"
                                onChange={
                                    startDate =>
                                        updateExperience(
                                            index,
                                            {
                                                startDate,
                                            }
                                        )
                                }
                            />

                            {!item.currentlyWorking && (
                                <Field
                                    label="End date"
                                    value={
                                        item.endDate ?? ""
                                    }
                                    placeholder="Present / Dec 2025"
                                    onChange={
                                        endDate =>
                                            updateExperience(
                                                index,
                                                {
                                                    endDate,
                                                }
                                            )
                                    }
                                />
                            )}

                        </div>


                        <label
                            className="
                                mt-4
                                flex
                                cursor-pointer
                                items-center
                                gap-2.5
                                text-sm
                                text-[var(--text-secondary)]
                            "
                        >

                            <input
                                type="checkbox"
                                checked={
                                    Boolean(
                                        item.currentlyWorking
                                    )
                                }
                                onChange={
                                    event =>
                                        updateExperience(
                                            index,
                                            {
                                                currentlyWorking:
                                                    event.target.checked,

                                                ...(event.target.checked
                                                    ? {
                                                        endDate: "",
                                                    }
                                                    : {}),
                                            }
                                        )
                                }
                                className="
                                    size-4
                                    rounded
                                    border-slate-300
                                    text-indigo-600
                                    focus:ring-indigo-500
                                "
                            />

                            <span>
                                I currently work here
                            </span>

                        </label>


                        <div className="mt-4">

                            <TextAreaField
                                label="Responsibilities"
                                value={
                                    Array.isArray(
                                        item.description
                                    )
                                        ? item.description.join(
                                            "\n"
                                        )
                                        : ""
                                }
                                placeholder="One responsibility per line"
                                rows={5}
                                onChange={
                                    text =>
                                        updateDescription(
                                            index,
                                            text
                                        )
                                }
                            />

                            <p
                                className="
                                    mt-1.5
                                    text-xs
                                    text-[var(--text-muted)]
                                "
                            >
                                Add one achievement or responsibility per line.
                            </p>

                        </div>

                    </div>
                )
            )}


            <button
                type="button"
                onClick={addExperience}
                className="
                    inline-flex
                    min-h-10
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-dashed
                    border-indigo-300
                    px-4
                    text-sm
                    font-semibold
                    text-indigo-600
                    transition
                    hover:bg-indigo-500/5
                    dark:border-indigo-500/40
                    dark:text-indigo-400
                    dark:hover:bg-indigo-500/10
                    sm:w-auto
                "
            >
                <HiOutlinePlus
                    size={16}
                />
                Add experience
            </button>

        </div>
    );
}


/* ============================================================
   EDUCATION EDITOR
============================================================ */

function EducationEditor({
    value,
    onChange,
}: {
    value: ResumeContent["education"];
    onChange: (
        value: ResumeContent["education"]
    ) => void;
}) {

    function addEducation() {

        const item: ResumeEducation = {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            grade: "",
            location: "",
        };

        onChange([
            ...value,
            item,
        ]);
    }


    function updateEducation(
        index: number,
        patch: Partial<ResumeEducation>
    ) {

        onChange(
            value.map(
                (
                    item,
                    itemIndex
                ) =>
                    itemIndex === index
                        ? {
                            ...item,
                            ...patch,
                        }
                        : item
            )
        );
    }


    function removeEducation(
        index: number
    ) {

        onChange(
            value.filter(
                (
                    _,
                    itemIndex
                ) =>
                    itemIndex !== index
            )
        );
    }


    return (
        <div className="space-y-4">

            {value.length === 0 && (
                <EmptyEditorState
                    text="No education added yet."
                />
            )}

            {value.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-subtle)]
                            p-4
                            transition-all
                            hover:border-[var(--border-strong)]
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                mb-5
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[var(--text-primary)]
                                    "
                                >
                                    Education {index + 1}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[var(--text-muted)]
                                    "
                                >
                                    Degrees and academic qualifications
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    removeEducation(
                                        index
                                    )
                                }
                                className="
                                    inline-flex
                                    size-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-[var(--text-muted)]
                                    transition
                                    hover:bg-red-500/10
                                    hover:text-red-500
                                "
                                aria-label="Remove education"
                            >
                                <HiOutlineTrash
                                    size={17}
                                />
                            </button>

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                            "
                        >

                            <Field
                                label="Institution"
                                value={
                                    item.institution
                                }
                                placeholder="University / College"
                                onChange={
                                    institution =>
                                        updateEducation(
                                            index,
                                            {
                                                institution,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Degree"
                                value={
                                    item.degree
                                }
                                placeholder="B.Tech"
                                onChange={
                                    degree =>
                                        updateEducation(
                                            index,
                                            {
                                                degree,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Field of study"
                                value={
                                    item.fieldOfStudy ?? ""
                                }
                                placeholder="Computer Science"
                                onChange={
                                    fieldOfStudy =>
                                        updateEducation(
                                            index,
                                            {
                                                fieldOfStudy,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Location"
                                value={
                                    item.location ?? ""
                                }
                                placeholder="Hyderabad, India"
                                onChange={
                                    location =>
                                        updateEducation(
                                            index,
                                            {
                                                location,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Start date"
                                value={
                                    item.startDate ?? ""
                                }
                                placeholder="2019"
                                onChange={
                                    startDate =>
                                        updateEducation(
                                            index,
                                            {
                                                startDate,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="End date"
                                value={
                                    item.endDate ?? ""
                                }
                                placeholder="2023"
                                onChange={
                                    endDate =>
                                        updateEducation(
                                            index,
                                            {
                                                endDate,
                                            }
                                        )
                                }
                            />

                            <Field
                                label="Grade"
                                value={
                                    item.grade ?? ""
                                }
                                placeholder="8.5 CGPA"
                                onChange={
                                    grade =>
                                        updateEducation(
                                            index,
                                            {
                                                grade,
                                            }
                                        )
                                }
                            />

                        </div>

                    </div>
                )
            )}


            <button
                type="button"
                onClick={addEducation}
                className="
                    inline-flex
                    min-h-10
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-dashed
                    border-indigo-300
                    px-4
                    text-sm
                    font-semibold
                    text-indigo-600
                    transition
                    hover:bg-indigo-500/5
                    dark:border-indigo-500/40
                    dark:text-indigo-400
                    dark:hover:bg-indigo-500/10
                    sm:w-auto
                "
            >
                <HiOutlinePlus
                    size={16}
                />
                Add education
            </button>

        </div>
    );
}


/* ============================================================
   SKILLS EDITOR
============================================================ */

function SkillsEditor({
    value,
    onChange,
}: {
    value: ResumeContent["skills"];
    onChange: (
        value: ResumeContent["skills"]
    ) => void;
}) {

    /*
     * Stable IDs for the UI rows.
     *
     * The actual resume data remains:
     *
     * {
     *   "Frontend": ["React", "TypeScript"],
     *   "Backend": ["Node.js"]
     * }
     *
     * These IDs are only used by React so typing in a category
     * name never causes the row to remount or jump.
     */

    const rowIdsRef = React.useRef<
        Map<string, string>
    >(new Map());





    /*
     * Get a stable ID for a category.
     *
     * The ID is generated once and then reused even when
     * the category name changes.
     */
    function getRowId(
        category: string
    ): string {

        const existing =
            rowIdsRef.current.get(
                category
            );

        if (existing) {
            return existing;
        }

        const id =
            `skill-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

        rowIdsRef.current.set(
            category,
            id
        );

        return id;
    }


    /*
     * Make sure every existing category has a stable ID.
     */
    const categories =
        React.useMemo(
            () => {

                Object.keys(value).forEach(
                    category => {
                        getRowId(category);
                    }
                );

                return Object.keys(value);

            },
            [value]
        );


    /*
     * Remove IDs that no longer exist.
     */
    React.useEffect(
        () => {

            const currentCategories =
                new Set(
                    Object.keys(value)
                );

            rowIdsRef.current.forEach(
                (_, category) => {

                    if (
                        !currentCategories.has(
                            category
                        )
                    ) {
                        rowIdsRef.current.delete(
                            category
                        );
                    }

                }
            );

        },
        [value]
    );


    function addCategory() {

        let category =
            "Technical Skills";

        let counter = 1;

        while (
            Object.prototype.hasOwnProperty.call(
                value,
                category
            )
        ) {

            counter += 1;

            category =
                `Skills ${counter}`;

        }


        const id =
            `skill-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;


        rowIdsRef.current.set(
            category,
            id
        );


        onChange({
            ...value,
            [category]: [],
        });

    }


    function renameCategory(
        oldName: string,
        newName: string
    ) {

        /*
         * Don't do anything when the name hasn't changed.
         */
        if (
            newName === oldName
        ) {
            return;
        }


        /*
         * If the user temporarily clears the field,
         * keep the existing category in the data.
         *
         * The input will visually continue showing the
         * category because we maintain a local draft below.
         */
        if (
            !newName.trim()
        ) {
            return;
        }


        /*
         * Don't allow duplicate category names.
         */
        if (
            newName !== oldName &&
            Object.prototype.hasOwnProperty.call(
                value,
                newName
            )
        ) {
            return;
        }


        const rowId =
            rowIdsRef.current.get(
                oldName
            );



        const next: ResumeContent["skills"] =
            {};


        Object.entries(value).forEach(
            (
                [
                    category,
                    categorySkills,
                ]
            ) => {

                if (
                    category === oldName
                ) {

                    next[newName] =
                        categorySkills;

                } else {

                    next[category] =
                        categorySkills;

                }

            }
        );


        /*
         * Move the stable ID from the old category
         * name to the new category name.
         */
        rowIdsRef.current.delete(
            oldName
        );


        if (rowId) {

            rowIdsRef.current.set(
                newName,
                rowId
            );

        }


        onChange(next);

    }


    function updateSkills(
        category: string,
        raw: string
    ) {

        onChange({
            ...value,

            [category]:
                raw
                    .split(",")
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean),
        });

    }


    function removeCategory(
        category: string
    ) {

        rowIdsRef.current.delete(
            category
        );


        const next = {
            ...value,
        };


        delete next[category];


        onChange(next);

    }


    return (

        <div className="space-y-4">

            {categories.map(
                category => {

                    const rowId =
                        getRowId(
                            category
                        );


                    return (

                        <div
                            key={rowId}
                            className="
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-subtle)]
                                p-4
                            "
                        >

                            <div
                                className="
                                    grid
                                    gap-3
                                    sm:grid-cols-[220px_1fr_auto]
                                "
                            >

                                {/* =================================================
                                    CATEGORY
                                ================================================= */}

                                <input
                                    value={category}
                                    onChange={(
                                        event
                                    ) =>
                                        renameCategory(
                                            category,
                                            event.target.value
                                        )
                                    }
                                    placeholder="Category"
                                    className="
                                        min-h-10
                                        rounded-lg
                                        border
                                        border-[var(--border)]
                                        bg-[var(--surface)]
                                        px-3
                                        text-sm
                                        font-semibold
                                        text-[var(--text-primary)]
                                        outline-none
                                        focus:border-indigo-500
                                        focus:ring-2
                                        focus:ring-indigo-500/20
                                    "
                                />


                                {/* =================================================
                                    SKILLS
                                ================================================= */}

                                <input
                                    value={
                                        Array.isArray(
                                            value[category]
                                        )
                                            ? value[
                                                category
                                            ].join(", ")
                                            : ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateSkills(
                                            category,
                                            event.target.value
                                        )
                                    }
                                    placeholder="React, TypeScript, Node.js"
                                    className="
                                        min-h-10
                                        rounded-lg
                                        border
                                        border-[var(--border)]
                                        bg-[var(--surface)]
                                        px-3
                                        text-sm
                                        text-[var(--text-primary)]
                                        outline-none
                                        focus:border-indigo-500
                                        focus:ring-2
                                        focus:ring-indigo-500/20
                                    "
                                />


                                {/* =================================================
                                    REMOVE
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeCategory(
                                            category
                                        )
                                    }
                                    className="
                                        text-xs
                                        font-semibold
                                        text-red-600
                                        transition-colors
                                        hover:text-red-700
                                    "
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    );

                }
            )}


            {/* =================================================
                ADD CATEGORY
            ================================================= */}

            <button
                type="button"
                onClick={addCategory}
                className="
                    inline-flex
                    min-h-10
                    items-center
                    rounded-xl
                    border
                    border-dashed
                    border-indigo-300
                    px-4
                    text-sm
                    font-semibold
                    text-indigo-600
                    transition
                    hover:bg-indigo-50
                    dark:border-indigo-500/40
                    dark:text-indigo-400
                    dark:hover:bg-indigo-500/10
                "
            >
                + Add skill category
            </button>

        </div>

    );

}


/* ============================================================
   PROJECTS EDITOR
============================================================ */

function ProjectsEditor({
    value,
    onChange,
}: {
    value: ResumeContent["projects"];
    onChange: (
        value: ResumeContent["projects"]
    ) => void;
}) {

    function addProject() {

        const item: ResumeProject = {
            name: "",
            description: "",
            technologies: [],
            url: "",
            github: "",
        };

        onChange([
            ...value,
            item,
        ]);
    }


    function updateProject(
        index: number,
        patch: Partial<ResumeProject>
    ) {

        onChange(
            value.map(
                (
                    item,
                    itemIndex
                ) =>
                    itemIndex === index
                        ? {
                            ...item,
                            ...patch,
                        }
                        : item
            )
        );
    }


    function removeProject(
        index: number
    ) {

        onChange(
            value.filter(
                (
                    _,
                    itemIndex
                ) =>
                    itemIndex !== index
            )
        );
    }


    function updateTechnologies(
        index: number,
        text: string
    ) {

        updateProject(
            index,
            {
                technologies:
                    text
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean),
            }
        );
    }


    return (
        <div className="space-y-4">

            {value.length === 0 && (
                <EmptyEditorState
                    text="No projects added yet."
                />
            )}

            {value.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-subtle)]
                            p-4
                            transition-all
                            hover:border-[var(--border-strong)]
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                mb-5
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[var(--text-primary)]
                                    "
                                >
                                    Project {index + 1}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[var(--text-muted)]
                                    "
                                >
                                    Projects available for resume customization
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    removeProject(
                                        index
                                    )
                                }
                                className="
                                    inline-flex
                                    size-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-[var(--text-muted)]
                                    transition
                                    hover:bg-red-500/10
                                    hover:text-red-500
                                "
                                aria-label="Remove project"
                            >
                                <HiOutlineTrash
                                    size={17}
                                />
                            </button>

                        </div>


                        <div className="space-y-4">

                            <Field
                                label="Project name"
                                value={
                                    item.name
                                }
                                placeholder="Team Report Tracker"
                                onChange={
                                    name =>
                                        updateProject(
                                            index,
                                            {
                                                name,
                                            }
                                        )
                                }
                            />


                            <TextAreaField
                                label="Description"
                                value={
                                    item.description ?? ""
                                }
                                placeholder="Briefly describe what you built and what problem it solves."
                                rows={4}
                                onChange={
                                    description =>
                                        updateProject(
                                            index,
                                            {
                                                description,
                                            }
                                        )
                                }
                            />


                            <Field
                                label="Technologies"
                                value={
                                    Array.isArray(
                                        item.technologies
                                    )
                                        ? item.technologies.join(
                                            ", "
                                        )
                                        : ""
                                }
                                placeholder="React, TypeScript, Node.js, PostgreSQL"
                                onChange={
                                    text =>
                                        updateTechnologies(
                                            index,
                                            text
                                        )
                                }
                            />


                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-4
                                    md:grid-cols-2
                                "
                            >

                                <Field
                                    label="Project URL"
                                    value={
                                        item.url ?? ""
                                    }
                                    placeholder="https://example.com"
                                    onChange={
                                        url =>
                                            updateProject(
                                                index,
                                                {
                                                    url,
                                                }
                                            )
                                    }
                                />

                                <Field
                                    label="GitHub"
                                    value={
                                        item.github ?? ""
                                    }
                                    placeholder="https://github.com/..."
                                    onChange={
                                        github =>
                                            updateProject(
                                                index,
                                                {
                                                    github,
                                                }
                                            )
                                    }
                                />

                            </div>

                        </div>

                    </div>
                )
            )}


            <button
                type="button"
                onClick={addProject}
                className="
                    inline-flex
                    min-h-10
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-dashed
                    border-indigo-300
                    px-4
                    text-sm
                    font-semibold
                    text-indigo-600
                    transition
                    hover:bg-indigo-500/5
                    dark:border-indigo-500/40
                    dark:text-indigo-400
                    dark:hover:bg-indigo-500/10
                    sm:w-auto
                "
            >
                <HiOutlinePlus
                    size={16}
                />
                Add project
            </button>

        </div>
    );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyEditorState({
    text,
}: {
    text: string;
}) {

    return (
        <div
            className="
                flex
                min-h-20
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-[var(--border)]
                px-4
                text-center
                text-sm
                text-[var(--text-muted)]
            "
        >
            {text}
        </div>
    );
}


/* ============================================================
   PROFILE PAGE
============================================================ */

export default function Profile() {

    const queryClient =
        useQueryClient();


    const [
        form,
        setForm,
    ] = useState<ResumeContent>(
        emptyResumeContent
    );


    const profileQuery =
        useQuery({

            queryKey: [
                "resume",
                "profile",
            ],

            queryFn:
                async () => {

                    const response =
                        await getResumeProfile();

                    return response.data.data;

                },

        });


    /* ========================================================
       LOAD PROFILE
    ======================================================== */

    useEffect(
        () => {

            if (
                profileQuery.data
            ) {

                setForm(
                    normalizeProfile(
                        profileQuery.data
                    )
                );

                return;
            }

            if (
                profileQuery.data === null
            ) {

                setForm({
                    ...emptyResumeContent,
                });
            }

        },
        [
            profileQuery.data,
        ]
    );


    /* ========================================================
       SAVE
    ======================================================== */

    const saveMutation =
        useMutation({

            mutationFn:
                saveResumeProfile,

            onSuccess:
                async response => {

                    await queryClient.invalidateQueries({
                        queryKey: [
                            "resume",
                            "profile",
                        ],
                    });

                    toast.success(
                        response?.data?.message ||
                        "Profile saved successfully."
                    );

                },

            onError:
                (
                    error: any
                ) => {

                    toast.error(
                        error?.response
                            ?.data
                            ?.message ||
                        "Unable to save profile."
                    );

                },

        });


    function update(
        patch: Partial<ResumeContent>
    ) {

        setForm(
            previous => ({
                ...previous,
                ...patch,
            })
        );
    }


    function handleSave() {

        saveMutation.mutate(
            form
        );
    }


    /* ========================================================
       LOADING
    ======================================================== */

    if (
        profileQuery.isLoading
    ) {

        return (
            <main
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                    p-6
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        text-sm
                        text-[var(--text-muted)]
                    "
                >

                    <HiOutlineArrowPath
                        size={20}
                        className="animate-spin"
                    />

                    Loading profile...

                </div>

            </main>
        );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (
        profileQuery.isError
    ) {

        return (
            <main
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                    p-6
                "
            >

                <div
                    className="
                        w-full
                        max-w-md
                        rounded-2xl
                        border
                        border-[var(--border)]
                        bg-[var(--surface)]
                        p-6
                        text-center
                        shadow-sm
                    "
                >

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-[var(--text-primary)]
                        "
                    >
                        Unable to load your profile
                    </p>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-[var(--text-muted)]
                        "
                    >
                        Something went wrong while loading
                        your master profile.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            profileQuery.refetch()
                        }
                        className="
                            mt-5
                            inline-flex
                            min-h-10
                            items-center
                            gap-2
                            rounded-xl
                            bg-indigo-600
                            px-4
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-indigo-700
                            active:scale-[0.98]
                        "
                    >
                        <HiOutlineArrowPath
                            size={16}
                        />
                        Try again
                    </button>

                </div>

            </main>
        );
    }


    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <main className="w-full bg-[var(--background)]">

            {/* ==================================================
                STICKY HEADER
            ================================================== */}

            <div
                className="
        sticky
        top-0
        z-20
        border-b
        border-[var(--border-subtle)]
        bg-[var(--surface)]/95
        backdrop-blur-xl
    "
            >
                <div
                    className="
            mx-auto
            flex
            w-full
            max-w-[1200px]
            items-center
            justify-between
            gap-4
            px-4
            py-4
            sm:px-6
            lg:px-8
        "
                >
                    {/* Left */}
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="
                    flex
                    size-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--brand-soft)]
                    text-[var(--brand)]
                "
                        >
                            <HiOutlineUser size={21} />
                        </div>

                        <div className="min-w-0">
                            <h1
                                className="
                        truncate
                        text-lg
                        font-bold
                        tracking-tight
                        text-[var(--text-primary)]
                        sm:text-xl
                    "
                            >
                                Profile
                            </h1>

                            <p
                                className="
                        mt-0.5
                        hidden
                        truncate
                        text-xs
                        text-[var(--text-muted)]
                        sm:block
                    "
                            >
                                Manage the information used across your resumes
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="
                inline-flex
                min-h-10
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[var(--brand)]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-150
                hover:bg-[var(--brand-hover)]
                hover:shadow-md
                active:scale-[0.98]
                disabled:pointer-events-none
                disabled:opacity-60
                sm:min-h-11
                sm:px-5
            "
                    >
                        {saveMutation.isPending ? (
                            <HiOutlineArrowPath
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <HiOutlineCheck size={17} />
                        )}

                        <span>
                            {saveMutation.isPending
                                ? "Saving..."
                                : "Save changes"}
                        </span>
                    </button>
                </div>
            </div>


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1200px]
                    px-4
                    py-5
                    sm:px-6
                    sm:py-7
                    lg:px-8
                    lg:py-8
                "
            >

                {/* MASTER DATA NOTICE */}

                <div
                    className="
                        mb-6
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-indigo-200
                        bg-gradient-to-r
                        from-indigo-50
                        to-indigo-100/50
                        p-4
                        dark:border-indigo-500/20
                        dark:from-indigo-500/10
                        dark:to-indigo-500/5
                    "
                >

                    <div
                        className="
                            mt-0.5
                            flex
                            size-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-500/10
                            text-indigo-600
                            dark:text-indigo-400
                        "
                    >
                        <HiOutlineLink
                            size={17}
                        />
                    </div>

                    <div>

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-indigo-900
                                dark:text-indigo-200
                            "
                        >
                            This is your master data
                        </p>

                        <p
                            className="
                                mt-1
                                text-xs
                                leading-5
                                text-indigo-700
                                dark:text-indigo-300/80
                                sm:text-sm
                            "
                        >
                            Keep your professional information here.
                            When you create a resume, the Resume Builder
                            starts with this information and lets you
                            customize it independently.
                        </p>

                    </div>

                </div>


                <div className="space-y-6">

                    {/* ==================================================
                        BASIC INFORMATION
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineUser
                                size={19}
                            />
                        }
                        title="Basic information"
                        description="Your core professional identity and contact information."
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                            "
                        >

                            <Field
                                label="Full name"
                                value={
                                    form.fullName
                                }
                                placeholder="Your full name"
                                onChange={
                                    fullName =>
                                        update({
                                            fullName,
                                        })
                                }
                            />

                            <Field
                                label="Email"
                                type="email"
                                value={
                                    form.email
                                }
                                placeholder="you@example.com"
                                onChange={
                                    email =>
                                        update({
                                            email,
                                        })
                                }
                            />

                            <Field
                                label="Phone"
                                value={
                                    form.phone
                                }
                                placeholder="+91 98765 43210"
                                onChange={
                                    phone =>
                                        update({
                                            phone,
                                        })
                                }
                            />

                            <Field
                                label="Location"
                                value={
                                    form.location
                                }
                                placeholder="Hyderabad, India"
                                onChange={
                                    location =>
                                        update({
                                            location,
                                        })
                                }
                            />

                            <Field
                                label="Professional headline"
                                value={
                                    form.headline
                                }
                                placeholder="Full Stack Developer"
                                onChange={
                                    headline =>
                                        update({
                                            headline,
                                        })
                                }
                            />

                        </div>

                    </Section>


                    {/* ==================================================
                        LINKS
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineLink
                                size={19}
                            />
                        }
                        title="Professional links"
                        description="Add the online profiles you want available for your resumes."
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                            "
                        >

                            <Field
                                label="Website"
                                value={
                                    form.website
                                }
                                placeholder="https://yourwebsite.com"
                                onChange={
                                    website =>
                                        update({
                                            website,
                                        })
                                }
                            />

                            <Field
                                label="LinkedIn"
                                value={
                                    form.linkedin
                                }
                                placeholder="https://linkedin.com/in/..."
                                onChange={
                                    linkedin =>
                                        update({
                                            linkedin,
                                        })
                                }
                            />

                            <Field
                                label="GitHub"
                                value={
                                    form.github
                                }
                                placeholder="https://github.com/..."
                                onChange={
                                    github =>
                                        update({
                                            github,
                                        })
                                }
                            />

                        </div>

                    </Section>


                    {/* ==================================================
                        SUMMARY
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineWrenchScrewdriver
                                size={19}
                            />
                        }
                        title="Professional summary"
                        description="Write a reusable professional summary for your resumes."
                    >

                        <TextAreaField
                            label="Summary"
                            value={
                                form.summary
                            }
                            placeholder="Experienced software engineer with..."
                            rows={7}
                            onChange={
                                summary =>
                                    update({
                                        summary,
                                    })
                            }
                        />

                    </Section>


                    {/* ==================================================
                        EXPERIENCE
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineBriefcase
                                size={19}
                            />
                        }
                        title="Experience"
                        description="Maintain your complete professional experience here."
                    >

                        <ExperienceEditor
                            value={
                                form.experience
                            }
                            onChange={
                                experience =>
                                    update({
                                        experience,
                                    })
                            }
                        />

                    </Section>


                    {/* ==================================================
                        EDUCATION
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineAcademicCap
                                size={19}
                            />
                        }
                        title="Education"
                        description="Add degrees and academic qualifications to your master profile."
                    >

                        <EducationEditor
                            value={
                                form.education
                            }
                            onChange={
                                education =>
                                    update({
                                        education,
                                    })
                            }
                        />

                    </Section>


                    {/* ==================================================
                        SKILLS
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineWrenchScrewdriver
                                size={19}
                            />
                        }
                        title="Skills"
                        description="Organize your skills into categories that can be reused across resumes."
                    >

                        <SkillsEditor
                            value={
                                form.skills
                            }
                            onChange={
                                skills =>
                                    update({
                                        skills,
                                    })
                            }
                        />

                    </Section>


                    {/* ==================================================
                        PROJECTS
                    ================================================== */}

                    <Section
                        icon={
                            <HiOutlineFolderOpen
                                size={19}
                            />
                        }
                        title="Projects"
                        description="Keep your complete project portfolio here. Select and customize projects later in Resume Builder."
                    >

                        <ProjectsEditor
                            value={
                                form.projects
                            }
                            onChange={
                                projects =>
                                    update({
                                        projects,
                                    })
                            }
                        />

                    </Section>


                    {/* ==================================================
                        BOTTOM SAVE
                    ================================================== */}

                    <div
                        className="
                            flex
                            justify-end
                            border-t
                            border-[var(--border-subtle)]
                            pt-6
                        "
                    >

                        <button
                            type="button"
                            onClick={
                                handleSave
                            }
                            disabled={
                                saveMutation.isPending
                            }
                            className="
                                inline-flex
                                min-h-11
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-indigo-600
                                to-indigo-700
                                px-5
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-indigo-600/30
                                transition-all
                                hover:shadow-indigo-600/40
                                hover:scale-[1.02]
                                active:scale-[0.98]
                                disabled:pointer-events-none
                                disabled:opacity-60
                                sm:w-auto
                            "
                        >

                            {saveMutation.isPending ? (
                                <HiOutlineArrowPath
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                <HiOutlineCheck
                                    size={17}
                                />
                            )}

                            {saveMutation.isPending
                                ? "Saving..."
                                : "Save master profile"}

                        </button>

                    </div>

                </div>

            </div>

        </main>
    );
}