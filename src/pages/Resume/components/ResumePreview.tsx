import type {
    ResumeContent,
    ResumeEducation,
    ResumeExperience,
    ResumeProject,
} from "../../../types/resume";

interface Props {
    resume: ResumeContent;
}

/* =========================================================
   HELPERS
========================================================= */

function clean(value?: string | null): string {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function formatSkillCategory(value: string): string {
    return value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasEducationContent(
    item: ResumeEducation
): boolean {
    return Boolean(
        clean(item.institution) ||
        clean(item.degree) ||
        clean(item.fieldOfStudy) ||
        clean(item.startDate) ||
        clean(item.endDate) ||
        clean(item.grade) ||
        clean(item.location)
    );
}

function hasExperienceContent(
    item: ResumeExperience
): boolean {
    return Boolean(
        clean(item.company) ||
        clean(item.position) ||
        clean(item.location) ||
        clean(item.startDate) ||
        clean(item.endDate) ||
        item.currentlyWorking ||
        item.description?.some((item) => clean(item))
    );
}

function hasProjectContent(
    item: ResumeProject
): boolean {
    return Boolean(
        clean(item.name) ||
        clean(item.description) ||
        item.technologies?.some((item) => clean(item)) ||
        clean(item.url) ||
        clean(item.github)
    );
}

/* =========================================================
   PREVIEW
========================================================= */

export default function ResumePreview({
    resume,
}: Props) {
    const experience = (resume.experience || []).filter(
        hasExperienceContent
    );

    const education = (resume.education || []).filter(
        hasEducationContent
    );

    const projects = (resume.projects || []).filter(
        hasProjectContent
    );

    const skills = Object.entries(
        resume.skills || {}
    ).filter(
        ([, values]) =>
            Array.isArray(values) &&
            values.some((value) => clean(value))
    );

    return (
        <div
            className="
                mx-auto
                w-full
                max-w-[794px]
                overflow-hidden
                rounded-2xl
                bg-white
                text-black
                shadow-[0_10px_40px_rgba(15,23,42,0.12)]
                transition-all
                duration-200
            "
        >
            <div
                className="
                    min-h-[1123px]
                    px-[38px]
                    py-[38px]
                    sm:px-[48px]
                    sm:py-[46px]
                    lg:px-[54px]
                    lg:py-[52px]
                    font-sans
                "
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="text-center border-b border-slate-200 pb-4 mb-4">
                    <h1
                        className="
                            text-[22px]
                            font-bold
                            leading-tight
                            tracking-[-0.02em]
                            text-slate-900
                            sm:text-[24px]
                            lg:text-[26px]
                        "
                    >
                        {clean(resume.fullName) || "Your Name"}
                    </h1>

                    {clean(resume.headline) && (
                        <p
                            className="
                                mt-1
                                text-[10px]
                                font-medium
                                text-slate-600
                                sm:text-[11px]
                                lg:text-[12px]
                            "
                        >
                            {clean(resume.headline)}
                        </p>
                    )}

                    <div
                        className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            justify-center
                            gap-x-3
                            gap-y-1
                            text-[8px]
                            leading-4
                            text-slate-600
                            sm:text-[8.5px]
                            lg:text-[9px]
                        "
                    >
                        {[
                            clean(resume.location),
                            clean(resume.phone),
                            clean(resume.email),
                            clean(resume.linkedin),
                            clean(resume.github),
                            clean(resume.website),
                        ]
                            .filter(Boolean)
                            .map((item, index, array) => (
                                <span
                                    key={`${item}-${index}`}
                                    className="whitespace-nowrap"
                                >
                                    {item}

                                    {index <
                                        array.length - 1 && (
                                            <span className="ml-2 text-slate-300">
                                                |
                                            </span>
                                        )}
                                </span>
                            ))}
                    </div>
                </header>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                {clean(resume.summary) && (
                    <PreviewSection title="Professional Summary">
                        <p
                            className="
                                text-[8.8px]
                                leading-[1.6]
                                text-slate-700
                                sm:text-[9px]
                                lg:text-[9.5px]
                            "
                        >
                            {clean(resume.summary)}
                        </p>
                    </PreviewSection>
                )}

                {/* =================================================
                    SKILLS
                ================================================= */}

                {skills.length > 0 && (
                    <PreviewSection title="Technical Skills">
                        <div className="space-y-1">
                            {skills.map(
                                ([category, values]) => {
                                    const cleanedValues =
                                        values
                                            .map(clean)
                                            .filter(Boolean);

                                    if (
                                        cleanedValues.length === 0
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <p
                                            key={category}
                                            className="
                                                text-[8.6px]
                                                leading-[1.6]
                                                text-slate-700
                                                sm:text-[9px]
                                                lg:text-[9.5px]
                                            "
                                        >
                                            <span className="font-semibold text-slate-800">
                                                {formatSkillCategory(
                                                    category
                                                )}
                                                :
                                            </span>

                                            {" "}

                                            <span className="text-slate-600">
                                                {cleanedValues.join(
                                                    ", "
                                                )}
                                            </span>
                                        </p>
                                    );
                                }
                            )}
                        </div>
                    </PreviewSection>
                )}

                {/* =================================================
                    EXPERIENCE
                ================================================= */}

                {experience.length > 0 && (
                    <PreviewSection title="Professional Experience">
                        <div className="space-y-4">
                            {experience.map(
                                (item, index) => {
                                    const bullets =
                                        (item.description || [])
                                            .map(clean)
                                            .filter(Boolean);

                                    const dateRange = [
                                        clean(item.startDate),
                                        item.currentlyWorking
                                            ? "Present"
                                            : clean(item.endDate),
                                    ]
                                        .filter(Boolean)
                                        .join(" – ");

                                    return (
                                        <div
                                            key={`${item.company}-${item.position}-${index}`}
                                            className="
                                                break-inside-avoid
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                    mb-1
                                                "
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className="
                                                            text-[9.5px]
                                                            font-semibold
                                                            leading-[1.35]
                                                            text-slate-900
                                                            sm:text-[10px]
                                                            lg:text-[10.5px]
                                                        "
                                                    >
                                                        {clean(
                                                            item.position
                                                        )}
                                                    </p>
                                                    <p
                                                        className="
                                                            text-[8.5px]
                                                            leading-[1.4]
                                                            text-slate-600
                                                            sm:text-[9px]
                                                        "
                                                    >
                                                        {clean(
                                                            item.company
                                                        )}
                                                    </p>
                                                </div>

                                                <div
                                                    className="
                                                        shrink-0
                                                        text-right
                                                        text-[7.8px]
                                                        leading-[1.4]
                                                        text-slate-500
                                                        sm:text-[8px]
                                                    "
                                                >
                                                    {clean(
                                                        item.location
                                                    ) && (
                                                            <div>
                                                                {clean(
                                                                    item.location
                                                                )}
                                                            </div>
                                                        )}

                                                    {dateRange && (
                                                        <div className="font-medium">
                                                            {dateRange}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {bullets.length > 0 && (
                                                <ul
                                                    className="
                                                        mt-1.5
                                                        space-y-0.5
                                                        pl-4
                                                    "
                                                >
                                                    {bullets.map(
                                                        (
                                                            bullet,
                                                            bulletIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    bulletIndex
                                                                }
                                                                className="
                                                                    list-disc
                                                                    text-[8.4px]
                                                                    leading-[1.5]
                                                                    text-slate-700
                                                                    sm:text-[8.8px]
                                                                    lg:text-[9px]
                                                                    marker:text-slate-400
                                                                "
                                                            >
                                                                {bullet}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </PreviewSection>
                )}

                {/* =================================================
                    PROJECTS
                ================================================= */}

                {projects.length > 0 && (
                    <PreviewSection title="Projects">
                        <div className="space-y-3.5">
                            {projects.map(
                                (project, index) => {
                                    const technologies =
                                        (project.technologies || [])
                                            .map(clean)
                                            .filter(Boolean);

                                    return (
                                        <div
                                            key={`${project.name}-${index}`}
                                            className="
                                                break-inside-avoid
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-3
                                                    mb-0.5
                                                "
                                            >
                                                <p
                                                    className="
                                                        text-[9px]
                                                        font-semibold
                                                        leading-[1.35]
                                                        text-slate-900
                                                        sm:text-[9.5px]
                                                        lg:text-[10px]
                                                    "
                                                >
                                                    {clean(
                                                        project.name
                                                    ) ||
                                                        "Project"}
                                                </p>

                                                <div
                                                    className="
                                                        shrink-0
                                                        text-[7.5px]
                                                        text-slate-500
                                                        sm:text-[8px]
                                                    "
                                                >
                                                    {clean(
                                                        project.github
                                                    ) && (
                                                            <a
                                                                href={clean(
                                                                    project.github
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:text-indigo-600 transition-colors"
                                                            >
                                                                GitHub
                                                            </a>
                                                        )}
                                                    {clean(
                                                        project.url
                                                    ) && (
                                                            <a
                                                                href={clean(
                                                                    project.url
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:text-indigo-600 transition-colors ml-2"
                                                            >
                                                                Live
                                                            </a>
                                                        )}
                                                </div>
                                            </div>

                                            {technologies.length >
                                                0 && (
                                                    <p
                                                        className="
                                                        text-[7.8px]
                                                        leading-[1.4]
                                                        text-slate-500
                                                        sm:text-[8px]
                                                    "
                                                    >
                                                        <span className="font-medium text-slate-600">
                                                            Tech:
                                                        </span>
                                                        {" "}
                                                        {technologies.join(
                                                            " • "
                                                        )}
                                                    </p>
                                                )}

                                            {clean(
                                                project.description
                                            ) && (
                                                    <p
                                                        className="
                                                        mt-1
                                                        text-[8.4px]
                                                        leading-[1.5]
                                                        text-slate-700
                                                        sm:text-[8.8px]
                                                        lg:text-[9px]
                                                    "
                                                    >
                                                        {clean(
                                                            project.description
                                                        )}
                                                    </p>
                                                )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </PreviewSection>
                )}

                {/* =================================================
                    EDUCATION
                ================================================= */}

                {education.length > 0 && (
                    <PreviewSection title="Education">
                        <div className="space-y-3">
                            {education.map(
                                (item, index) => {
                                    const degreeLine = [
                                        clean(item.degree),
                                        clean(
                                            item.fieldOfStudy
                                        )
                                            ? `(${clean(
                                                item.fieldOfStudy
                                            )})`
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    return (
                                        <div
                                            key={`${item.institution}-${item.degree}-${index}`}
                                            className="
                                                flex
                                                items-start
                                                justify-between
                                                gap-4
                                                break-inside-avoid
                                            "
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="
                                                        text-[9px]
                                                        font-semibold
                                                        leading-[1.35]
                                                        text-slate-900
                                                        sm:text-[9.5px]
                                                        lg:text-[10px]
                                                    "
                                                >
                                                    {degreeLine ||
                                                        clean(
                                                            item.institution
                                                        )}
                                                </p>

                                                {clean(
                                                    item.institution
                                                ) &&
                                                    degreeLine && (
                                                        <p
                                                            className="
                                                                text-[8.5px]
                                                                leading-[1.4]
                                                                text-slate-600
                                                                sm:text-[9px]
                                                            "
                                                        >
                                                            {clean(
                                                                item.institution
                                                            )}
                                                        </p>
                                                    )}

                                                {clean(
                                                    item.location
                                                ) && (
                                                        <p
                                                            className="
                                                            mt-0.5
                                                            text-[7.8px]
                                                            leading-4
                                                            text-slate-500
                                                            sm:text-[8px]
                                                        "
                                                        >
                                                            {clean(
                                                                item.location
                                                            )}
                                                        </p>
                                                    )}
                                            </div>

                                            <div
                                                className="
                                                    shrink-0
                                                    text-right
                                                    text-[7.8px]
                                                    leading-[1.4]
                                                    text-slate-600
                                                    sm:text-[8px]
                                                "
                                            >
                                                {(() => {
                                                    const dates = [
                                                        clean(
                                                            item.startDate
                                                        ),
                                                        clean(
                                                            item.endDate
                                                        ),
                                                    ]
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .join(
                                                            " – "
                                                        );
                                                    return dates && (
                                                        <div className="font-medium">
                                                            {dates}
                                                        </div>
                                                    );
                                                })()}

                                                {clean(
                                                    item.grade
                                                ) && (
                                                        <div className="text-slate-500">
                                                            {clean(
                                                                item.grade
                                                            ).replace(
                                                                /^CGPA:\s*/i,
                                                                ""
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </PreviewSection>
                )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {experience.length === 0 &&
                    education.length === 0 &&
                    projects.length === 0 &&
                    skills.length === 0 &&
                    !clean(resume.summary) && (
                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                py-12
                                text-center
                            "
                        >
                            <div
                                className="
                                    text-4xl
                                    mb-4
                                "
                            >
                                📄
                            </div>
                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                No content added yet
                            </p>
                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                "
                            >
                                Start editing your resume to see the preview
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}

/* =========================================================
   SECTION
========================================================= */

function PreviewSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section
            className="
                mt-4
                break-inside-auto
                sm:mt-5
                lg:mt-6
            "
        >
            <h2
                className="
                    text-[9.5px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-800
                    sm:text-[10px]
                    lg:text-[10.5px]
                "
            >
                {title}
            </h2>

            <div
                className="
                    mb-2
                    mt-1
                    h-px
                    bg-slate-300
                "
            />

            {children}
        </section>
    );
}