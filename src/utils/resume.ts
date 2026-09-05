import {
    RESUME_SECTION_TYPES,
    type ResumeAchievement,
    type ResumeAward,
    type ResumeCertification,
    type ResumeCustomContent,
    type ResumeEducation,
    type ResumeExperience,
    type ResumeLanguage,
    type ResumeProject,
    type ResumePublication,
    type ResumeSection,
    type ResumeSectionType,
    type ResumeSkillsContent,
    type ResumeVolunteer,
} from "../types/resume";

/* ============================================================
   ID
============================================================ */

export function createResumeId(prefix = "resume"): string {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

/* ============================================================
   TYPE GUARDS
============================================================ */

export function isResumeSectionType(
    value: unknown,
): value is ResumeSectionType {
    return (
        typeof value === "string" &&
        (RESUME_SECTION_TYPES as readonly string[]).includes(value)
    );
}

/* ============================================================
   STRING HELPERS
============================================================ */

export function stringValue(value: unknown): string {
    return typeof value === "string" ? value : "";
}

export function stringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item): item is string =>
                typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean);
}

/* ============================================================
   EXPERIENCE
============================================================ */

export function createEmptyExperience(): ResumeExperience {
    return {
        id: createResumeId("experience"),

        company: "",
        position: "",
        location: "",

        startDate: "",
        endDate: "",

        currentlyWorking: false,

        description: [],
    };
}

/* ============================================================
   EDUCATION
============================================================ */

export function createEmptyEducation(): ResumeEducation {
    return {
        id: createResumeId("education"),

        institution: "",
        degree: "",
        fieldOfStudy: "",

        startDate: "",
        endDate: "",

        grade: "",
        location: "",
    };
}

/* ============================================================
   PROJECT
============================================================ */

export function createEmptyProject(): ResumeProject {
    return {
        id: createResumeId("project"),

        name: "",
        description: "",

        technologies: [],

        url: "",
        github: "",
    };
}

/* ============================================================
   SKILLS
============================================================ */

export function createEmptySkills(): ResumeSkillsContent {
    return {
        categories: [],
    };
}

export function createEmptySkillCategory() {
    return {
        id: createResumeId("skill-category"),

        name: "",

        items: [],
    };
}

/* ============================================================
   ACHIEVEMENT
============================================================ */

export function createEmptyAchievement(): ResumeAchievement {
    return {
        id: createResumeId("achievement"),

        title: "",
        description: "",
        date: "",
    };
}

/* ============================================================
   CERTIFICATION
============================================================ */

export function createEmptyCertification(): ResumeCertification {
    return {
        id: createResumeId("certification"),

        name: "",
        issuer: "",

        issueDate: "",
        expiryDate: "",

        credentialId: "",
        credentialUrl: "",
    };
}

/* ============================================================
   AWARD
============================================================ */

export function createEmptyAward(): ResumeAward {
    return {
        id: createResumeId("award"),

        title: "",
        issuer: "",

        date: "",
        description: "",
    };
}

/* ============================================================
   LANGUAGE
============================================================ */

export function createEmptyLanguage(): ResumeLanguage {
    return {
        id: createResumeId("language"),

        language: "",
        proficiency: "",
    };
}

/* ============================================================
   PUBLICATION
============================================================ */

export function createEmptyPublication(): ResumePublication {
    return {
        id: createResumeId("publication"),

        title: "",
        publisher: "",

        date: "",
        url: "",

        description: "",
    };
}

/* ============================================================
   VOLUNTEER
============================================================ */

export function createEmptyVolunteer(): ResumeVolunteer {
    return {
        id: createResumeId("volunteer"),

        organization: "",
        role: "",

        startDate: "",
        endDate: "",

        description: [],
    };
}

/* ============================================================
   CUSTOM
============================================================ */

export function createEmptyCustomContent(): ResumeCustomContent {
    return {
        items: [],
    };
}

export function createEmptyCustomItem() {
    return {
        id: createResumeId("custom-item"),

        title: "",
        subtitle: "",
        description: "",

        date: "",
        location: "",
        url: "",

        bullets: [],
    };
}

/* ============================================================
   SECTION DEFAULT CONTENT
============================================================ */

