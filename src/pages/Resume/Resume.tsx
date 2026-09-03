import {
    useEffect,
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
    HiOutlineDocumentText,
    HiOutlineEye,
    HiOutlineFolderOpen,
    HiOutlineUser,
    HiOutlineWrenchScrewdriver,
    HiOutlineArrowUpTray,
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
    type ResumeContent,
} from "../../types/resume";

import ResumePreview
    from "./components/ResumePreview";
import React from "react";


/* ============================================================
   NORMALIZE CONTENT

   Everything inside the builder must conform to ResumeContent.
============================================================ */

function normalizeContent(
    value: unknown
): ResumeContent {

    if (
        !value ||
        typeof value !== "object"
    ) {

        return {
            ...emptyResumeContent,
            experience: [],
            education: [],
            skills: {},
            projects: [],
        };

    }

    const data =
        value as Record<string, any>;


    return {

        fullName:
            typeof data.fullName === "string"
                ? data.fullName
                : "",

        email:
            typeof data.email === "string"
                ? data.email
                : "",

        headline:
            typeof data.headline === "string"
                ? data.headline
                : "",

        phone:
            typeof data.phone === "string"
                ? data.phone
                : "",

        location:
            typeof data.location === "string"
                ? data.location
                : "",

        website:
            typeof data.website === "string"
                ? data.website
                : "",

        linkedin:
            typeof data.linkedin === "string"
                ? data.linkedin
                : "",

        github:
            typeof data.github === "string"
                ? data.github
                : "",

        summary:
            typeof data.summary === "string"
                ? data.summary
                : "",


        experience:
            Array.isArray(data.experience)
                ? data.experience.map(
                    (item: any) => ({
                        company:
                            item?.company ?? "",

                        position:
                            item?.position ?? "",

                        location:
                            item?.location ?? "",

                        startDate:
                            item?.startDate ?? "",

                        endDate:
                            item?.endDate ?? "",

                        currentlyWorking:
                            Boolean(
                                item?.currentlyWorking
                            ),

                        description:
                            Array.isArray(
                                item?.description
                            )
                                ? item.description
                                : [],
                    })
                )
                : [],


        education:
            Array.isArray(data.education)
                ? data.education.map(
                    (item: any) => ({
                        institution:
                            item?.institution ?? "",

                        degree:
                            item?.degree ?? "",

                        fieldOfStudy:
                            item?.fieldOfStudy ?? "",

                        startDate:
                            item?.startDate ?? "",

                        endDate:
                            item?.endDate ?? "",

                        grade:
                            item?.grade ?? "",

                        location:
                            item?.location ?? "",
                    })
                )
                : [],


        skills:
            data.skills &&
                typeof data.skills === "object" &&
                !Array.isArray(data.skills)

                ? Object.fromEntries(
                    Object.entries(
                        data.skills
                    ).map(
                        (
                            [
                                category,
                                skills,
                            ]
                        ) => [
                                category,
                                Array.isArray(skills)
                                    ? skills.filter(
                                        (
                                            item
                                        ) =>
                                            typeof item ===
                                            "string"
                                    )
                                    : [],
                            ]
                    )
                )

                : {},


        projects:
            Array.isArray(data.projects)
                ? data.projects.map(
                    (item: any) => ({
                        name:
                            item?.name ?? "",

                        description:
                            item?.description ?? "",

                        technologies:
                            Array.isArray(
                                item?.technologies
                            )
                                ? item.technologies
                                : [],

                        url:
                            item?.url ?? "",

                        github:
                            item?.github ?? "",
                    })
                )
                : [],

    };

}


/* ============================================================
   FIELD
============================================================ */

