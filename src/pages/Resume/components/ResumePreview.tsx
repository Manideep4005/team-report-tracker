import type {
    ResumeProfileContent,
    ResumeEducation,
    ResumeExperience,
    ResumeProject,
    ResumeSection,
    ResumeSectionType,
} from "../../../types/resume";

interface Props {
    resume: ResumeProfileContent;
}

/* ============================================================
   PDF-STYLE CONSTANTS
   Mirrors the current resume PDF generator:
   - A4
   - 1 cm margins
   - Calibri
   - black / dark-gray typography
   - uppercase section title + thin divider
============================================================ */

const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 10;


/* ============================================================
   HELPERS
============================================================ */

function clean(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

function formatSkillCategory(value: string): string {
    return value
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateRange(
    startDate?: unknown,
    endDate?: unknown,
    currentlyWorking?: unknown,
): string {
    const start = clean(startDate);
    const end = currentlyWorking ? "Present" : clean(endDate);

    return [start, end].filter(Boolean).join(" – ");
}

function hasExperienceContent(item: ResumeExperience): boolean {
    return Boolean(
        clean(item.company) ||
        clean(item.position) ||
        clean(item.location) ||
        clean(item.startDate) ||
        clean(item.endDate) ||
        item.currentlyWorking ||
        stringArray(item.description).length,
    );
}

function hasEducationContent(item: ResumeEducation): boolean {
    return Boolean(
        clean(item.institution) ||
        clean(item.degree) ||
        clean(item.fieldOfStudy) ||
        clean(item.startDate) ||
        clean(item.endDate) ||
        clean(item.grade) ||
        clean(item.location),
    );
}

function hasProjectContent(item: ResumeProject): boolean {
    return Boolean(
        clean(item.name) ||
        clean(item.description) ||
        stringArray(item.technologies).length ||
        clean(item.url) ||
        clean(item.github),
    );
}

function getItems(content: unknown): Record<string, unknown>[] {
    const record = asRecord(content);

    return Array.isArray(record.items)
        ? record.items.filter(
            (item): item is Record<string, unknown> =>
                Boolean(item) &&
                typeof item === "object" &&
                !Array.isArray(item),
        )
        : [];
}

function getSkillCategories(
    content: unknown,
): Array<{ name: string; items: string[] }> {
    const record = asRecord(content);

    if (Array.isArray(record.categories)) {
        return record.categories
            .filter(
                (category): category is Record<string, unknown> =>
                    Boolean(category) &&
                    typeof category === "object" &&
                    !Array.isArray(category),
            )
            .map((category) => ({
                name: clean(category.name),
                items: stringArray(category.items),
            }))
            .filter((category) => category.name || category.items.length);
    }

    /*
     * Backward compatibility for old skills objects.
     */
    return Object.entries(record)
        .filter(([key]) => key !== "__order")
        .map(([name, value]) => ({
            name: formatSkillCategory(name),
            items: stringArray(value),
        }))
        .filter((category) => category.items.length);
}

function getSectionTitle(
    section: ResumeSection,
    fallback: string,
): string {
    return clean(section.title) || fallback;
}

/* ============================================================
   DOCUMENT
============================================================ */

export default function ResumePreview({ resume }: Props) {
    const sections = (resume.sections ?? []).filter(
        (section) => section.visible !== false,
    );

    const hasVisibleContent = sections.some((section) =>
        sectionHasContent(section),
    );

    return (
        <div
            className="
        mx-auto
        w-full
        max-w-[794px]
        overflow-hidden
        bg-[#e5e7eb]
        font-[Calibri,Arial,sans-serif]
      "
        >
            <article
                className="
          relative
          mx-auto
          box-border
          w-full
          bg-white
          text-[#111111]
          shadow-[0_14px_45px_rgba(15,23,42,0.14)]
        "
                style={{
                    minHeight: `${A4_HEIGHT_MM}mm`,
                    padding: `${PAGE_MARGIN_MM}mm`,
                }}
            >
                {/* ======================================================
            HEADER — mirrors drawHeader()
        ====================================================== */}

                <header className="text-center">
                    <h1
                        className="
              m-0
              font-[Calibri,Arial,sans-serif]
              text-[25px]
              font-bold
              leading-[1.05]
              text-[#111111]
            "
                    >
                        {clean(resume.fullName) || "Resume"}
                    </h1>

                    {clean(resume.headline) && (
                        <p
                            className="
                mb-0
                mt-[5px]
                font-[Calibri,Arial,sans-serif]
                text-[12px]
                leading-[1.2]
                text-[#222222]
              "
                        >
                            {clean(resume.headline)}
                        </p>
                    )}

                    {getContactValues(resume).length > 0 && (
                        <p
                            className="
                m-0
                mt-[7px]
                font-[Calibri,Arial,sans-serif]
                text-[11.3px]
                leading-[1.15]
                text-[#222222]
              "
                        >
                            {getContactValues(resume).join("  |  ")}
                        </p>
                    )}
                </header>

                <div className="mt-[18px]">
                    {!hasVisibleContent ? (
                        <EmptyPreview />
                    ) : (
                        sections.map((section) => (
                            <PreviewSection
                                key={section.id}
                                section={section}
                            />
                        ))
                    )}
                </div>
            </article>
        </div>
    );
}

/* ============================================================
   CONTACT
============================================================ */

function getContactValues(resume: ResumeProfileContent): string[] {
    return [
        clean(resume.location),
        clean(resume.phone),
        clean(resume.email),
        clean(resume.linkedin),
        clean(resume.github),
        clean(resume.website),
    ].filter(Boolean);
}

/* ============================================================
   SECTION ROUTER

   Section order comes directly from resume.sections[].
   Nothing is sorted here.
============================================================ */

function PreviewSection({
    section,
}: {
    section: ResumeSection;
}) {
    switch (section.type) {
        case "SUMMARY":
            return (
                <PdfSection title={getSectionTitle(section, "Professional Summary")}>
                    <SummaryContent content={section.content} />
                </PdfSection>
            );

        case "SKILLS":
            return (
                <PdfSection title={getSectionTitle(section, "Technical Skills")}>
                    <SkillsContent content={section.content} />
                </PdfSection>
            );

        case "EXPERIENCE":
            return (
                <PdfSection
                    title={getSectionTitle(section, "Professional Experience")}
                >
                    <ExperienceContent content={section.content} />
                </PdfSection>
            );

        case "PROJECTS":
            return (
                <PdfSection title={getSectionTitle(section, "Projects")}>
                    <ProjectsContent content={section.content} />
                </PdfSection>
            );

        case "EDUCATION":
            return (
                <PdfSection title={getSectionTitle(section, "Education")}>
                    <EducationContent content={section.content} />
                </PdfSection>
            );

        case "ACHIEVEMENTS":
        case "CERTIFICATIONS":
        case "AWARDS":
        case "LANGUAGES":
        case "PUBLICATIONS":
        case "VOLUNTEER":
        case "CUSTOM":
        default:
            return (
                <PdfSection title={getSectionTitle(section, fallbackTitle(section.type))}>
                    <GenericContent content={section.content} />
                </PdfSection>
            );
    }
}

/* ============================================================
   SECTION TITLE
   Mirrors drawSectionTitle():
   uppercase, 10pt-ish bold, thin full-width line, breathing room.
============================================================ */

function PdfSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mt-[17px] break-inside-auto">
            <h2
                className="
          m-0
          font-[Calibri,Arial,sans-serif]
          text-[13.3px]
          font-bold
          uppercase
          leading-none
          text-[#111111]
        "
            >
                {title}
            </h2>

            <div
                className="
          mt-[6px]
          h-px
          w-full
          bg-[#555555]
        "
            />

            <div className="pt-[8px]">{children}</div>
        </section>
    );
}

/* ============================================================
   SUMMARY
============================================================ */

function SummaryContent({ content }: { content: unknown }) {
    const summary =
        typeof content === "string"
            ? clean(content)
            : clean(asRecord(content).text ?? asRecord(content).summary);

    if (!summary) {
        return null;
    }

    return (
        <p
            className="
        m-0
        whitespace-pre-line
        font-[Calibri,Arial,sans-serif]
        text-[11.6px]
        leading-[1.38]
        text-[#222222]
      "
        >
            {summary}
        </p>
    );
}

/* ============================================================
   SKILLS
   Mirrors PDF:
   Category: value, value, value
============================================================ */

function SkillsContent({ content }: { content: unknown }) {
    const categories = getSkillCategories(content);

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="space-y-[2px]">
            {categories.map((category, index) => (
                <p
                    key={`${category.name}-${index}`}
                    className="
            m-0
            font-[Calibri,Arial,sans-serif]
            text-[11.6px]
            leading-[1.4]
            text-[#222222]
          "
                >
                    {category.name && (
                        <strong className="font-bold text-[#111111]">
                            {formatSkillCategory(category.name)}:
                        </strong>
                    )}
                    {category.name ? " " : ""}
                    {category.items.join(", ")}
                </p>
            ))}
        </div>
    );
}

/* ============================================================
   EXPERIENCE
   Mirrors PDF:
   Position — Company                 Location
   Date
   • bullet
============================================================ */

function ExperienceContent({ content }: { content: unknown }) {
    const rawItems = getItems(content);

    const items = rawItems.filter((item) =>
        hasExperienceContent(item as unknown as ResumeExperience),
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-[14px]">
            {items.map((item, index) => {
                const position = clean(item.position);
                const company = clean(item.company);
                const location = clean(item.location);
                const date = formatDateRange(
                    item.startDate,
                    item.endDate,
                    item.currentlyWorking,
                );
                const bullets = stringArray(item.description);

                const heading = [position, company].filter(Boolean).join(" — ");

                return (
                    <div
                        key={clean(item.id) || `${company}-${position}-${index}`}
                        className="break-inside-avoid"
                    >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4">
                            <p
                                className="
                  m-0
                  min-w-0
                  font-[Calibri,Arial,sans-serif]
                  text-[11.9px]
                  font-bold
                  leading-[1.15]
                  text-[#111111]
                "
                            >
                                {heading}
                            </p>

                            {location && (
                                <p
                                    className="
                    m-0
                    max-w-[150px]
                    text-right
                    font-[Calibri,Arial,sans-serif]
                    text-[11px]
                    leading-[1.15]
                    text-[#222222]
                  "
                                >
                                    {location}
                                </p>
                            )}
                        </div>

                        {date && (
                            <p
                                className="
                  m-0
                  mt-[4px]
                  font-[Calibri,Arial,sans-serif]
                  text-[10.8px]
                  italic
                  leading-[1.1]
                  text-[#555555]
                "
                            >
                                {date}
                            </p>
                        )}

                        {bullets.length > 0 && (
                            <PdfBullets items={bullets} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ============================================================
   PROJECTS
   Uses the same compact typography/bullet treatment as PDF.
============================================================ */

function ProjectsContent({ content }: { content: unknown }) {
    const rawItems = getItems(content);

    const items = rawItems.filter((item) =>
        hasProjectContent(item as unknown as ResumeProject),
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-[14px]">
            {items.map((item, index) => {
                const name = clean(item.name);
                const technologies = stringArray(item.technologies);
                const description = stringArray(item.description);

                /*
                 * The editor stores project description as a string,
                 * while older data may contain an array.
                 */
                const descriptionLines =
                    typeof item.description === "string"
                        ? clean(item.description)
                            .split(/\r?\n/)
                            .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
                            .filter(Boolean)
                        : description;

                const links = [
                    clean(item.github) ? "GitHub" : "",
                    clean(item.url) ? "Live" : "",
                ].filter(Boolean);

                return (
                    <div
                        key={clean(item.id) || `${name}-${index}`}
                        className="break-inside-avoid"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <p
                                className="
                  m-0
                  font-[Calibri,Arial,sans-serif]
                  text-[11.9px]
                  font-bold
                  leading-[1.15]
                  text-[#111111]
                "
                            >
                                {name || "Project"}
                            </p>

                            {links.length > 0 && (
                                <p
                                    className="
                    m-0
                    shrink-0
                    font-[Calibri,Arial,sans-serif]
                    text-[10px]
                    leading-[1.15]
                    text-[#555555]
                  "
                                >
                                    {links.join("  |  ")}
                                </p>
                            )}
                        </div>

                        {technologies.length > 0 && (
                            <p
                                className="
                  m-0
                  mt-[5px]
                  font-[Calibri,Arial,sans-serif]
                  text-[10.9px]
                  leading-[1.2]
                  text-[#222222]
                "
                            >
                                <strong className="font-bold text-[#111111]">
                                    Technologies:
                                </strong>{" "}
                                {technologies.join(", ")}
                            </p>
                        )}

                        {descriptionLines.length > 0 && (
                            <PdfBullets items={descriptionLines} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ============================================================
   EDUCATION
   Mirrors PDF:
   Degree (Field)                         Date | CGPA
   Institution
============================================================ */

function EducationContent({ content }: { content: unknown }) {
    const rawItems = getItems(content);

    const items = rawItems.filter((item) =>
        hasEducationContent(item as unknown as ResumeEducation),
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-[12px]">
            {items.map((item, index) => {
                const degree = clean(item.degree);
                const field = clean(item.fieldOfStudy);
                const institution = clean(item.institution);
                const location = clean(item.location);

                const degreeLine = [
                    degree,
                    field ? `(${field})` : "",
                ]
                    .filter(Boolean)
                    .join(" ");

                const date = [
                    clean(item.startDate),
                    clean(item.endDate),
                ]
                    .filter(Boolean)
                    .join(" – ");

                const grade = clean(item.grade)
                    ? `CGPA: ${clean(item.grade).replace(/^CGPA:\s*/i, "")}`
                    : "";

                const right = [date, grade]
                    .filter(Boolean)
                    .join(" | ");

                return (
                    <div
                        key={clean(item.id) || `${institution}-${degree}-${index}`}
                        className="break-inside-avoid"
                    >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4">
                            <div className="min-w-0">
                                <p
                                    className="
                    m-0
                    font-[Calibri,Arial,sans-serif]
                    text-[11.9px]
                    font-bold
                    leading-[1.15]
                    text-[#111111]
                  "
                                >
                                    {degreeLine || institution}
                                </p>

                                {degreeLine && institution && (
                                    <p
                                        className="
                      m-0
                      mt-[4px]
                      font-[Calibri,Arial,sans-serif]
                      text-[10.9px]
                      leading-[1.15]
                      text-[#222222]
                    "
                                    >
                                        {institution}
                                    </p>
                                )}

                                {location && (
                                    <p
                                        className="
                      m-0
                      mt-[3px]
                      font-[Calibri,Arial,sans-serif]
                      text-[10px]
                      leading-[1.15]
                      text-[#555555]
                    "
                                    >
                                        {location}
                                    </p>
                                )}
                            </div>

                            {right && (
                                <p
                                    className="
                    m-0
                    shrink-0
                    text-right
                    font-[Calibri,Arial,sans-serif]
                    text-[10.4px]
                    leading-[1.15]
                    text-[#222222]
                  "
                                >
                                    {right}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ============================================================
   GENERIC / CUSTOM SECTIONS
============================================================ */

function GenericContent({ content }: { content: unknown }) {
    if (typeof content === "string") {
        return (
            <p
                className="
          m-0
          whitespace-pre-line
          font-[Calibri,Arial,sans-serif]
          text-[11.6px]
          leading-[1.38]
          text-[#222222]
        "
            >
                {clean(content)}
            </p>
        );
    }

    const record = asRecord(content);

    if (Array.isArray(record.items)) {
        const items = getItems(content);

        return (
            <div className="space-y-[10px]">
                {items.map((item, index) => (
                    <GenericItem
                        key={clean(item.id) || String(index)}
                        item={item}
                    />
                ))}
            </div>
        );
    }

    const text =
        clean(record.text) ||
        clean(record.description) ||
        clean(record.value);

    if (text) {
        return (
            <p
                className="
          m-0
          whitespace-pre-line
          font-[Calibri,Arial,sans-serif]
          text-[11.6px]
          leading-[1.38]
          text-[#222222]
        "
            >
                {text}
            </p>
        );
    }

    return null;
}

function GenericItem({
    item,
}: {
    item: Record<string, unknown>;
}) {
    const title =
        clean(item.title) ||
        clean(item.name) ||
        clean(item.position) ||
        clean(item.institution);

    const subtitle =
        clean(item.subtitle) ||
        clean(item.organization) ||
        clean(item.company);

    const description =
        typeof item.description === "string"
            ? clean(item.description)
            : stringArray(item.description).join("\n");

    const dates = formatDateRange(
        item.startDate,
        item.endDate,
        item.currentlyWorking,
    );

    const value =
        clean(item.value) ||
        clean(item.level) ||
        clean(item.proficiency);

    const bullets = description
        .split(/\r?\n/)
        .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
        .filter(Boolean);

    return (
        <div className="break-inside-avoid">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {title && (
                        <p
                            className="
                m-0
                font-[Calibri,Arial,sans-serif]
                text-[11.9px]
                font-bold
                leading-[1.15]
                text-[#111111]
              "
                        >
                            {title}
                        </p>
                    )}

                    {subtitle && (
                        <p
                            className="
                m-0
                mt-[4px]
                font-[Calibri,Arial,sans-serif]
                text-[10.9px]
                leading-[1.15]
                text-[#222222]
              "
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                {(dates || value) && (
                    <p
                        className="
              m-0
              shrink-0
              text-right
              font-[Calibri,Arial,sans-serif]
              text-[10.4px]
              leading-[1.15]
              text-[#555555]
            "
                    >
                        {[dates, value].filter(Boolean).join(" | ")}
                    </p>
                )}
            </div>

            {bullets.length > 0 && <PdfBullets items={bullets} />}
        </div>
    );
}

/* ============================================================
   BULLETS
   Mirrors the PDF hanging bullet layout.
============================================================ */

function PdfBullets({ items }: { items: string[] }) {
    const cleaned = items
        .map((item) => item.replace(/^\s*[-•*]\s*/, "").trim())
        .filter(Boolean);

    if (cleaned.length === 0) {
        return null;
    }

    return (
        <ul
            className="
        m-0
        mt-[6px]
        list-none
        space-y-[2px]
        p-0
        font-[Calibri,Arial,sans-serif]
        text-[11.3px]
        leading-[1.38]
        text-[#222222]
      "
        >
            {cleaned.map((item, index) => (
                <li
                    key={`${item}-${index}`}
                    className="
            relative
            pl-[14px]
          "
                >
                    <span
                        aria-hidden="true"
                        className="
              absolute
              left-[2px]
              top-0
              font-[Calibri,Arial,sans-serif]
              text-[11.3px]
              text-[#222222]
            "
                    >
                        •
                    </span>

                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/* ============================================================
   CONTENT DETECTION
============================================================ */

function sectionHasContent(section: ResumeSection): boolean {
    const content = section.content;

    if (typeof content === "string") {
        return clean(content).length > 0;
    }

    const record = asRecord(content);

    if (Array.isArray(record.items)) {
        return record.items.length > 0;
    }

    if (Array.isArray(record.categories)) {
        return record.categories.some((category) => {
            const data = asRecord(category);
            return (
                clean(data.name).length > 0 ||
                stringArray(data.items).length > 0
            );
        });
    }

    return Boolean(
        clean(record.text) ||
        clean(record.summary) ||
        clean(record.description) ||
        clean(record.value),
    );
}

/* ============================================================
   TITLES
============================================================ */

function fallbackTitle(type: ResumeSectionType): string {
    switch (type) {
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
            return "Additional Information";
        default:
            return "Section";
    }
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyPreview() {
    return (
        <div
            className="
        flex
        min-h-[180px]
        items-center
        justify-center
        text-center
        font-[Calibri,Arial,sans-serif]
      "
        >
            <div>
                <p className="m-0 text-[12px] text-[#555555]">
                    No resume content added yet.
                </p>
                <p className="m-0 mt-[4px] text-[10px] text-[#777777]">
                    Start adding sections to see the document preview.
                </p>
            </div>
        </div>
    );
}