export function createSectionContent(
    type: ResumeSectionType,
): unknown {
    switch (type) {
        case "SUMMARY":
            return "";

        case "EXPERIENCE":
            return {
                items: [],
            };

        case "EDUCATION":
            return {
                items: [],
            };

        case "SKILLS":
            return createEmptySkills();

        case "PROJECTS":
            return {
                items: [],
            };

        case "ACHIEVEMENTS":
            return {
                items: [],
            };

        case "CERTIFICATIONS":
            return {
                items: [],
            };

        case "AWARDS":
            return {
                items: [],
            };

        case "LANGUAGES":
            return {
                items: [],
            };

        case "PUBLICATIONS":
            return {
                items: [],
            };

        case "VOLUNTEER":
            return {
                items: [],
            };

        case "CUSTOM":
            return createEmptyCustomContent();

        default:
            return null;
    }
}

/* ============================================================
   SECTION TITLES
============================================================ */

export function getDefaultSectionTitle(
    type: ResumeSectionType,
): string {
    switch (type) {
        case "SUMMARY":
            return "Professional Summary";

        case "EXPERIENCE":
            return "Professional Experience";

        case "EDUCATION":
            return "Education";

        case "SKILLS":
            return "Technical Skills";

        case "PROJECTS":
            return "Projects";

        case "ACHIEVEMENTS":
            return "Achievements";

        case "CERTIFICATIONS":
            return "Certifications";

        case "AWARDS":
            return "Awards";

        case "LANGUAGES":
            return "Languages";

        case "PUBLICATIONS":
            return "Publications";

        case "VOLUNTEER":
            return "Volunteer Experience";

        case "CUSTOM":
            return "Custom Section";

        default:
            return "Section";
    }
}

/* ============================================================
   CREATE SECTION
============================================================ */

export function createResumeSection(
    type: ResumeSectionType,
    title?: string,
): ResumeSection {
    return {
        id: createResumeId("section"),

        type,

        title:
            title?.trim() ||
            getDefaultSectionTitle(type),

        visible: true,

        content: createSectionContent(type),
    };
}

/* ============================================================
   NORMALIZE EXPERIENCE
============================================================ */

export function normalizeExperience(
    value: unknown,
): ResumeExperience[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item) =>
                item !== null &&
                typeof item === "object",
        )
        .map((item) => {
            const data =
                item as Record<string, unknown>;

            return {
                id:
                    stringValue(data.id) ||
                    createResumeId("experience"),

                company: stringValue(data.company),

                position: stringValue(data.position),

                location: stringValue(data.location),

                startDate: stringValue(data.startDate),

                endDate: stringValue(data.endDate),

                currentlyWorking:
                    Boolean(
                        data.currentlyWorking ??
                        data.current,
                    ),

                description:
                    stringArray(data.description),
            };
        });
}

/* ============================================================
   NORMALIZE EDUCATION
============================================================ */

export function normalizeEducation(
    value: unknown,
): ResumeEducation[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item) =>
                item !== null &&
                typeof item === "object",
        )
        .map((item) => {
            const data =
                item as Record<string, unknown>;

            return {
                id:
                    stringValue(data.id) ||
                    createResumeId("education"),

                institution:
                    stringValue(data.institution),

                degree: stringValue(data.degree),

                fieldOfStudy: stringValue(
                    data.fieldOfStudy ??
                    data.field,
                ),

                startDate:
                    stringValue(data.startDate),

                endDate:
                    stringValue(data.endDate),

                grade: stringValue(data.grade),

                location:
                    stringValue(data.location),
            };
        });
}

/* ============================================================
   NORMALIZE PROJECTS
============================================================ */

export function normalizeProjects(
    value: unknown,
): ResumeProject[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item) =>
                item !== null &&
                typeof item === "object",
        )
        .map((item) => {
            const data =
                item as Record<string, unknown>;

            const description = Array.isArray(
                data.description,
            )
                ? stringArray(data.description).join(
                    "\n",
                )
                : stringValue(data.description);

            return {
                id:
                    stringValue(data.id) ||
                    createResumeId("project"),

                name: stringValue(data.name),

                description,

                technologies:
                    stringArray(data.technologies),

                url: stringValue(data.url),

                github: stringValue(data.github),
            };
        });
}

/* ============================================================
   NORMALIZE SKILLS
============================================================ */