function Field({
    label,
    value,
    placeholder,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {

    return (

        <label className="block">

            <span
                className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-[var(--text-secondary)]
                "
            >
                {label}
            </span>


            {multiline ? (

                <textarea
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    rows={5}
                    className="
                        min-h-32
                        w-full
                        resize-y
                        rounded-xl
                        border
                        border-[var(--border)]
                        bg-[var(--surface)]
                        px-3.5
                        py-3
                        text-sm
                        text-[var(--text-primary)]
                        outline-none
                        transition
                        focus:border-indigo-500
                        focus:ring-4
                        focus:ring-indigo-500/10
                    "
                />

            ) : (

                <input
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) =>
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
                        text-sm
                        text-[var(--text-primary)]
                        outline-none
                        transition
                        focus:border-indigo-500
                        focus:ring-4
                        focus:ring-indigo-500/10
                    "
                />

            )}

        </label>

    );

}


/* ============================================================
   SECTION
============================================================ */

function EditorSection({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {

    return (

        <section
            className="
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[var(--border-subtle)]
                    px-5
                    py-4
                    sm:px-6
                "
            >

                <div
                    className="
                        flex
                        size-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-50
                        text-indigo-600
                        dark:bg-indigo-500/10
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
                        "
                    >
                        {title}
                    </h2>

                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-[var(--text-muted)]
                        "
                    >
                        {description}
                    </p>

                </div>

            </div>


            <div className="p-5 sm:p-6">

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

        onChange([
            ...value,
            {
                company: "",
                position: "",
                location: "",
                startDate: "",
                endDate: "",
                currentlyWorking: false,
                description: [],
            },
        ]);

    }


    function updateExperience(
        index: number,
        patch: Partial<
            ResumeContent["experience"][number]
        >
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
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

    }


    return (

        <div className="space-y-4">

            {value.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-subtle)]
                            p-4
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                items-center
                                justify-between
                                gap-3
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-[var(--text-muted)]
                                "
                            >
                                Experience {index + 1}
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    removeExperience(index)
                                }
                                className="
                                    text-xs
                                    font-semibold
                                    text-red-600
                                    hover:text-red-700
                                "
                            >
                                Remove
                            </button>

                        </div>


                        <div
                            className="
                                grid
                                gap-4
                                sm:grid-cols-2
                            "
                        >

                            <Field
                                label="Position"
                                value={
                                    item.position
                                }
                                onChange={(value) =>
                                    updateExperience(
                                        index,
                                        {
                                            position:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Company"
                                value={
                                    item.company
                                }
                                onChange={(value) =>
                                    updateExperience(
                                        index,
                                        {
                                            company:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Location"
                                value={
                                    item.location ?? ""
                                }
                                onChange={(value) =>
                                    updateExperience(
                                        index,
                                        {
                                            location:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Start date"
                                value={
                                    item.startDate
                                }
                                onChange={(value) =>
                                    updateExperience(
                                        index,
                                        {
                                            startDate:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="End date"
                                value={
                                    item.endDate ?? ""
                                }
                                onChange={(value) =>
                                    updateExperience(
                                        index,
                                        {
                                            endDate:
                                                value,
                                        }
                                    )
                                }
                            />

                        </div>


                        <label
                            className="
                                mt-4
                                flex
                                items-center
                                gap-2
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
                                onChange={(event) =>
                                    updateExperience(
                                        index,
                                        {
                                            currentlyWorking:
                                                event.target.checked,
                                        }
                                    )
                                }
                            />

                            Currently working here

                        </label>


                        <div className="mt-4">

                            <Field
                                label="Description"
                                multiline
                                value={
                                    item.description.join(
                                        "\n"
                                    )
                                }
                                placeholder={
                                    "One achievement per line"
                                }
                                onChange={(value) =>
                                    updateExperience(
                                        index,
                                        {
                                            description:
                                                value
                                                    .split("\n")
                                                    .map(
                                                        item =>
                                                            item.trim()
                                                    )
                                                    .filter(
                                                        Boolean
                                                    ),
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
                onClick={addExperience}
                className="
                    inline-flex
                    min-h-10
                    items-center
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
                    hover:bg-indigo-50
                    dark:border-indigo-500/40
                    dark:text-indigo-400
                    dark:hover:bg-indigo-500/10
                "
            >
                + Add experience
            </button>

        </div>

    );

}


/* ============================================================
   EDUCATION
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

        onChange([
            ...value,
            {
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                grade: "",
                location: "",
            },
        ]);

    }


    function updateEducation(
        index: number,
        patch: Partial<
            ResumeContent["education"][number]
        >
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
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

    }


    return (

        <div className="space-y-4">

            {value.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-subtle)]
                            p-4
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-[var(--text-muted)]
                                "
                            >
                                Education {index + 1}
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    removeEducation(index)
                                }
                                className="
                                    text-xs
                                    font-semibold
                                    text-red-600
                                "
                            >
                                Remove
                            </button>

                        </div>


                        <div
                            className="
                                grid
                                gap-4
                                sm:grid-cols-2
                            "
                        >

                            <Field
                                label="Institution"
                                value={
                                    item.institution
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            institution:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Degree"
                                value={
                                    item.degree
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            degree:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Field of study"
                                value={
                                    item.fieldOfStudy ?? ""
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            fieldOfStudy:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Location"
                                value={
                                    item.location ?? ""
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            location:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Start date"
                                value={
                                    item.startDate ?? ""
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            startDate:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="End date"
                                value={
                                    item.endDate ?? ""
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            endDate:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Grade"
                                value={
                                    item.grade ?? ""
                                }
                                onChange={(value) =>
                                    updateEducation(
                                        index,
                                        {
                                            grade:
                                                value,
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
                    items-center
                    rounded-xl
                    border
                    border-dashed
                    border-indigo-300
                    px-4
                    text-sm
                    font-semibold
                    text-indigo-600
                    hover:bg-indigo-50
                    dark:border-indigo-500/40
                    dark:text-indigo-400
                "
            >
                + Add education
            </button>

        </div>

    );

}


/* ============================================================
   SKILLS
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
   PROJECTS
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

        onChange([
            ...value,
            {
                name: "",
                description: "",
                technologies: [],
                url: "",
                github: "",
            },
        ]);

    }


    function updateProject(
        index: number,
        patch: Partial<
            ResumeContent["projects"][number]
        >
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
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

    }


    return (

        <div className="space-y-4">

            {value.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-subtle)]
                            p-4
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-[var(--text-muted)]
                                "
                            >
                                Project {index + 1}
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    removeProject(index)
                                }
                                className="
                                    text-xs
                                    font-semibold
                                    text-red-600
                                "
                            >
                                Remove
                            </button>

                        </div>


                        <div className="grid gap-4">

                            <Field
                                label="Project name"
                                value={
                                    item.name
                                }
                                onChange={(value) =>
                                    updateProject(
                                        index,
                                        {
                                            name:
                                                value,
                                        }
                                    )
                                }
                            />


                            <Field
                                label="Description"
                                multiline
                                value={
                                    item.description ?? ""
                                }
                                onChange={(value) =>
                                    updateProject(
                                        index,
                                        {
                                            description:
                                                value,
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
                                onChange={(value) =>
                                    updateProject(
                                        index,
                                        {
                                            technologies:
                                                value
                                                    .split(",")
                                                    .map(
                                                        item =>
                                                            item.trim()
                                                    )
                                                    .filter(
                                                        Boolean
                                                    ),
                                        }
                                    )
                                }
                                placeholder={
                                    "React, Node.js, PostgreSQL"
                                }
                            />


                            <div
                                className="
                                    grid
                                    gap-4
                                    sm:grid-cols-2
                                "
                            >

                                <Field
                                    label="Project URL"
                                    value={
                                        item.url ?? ""
                                    }
                                    onChange={(value) =>
                                        updateProject(
                                            index,
                                            {
                                                url:
                                                    value,
                                            }
                                        )
                                    }
                                />


                                <Field
                                    label="GitHub"
                                    value={
                                        item.github ?? ""
                                    }
                                    onChange={(value) =>
                                        updateProject(
                                            index,
                                            {
                                                github:
                                                    value,
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
                    items-center
                    rounded-xl
                    border
                    border-dashed
                    border-indigo-300
                    px-4
                    text-sm
                    font-semibold
                    text-indigo-600
                "
            >
                + Add project
            </button>

        </div>

    );

}


/* ============================================================
   PREVIEW MODAL
============================================================ */

function PreviewModal({
    isOpen,
    onClose,
    content,
}: {
    isOpen: boolean;
    onClose: () => void;
    content: ResumeContent;
}) {

    if (!isOpen) return null;

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                p-4
            "
        >
            {/* Backdrop */}
            <div
                className="
                    absolute
                    inset-0
                    bg-black/50
                    backdrop-blur-sm
                "
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="
                    relative
                    w-full
                    max-w-4xl
                    max-h-[90vh]
                    rounded-2xl
                    bg-[var(--surface)]
                    shadow-2xl
                    overflow-hidden
                "
            >
                {/* Header */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--border)]
                        px-6
                        py-4
                    "
                >
                    <div>
                        <h2
                            className="
                                text-lg
                                font-bold
                                text-[var(--text-primary)]
                            "
                        >
                            Resume Preview
                        </h2>
                        <p
                            className="
                                text-sm
                                text-[var(--text-muted)]
                            "
                        >
                            A live preview of your resume
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            inline-flex
                            size-10
                            items-center
                            justify-center
                            rounded-xl
                            text-[var(--text-secondary)]
                            transition
                            hover:bg-[var(--surface-hover)]
                            hover:text-[var(--text-primary)]
                        "
                    >
                        <HiOutlineXMark size={22} />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="
                        overflow-auto
                        p-6
                        bg-slate-100
                        dark:bg-zinc-950
                        max-h-[calc(90vh-80px)]
                    "
                >
                    <div className="mx-auto max-w-3xl">
                        <ResumePreview
                            resume={content}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

}


/* ============================================================
   MAIN
============================================================ */

export default function Resume() {

    const queryClient =
        useQueryClient();


    const [
        content,
        setContent,
    ] = useState<ResumeContent>({
        ...emptyResumeContent,
    });


    const [
        isPreviewOpen,
        setIsPreviewOpen,
    ] = useState(false);


    const [
        isDownloading,
        setIsDownloading,
    ] = useState(false);


    /* ========================================================
       MASTER PROFILE
    ======================================================== */

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
       CUSTOMIZATION
    ======================================================== */

    const customizationQuery =
        useQuery({
            queryKey: [
                "resume",
                "customization",
            ],

            queryFn:
                async () => {

                    const response =
                        await getResumeCustomization();

                    return response.data.data;

                },
        });


    /* ========================================================
       IMPORTANT:

       Do NOT populate customization from profile automatically.

       If customization exists -> use customization.

       If it does not exist -> show Import from profile.

       This preserves the separation between master profile
       and resume customization.
    ======================================================== */

    useEffect(() => {

        const customization =
            customizationQuery.data;


        if (
            customization?.content
        ) {

            setContent(
                normalizeContent(
                    customization.content
                )
            );

        }

    }, [
        customizationQuery.data,
    ]);


    /* ========================================================
       IMPORT MASTER PROFILE (Initial creation)
    ======================================================== */

    const importMutation =
        useMutation({

            mutationFn:
                createCustomizationFromProfile,

            onSuccess:
                async (response) => {

                    const imported =
                        response.data.data;


                    if (
                        imported?.content
                    ) {

                        setContent(
                            normalizeContent(
                                imported.content
                            )
                        );

                    }


                    await queryClient.invalidateQueries({
                        queryKey: [
                            "resume",
                            "customization",
                        ],
                    });


                    toast.success(
                        "Profile data imported into this resume."
                    );

                },

            onError:
                (error: any) => {

                    toast.error(
                        error?.response?.data?.message ||
                        "Unable to import profile data."
                    );

                },

        });


    /* ========================================================
       IMPORT FROM MASTER PROFILE (Replace existing)
    ======================================================== */

    const importFromMasterMutation =
        useMutation({

            mutationFn:
                async () => {

                    // First, get the master profile data
                    const profileResponse =
                        await getResumeProfile();

                    const profile =
                        profileResponse.data.data;

                    if (
                        !profile
                    ) {

                        throw new Error(
                            "No profile data found."
                        );

                    }


                    // Then save it as the new customization
                    const content =
                        normalizeContent(
                            profile
                        );


                    const response =
                        await saveResumeCustomization(
                            content
                        );


                    return {
                        ...response,
                        content,
                    };

                },

            onSuccess:
                async (response) => {

                    if (
                        response?.content
                    ) {

                        setContent(
                            response.content
                        );

                    }


                    await queryClient.invalidateQueries({
                        queryKey: [
                            "resume",
                            "customization",
                        ],
                    });


                    toast.success(
                        "Resume data replaced with master profile data."
                    );

                },

            onError:
                (error: any) => {

                    toast.error(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Unable to import from master profile."
                    );

                },

        });


    /* ========================================================
       SAVE
    ======================================================== */

    const saveMutation =
        useMutation({

            mutationFn:
                saveResumeCustomization,

            onSuccess:
                async (response) => {

                    await queryClient.invalidateQueries({
                        queryKey: [
                            "resume",
                            "customization",
                        ],
                    });


                    toast.success(
                        response.data.message ||
                        "Resume saved successfully."
                    );

                },

            onError:
                (error: any) => {

                    toast.error(
                        error?.response?.data?.message ||
                        "Unable to save resume."
                    );

                },

        });


    /* ========================================================
       UPDATE
    ======================================================== */

    function updateContent(
        patch: Partial<ResumeContent>
    ) {

        setContent(
            previous => ({
                ...previous,
                ...patch,
            })
        );

    }


    /* ========================================================
       SAVE HANDLER
    ======================================================== */

    function handleSave() {

        if (
            !customizationQuery.data
        ) {

            toast.error(
                "Import your profile data first."
            );

            return;

        }


        saveMutation.mutate(
            content
        );

    }


    /* ========================================================
       DOWNLOAD PDF with Loading State
    ======================================================== */

    async function handleDownload() {

        if (isDownloading) return;

        setIsDownloading(true);

        try {

            const response =
                await downloadResumePdf();


            const blob =
                new Blob(
                    [
                        response.data,
                    ],
                    {
                        type:
                            "application/pdf",
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const anchor =
                document.createElement(
                    "a"
                );


            const filename =
                (
                    content.fullName ||
                    "resume"
                )
                    .trim()
                    .replace(
                        /[^a-zA-Z0-9]+/g,
                        "-"
                    )
                    .toLowerCase();


            anchor.href =
                url;

            anchor.download =
                `${filename || "resume"}.pdf`;


            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();


            window.URL.revokeObjectURL(
                url
            );

            toast.success("Resume downloaded successfully!");

        } catch (
        error: any
        ) {

            toast.error(
                error?.response?.data?.message ||
                "Unable to download resume."
            );

        } finally {

            setIsDownloading(false);

        }

    }


    /* ========================================================
       LOADING
    ======================================================== */

    if (
        profileQuery.isLoading ||
        customizationQuery.isLoading
    ) {

        return (

            <div
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                "
            >

                <HiOutlineArrowPath
                    size={25}
                    className="
                        animate-spin
                        text-indigo-500
                    "
                />

            </div>

        );

    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (
        profileQuery.isError ||
        customizationQuery.isError
    ) {

        return (

            <div
                className="
                    flex
                    min-h-[60vh]
                    flex-col
                    items-center
                    justify-center
                    px-6
                    text-center
                "
            >

                <HiOutlineDocumentText
                    size={35}
                    className="text-red-500"
                />

                <h2
                    className="
                        mt-4
                        text-base
                        font-bold
                        text-[var(--text-primary)]
                    "
                >
                    Unable to load resume
                </h2>

                <p
                    className="
                        mt-1
                        text-sm
                        text-[var(--text-muted)]
                    "
                >
                    Please try again.
                </p>


                <button
                    type="button"
                    onClick={() => {
                        profileQuery.refetch();
                        customizationQuery.refetch();
                    }}
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
                        hover:bg-indigo-700
                    "
                >

                    <HiOutlineArrowPath size={16} />

                    Try again

                </button>

            </div>

        );

    }


    const hasProfile =
        Boolean(
            profileQuery.data
        );


    const hasCustomization =
        Boolean(
            customizationQuery.data
        );


    /* ========================================================
       NO CUSTOMIZATION

       This is where IMPORT belongs.
    ======================================================== */

    if (
        !hasCustomization
    ) {

        return (

            <main
                className="
                    min-h-full
                    w-full
                    px-4
                    py-5
                    sm:px-6
                    sm:py-6
                    lg:px-8
                    lg:py-8
                "
            >

                <div
                    className="
                        mx-auto
                        w-full
                        max-w-5xl
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface)]
                            p-6
                            shadow-sm
                            sm:p-8
                        "
                    >

                        <div
                            className="
                                flex
                                size-12
                                items-center
                                justify-center
                                rounded-2xl
                                bg-indigo-50
                                text-indigo-600
                                dark:bg-indigo-500/10
                                dark:text-indigo-400
                            "
                        >
                            <HiOutlineDocumentText
                                size={24}
                            />
                        </div>


                        <h1
                            className="
                                mt-5
                                text-2xl
                                font-bold
                                tracking-tight
                                text-[var(--text-primary)]
                            "
                        >
                            Create your resume
                        </h1>


                        <p
                            className="
                                mt-2
                                max-w-xl
                                text-sm
                                leading-6
                                text-[var(--text-muted)]
                            "
                        >
                            Start with the information from your
                            Profile, then customize this resume
                            independently for the role you're applying for.
                        </p>


                        {!hasProfile ? (

                            <div
                                className="
                                    mt-6
                                    rounded-xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    p-4
                                    text-sm
                                    text-amber-800
                                    dark:border-amber-500/20
                                    dark:bg-amber-500/10
                                    dark:text-amber-300
                                "
                            >
                                Complete your Profile first. Your
                                resume is created from that information.
                            </div>

                        ) : (

                            <button
                                type="button"
                                disabled={
                                    importMutation.isPending
                                }
                                onClick={() =>
                                    importMutation.mutate()
                                }
                                className="
                                    mt-6
                                    inline-flex
                                    min-h-11
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-indigo-600
                                    px-5
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-indigo-700
                                    disabled:pointer-events-none
                                    disabled:opacity-60
                                "
                            >

                                {importMutation.isPending ? (

                                    <HiOutlineArrowPath
                                        size={17}
                                        className="animate-spin"
                                    />

                                ) : (

                                    <HiOutlineUser
                                        size={17}
                                    />

                                )}

                                {importMutation.isPending
                                    ? "Importing..."
                                    : "Import from profile"}

                            </button>

                        )}

                    </div>

                </div>

            </main>

        );

    }


    /* ========================================================
       BUILDER
    ======================================================== */

    return (

        <main
            className="
                min-h-full
                w-full
            "
        >

            {/* =================================================
                STICKY TOOLBAR
            ================================================= */}

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
                        min-h-[68px]
                        w-full
                        max-w-[1440px]
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        px-4
                        py-3
                        sm:px-6
                        lg:px-8
                    "
                >

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
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
                                bg-indigo-600
                                text-white
                                shadow-sm
                            "
                        >
                            <HiOutlineDocumentText
                                size={20}
                            />
                        </div>


                        <div className="min-w-0">

                            <h1
                                className="
                                    truncate
                                    text-base
                                    font-bold
                                    text-[var(--text-primary)]
                                    sm:text-lg
                                "
                            >
                                Resume
                            </h1>

                            <p
                                className="
                                    truncate
                                    text-xs
                                    text-[var(--text-muted)]
                                "
                            >
                                Customize your resume
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            flex
                            w-full
                            items-center
                            gap-2
                            sm:w-auto
                        "
                    >

                        {/* Preview Button - Opens Modal */}
                        <button
                            type="button"
                            onClick={() =>
                                setIsPreviewOpen(true)
                            }
                            className="
                                inline-flex
                                min-h-10
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                px-3
                                text-sm
                                font-semibold
                                transition
                                text-[var(--text-secondary)]
                                hover:bg-[var(--surface-hover)]
                                sm:flex-none
                            "
                        >

                            <HiOutlineEye
                                size={16}
                            />

                            <span className="hidden sm:inline">
                                Preview
                            </span>

                        </button>


                        {/* Import from Master Profile Button */}
                        <button
                            type="button"
                            onClick={() =>
                                importFromMasterMutation.mutate()
                            }
                            disabled={
                                importFromMasterMutation.isPending ||
                                !hasProfile
                            }
                            className="
                                inline-flex
                                min-h-10
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-indigo-300
                                bg-white
                                px-3
                                text-sm
                                font-semibold
                                text-indigo-600
                                transition
                                hover:bg-indigo-50
                                disabled:pointer-events-none
                                disabled:opacity-50
                                dark:border-indigo-500/40
                                dark:bg-transparent
                                dark:text-indigo-400
                                dark:hover:bg-indigo-500/10
                                sm:flex-none
                            "
                            title={
                                !hasProfile
                                    ? "No profile data available"
                                    : "Replace current resume with master profile data"
                            }
                        >

                            {importFromMasterMutation.isPending ? (

                                <HiOutlineArrowPath
                                    size={16}
                                    className="animate-spin"
                                />

                            ) : (

                                <HiOutlineArrowUpTray
                                    size={16}
                                />

                            )}

                            <span className="hidden sm:inline">
                                {importFromMasterMutation.isPending
                                    ? "Importing..."
                                    : "Import Master"}
                            </span>

                        </button>


                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={
                                saveMutation.isPending
                            }
                            className="
                                inline-flex
                                min-h-10
                                flex-1
                                items-center
                                justify-center
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
                                disabled:pointer-events-none
                                disabled:opacity-60
                                sm:flex-none
                            "
                        >

                            {saveMutation.isPending ? (

                                <HiOutlineArrowPath
                                    size={16}
                                    className="animate-spin"
                                />

                            ) : (

                                <HiOutlineCheck
                                    size={16}
                                />

                            )}

                            <span>
                                {saveMutation.isPending
                                    ? "Saving"
                                    : "Save"}
                            </span>

                        </button>


                        {/* PDF Download Button with Loading State */}
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="
                                inline-flex
                                min-h-10
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface)]
                                px-3
                                text-sm
                                font-semibold
                                text-[var(--text-secondary)]
                                transition
                                hover:bg-[var(--surface-hover)]
                                hover:text-[var(--text-primary)]
                                disabled:pointer-events-none
                                disabled:opacity-60
                            "
                        >

                            {isDownloading ? (

                                <>
                                    <HiOutlineArrowPath
                                        size={16}
                                        className="animate-spin"
                                    />
                                    <span className="hidden sm:inline">
                                        Downloading...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <HiOutlineArrowDownTray
                                        size={16}
                                    />
                                    <span className="hidden sm:inline">
                                        PDF
                                    </span>
                                </>

                            )}

                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                BUILDER CONTENT - Only Editor (Preview is Modal)
            ================================================= */}

            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1440px]
                    px-4
                    py-5
                    sm:px-6
                    sm:py-6
                    lg:px-8
                    lg:py-8
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-3xl
                        space-y-5
                    "
                >

                    <EditorSection
                        icon={
                            <HiOutlineUser
                                size={18}
                            />
                        }
                        title="Personal information"
                        description="The contact information shown on your resume."
                    >

                        <div
                            className="
                                grid
                                gap-4
                                sm:grid-cols-2
                            "
                        >

                            <Field
                                label="Full name"
                                value={
                                    content.fullName
                                }
                                onChange={(value) =>
                                    updateContent({
                                        fullName:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="Headline"
                                value={
                                    content.headline
                                }
                                onChange={(value) =>
                                    updateContent({
                                        headline:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="Email"
                                value={
                                    content.email
                                }
                                onChange={(value) =>
                                    updateContent({
                                        email:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="Phone"
                                value={
                                    content.phone
                                }
                                onChange={(value) =>
                                    updateContent({
                                        phone:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="Location"
                                value={
                                    content.location
                                }
                                onChange={(value) =>
                                    updateContent({
                                        location:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="Website"
                                value={
                                    content.website
                                }
                                onChange={(value) =>
                                    updateContent({
                                        website:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="LinkedIn"
                                value={
                                    content.linkedin
                                }
                                onChange={(value) =>
                                    updateContent({
                                        linkedin:
                                            value,
                                    })
                                }
                            />


                            <Field
                                label="GitHub"
                                value={
                                    content.github
                                }
                                onChange={(value) =>
                                    updateContent({
                                        github:
                                            value,
                                    })
                                }
                            />

                        </div>

                    </EditorSection>


                    <EditorSection
                        icon={
                            <HiOutlineDocumentText
                                size={18}
                            />
                        }
                        title="Professional summary"
                        description="A concise introduction tailored to this resume."
                    >

                        <Field
                            label="Summary"
                            multiline
                            value={
                                content.summary
                            }
                            onChange={(value) =>
                                updateContent({
                                    summary:
                                        value,
                                })
                            }
                        />

                    </EditorSection>


                    <EditorSection
                        icon={
                            <HiOutlineBriefcase
                                size={18}
                            />
                        }
                        title="Experience"
                        description="Select and customize the experience you want to show."
                    >

                        <ExperienceEditor
                            value={
                                content.experience
                            }
                            onChange={(value) =>
                                updateContent({
                                    experience:
                                        value,
                                })
                            }
                        />

                    </EditorSection>


                    <EditorSection
                        icon={
                            <HiOutlineAcademicCap
                                size={18}
                            />
                        }
                        title="Education"
                        description="Education entries included in this resume."
                    >

                        <EducationEditor
                            value={
                                content.education
                            }
                            onChange={(value) =>
                                updateContent({
                                    education:
                                        value,
                                })
                            }
                        />

                    </EditorSection>


                    <EditorSection
                        icon={
                            <HiOutlineWrenchScrewdriver
                                size={18}
                            />
                        }
                        title="Skills"
                        description="Organize skills into categories for this resume."
                    >

                        <SkillsEditor
                            value={
                                content.skills
                            }
                            onChange={(value) =>
                                updateContent({
                                    skills:
                                        value,
                                })
                            }
                        />

                    </EditorSection>


                    <EditorSection
                        icon={
                            <HiOutlineFolderOpen
                                size={18}
                            />
                        }
                        title="Projects"
                        description="Choose the projects relevant to this application."
                    >

                        <ProjectsEditor
                            value={
                                content.projects
                            }
                            onChange={(value) =>
                                updateContent({
                                    projects:
                                        value,
                                })
                            }
                        />

                    </EditorSection>

                </div>

            </div>


            {/* =================================================
                PREVIEW MODAL
            ================================================= */}

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                content={content}
            />

        </main>

    );

}