/**
 * New format:
 *
 * {
 *   categories: [
 *     {
 *       id: "...",
 *       name: "Frontend",
 *       items: ["React", "TypeScript"]
 *     }
 *   ]
 * }
 *
 * Legacy object format is also accepted temporarily.
 *
 * __order is deliberately NOT generated.
 */

export function normalizeSkills(
    value: unknown,
): ResumeSkillsContent {
    if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        const data =
            value as Record<string, unknown>;

        if (Array.isArray(data.categories)) {
            return {
                categories: data.categories
                    .filter(
                        (item) =>
                            item !== null &&
                            typeof item === "object",
                    )
                    .map((item) => {
                        const category =
                            item as Record<string, unknown>;

                        return {
                            id:
                                stringValue(category.id) ||
                                createResumeId(
                                    "skill-category",
                                ),

                            name: stringValue(
                                category.name,
                            ),

                            items: stringArray(
                                category.items,
                            ),
                        };
                    }),
            };
        }

        /*
         * Legacy:
         *
         * {
         *   Frontend: ["React", "TypeScript"],
         *   Backend: ["Node.js"]
         * }
         *
         * This is only a migration compatibility
         * path. We do NOT create __order.
         */
        const categories = Object.entries(data)
            .filter(
                ([key]) =>
                    key !== "__order",
            );

        return {
            categories: categories.map(
                ([name, items]) => ({
                    id: createResumeId(
                        "skill-category",
                    ),

                    name,

                    items: stringArray(items),
                }),
            ),
        };
    }

    return createEmptySkills();
}

/* ============================================================
   NORMALIZE SECTION CONTENT
============================================================ */

function normalizeSectionContent(
    section: ResumeSection,
): ResumeSection {
    switch (section.type) {
        case "SUMMARY":
            return {
                ...section,

                content: stringValue(
                    section.content,
                ),
            };

        case "EXPERIENCE": {
            const content =
                section.content &&
                    typeof section.content === "object"
                    ? (section.content as Record<
                        string,
                        unknown
                    >)
                    : {};

            return {
                ...section,

                content: {
                    items: normalizeExperience(
                        content.items,
                    ),
                },
            };
        }

        case "EDUCATION": {
            const content =
                section.content &&
                    typeof section.content === "object"
                    ? (section.content as Record<
                        string,
                        unknown
                    >)
                    : {};

            return {
                ...section,

                content: {
                    items: normalizeEducation(
                        content.items,
                    ),
                },
            };
        }

        case "PROJECTS": {
            const content =
                section.content &&
                    typeof section.content === "object"
                    ? (section.content as Record<
                        string,
                        unknown
                    >)
                    : {};

            return {
                ...section,

                content: {
                    items: normalizeProjects(
                        content.items,
                    ),
                },
            };
        }

        case "SKILLS":
            return {
                ...section,

                content: normalizeSkills(
                    section.content,
                ),
            };

        default:
            return section;
    }
}

/* ============================================================
   NORMALIZE SECTIONS
============================================================ */

export function normalizeSections(
    value: unknown,
): ResumeSection[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const seenIds = new Set<string>();

    return value
        .filter(
            (item): item is Record<string, unknown> =>
                item !== null &&
                typeof item === "object",
        )
        .map((item) => {
            let id = stringValue(item.id);

            if (!id || seenIds.has(id)) {
                id = createResumeId("section");
            }

            seenIds.add(id);

            const type = isResumeSectionType(
                item.type,
            )
                ? item.type
                : "CUSTOM";

            const section: ResumeSection = {
                id,

                type,

                title:
                    stringValue(item.title) ||
                    getDefaultSectionTitle(type),

                visible:
                    typeof item.visible === "boolean"
                        ? item.visible
                        : true,

                content:
                    item.content ??
                    createSectionContent(type),
            };

            return normalizeSectionContent(
                section,
            );
        });
}

/* ============================================================
   NORMALIZE RESUME CONTENT
============================================================ */

export function normalizeResumeContent(
    value: unknown,
) {
    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        return {
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
    }

    const data =
        value as Record<string, unknown>;

    return {
        fullName: stringValue(data.fullName),

        email: stringValue(data.email),

        headline: stringValue(data.headline),

        phone: stringValue(data.phone),

        location: stringValue(data.location),

        website: stringValue(data.website),

        linkedin: stringValue(data.linkedin),

        github: stringValue(data.github),

        sections: normalizeSections(
            data.sections,
        ),
    };
}