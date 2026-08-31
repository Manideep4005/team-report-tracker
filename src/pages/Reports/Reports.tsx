import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  HiOutlineClipboardDocument,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineChevronDown,
} from "react-icons/hi2";

import { format } from "date-fns";
import { toast } from "sonner";

import {
  getAllReports,
  getUsersForReports,
  getUserReports,
  type ReportUser,
} from "../../services/report";

import DayPickerInput from "../../components/DayPickerInput";

/* ================================================================
   TYPES
================================================================ */

interface ReportItem {
  id: string;
  description: string;
  reportDate: string;
  createdAt?: string;
  updatedAt?: string;

  user: {
    id: string;
    name: string;
    email: string;
    deletedAt: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ReportsResponse {
  reports: ReportItem[];
  pagination: Pagination;
}

interface UsersResponse {
  success: boolean;
  data: ReportUser[];
}

interface DateGroup {
  date: string;
  reports: ReportItem[];
}

/* ================================================================
   CONSTANTS
================================================================ */

const REPORTS_PER_PAGE = 10;

const ALL_USERS = "all";

/* ================================================================
   SCREEN
================================================================ */

export default function Reports() {
  const [date, setDate] =
    useState<Date | null>(null);

  const [page, setPage] =
    useState(1);

  const [selectedUserId, setSelectedUserId] =
    useState(ALL_USERS);

  const dateParam = date
    ? format(date, "yyyy-MM-dd")
    : undefined;


  /* ==============================================================
     USERS
  ============================================================== */

  const {
    data: usersData,
    isLoading: usersLoading,
  } = useQuery<UsersResponse>({
    queryKey: ["report-users"],

    queryFn: async () => {
      return getUsersForReports();
    },

    staleTime: 5 * 60 * 1000,
  });


  const users =
    usersData?.data ?? [];


  const selectedUser =
    users.find(
      (user) =>
        user.id === selectedUserId
    );


  /* ==============================================================
     REPORTS
  ============================================================== */

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useQuery<ReportsResponse>({
    queryKey: [
      "reports",
      selectedUserId,
      dateParam,
      page,
      REPORTS_PER_PAGE,
    ],

    queryFn: async () => {

      if (
        selectedUserId === ALL_USERS
      ) {
        const response =
          await getAllReports(
            dateParam,
            page,
            REPORTS_PER_PAGE
          );

        return response.data;
      }


      const response =
        await getUserReports(
          selectedUserId,
          dateParam,
          page,
          REPORTS_PER_PAGE
        );

      return response.data;
    },

    placeholderData: (
      previousData
    ) => previousData,
  });


  /* ==============================================================
     REPORTS
  ============================================================== */

  const reports =
    data?.reports ?? [];


  /* ==============================================================
     PAGINATION
  ============================================================== */

  const pagination =
    data?.pagination;


  /* ==============================================================
     GROUP REPORTS BY DATE
  ============================================================== */

  const groupedReports =
    useMemo<DateGroup[]>(() => {

      if (!reports.length) {
        return [];
      }


      const groups =
        new Map<
          string,
          ReportItem[]
        >();


      for (const report of reports) {

        const reportDate =
          new Date(
            report.reportDate
          );


        if (
          Number.isNaN(
            reportDate.getTime()
          )
        ) {
          continue;
        }


        const key =
          format(
            reportDate,
            "yyyy-MM-dd"
          );


        if (!groups.has(key)) {
          groups.set(
            key,
            []
          );
        }


        groups
          .get(key)!
          .push(report);
      }


      return Array.from(
        groups.entries()
      )
        .sort(
          ([a], [b]) =>
            b.localeCompare(a)
        )
        .map(
          ([date, reports]) => ({
            date,

            reports:
              reports.sort(
                (a, b) =>
                  a.user.name.localeCompare(
                    b.user.name
                  )
              ),
          })
        );

    }, [reports]);


  /* ==============================================================
     COPY
  ============================================================== */

  const handleCopy = async (
    text: string
  ) => {

    try {

      await navigator.clipboard.writeText(
        text
      );

      toast.success(
        "Reports copied successfully."
      );

    } catch {

      toast.error(
        "Unable to copy reports."
      );

    }
  };


  /* ==============================================================
     DATE CHANGE
  ============================================================== */

  const handleDateChange = (
    newDate: Date | null
  ) => {

    setDate(newDate);

    setPage(1);
  };


  /* ==============================================================
     CLEAR DATE
  ============================================================== */

  const handleClearDate = () => {

    setDate(null);

    setPage(1);
  };


  /* ==============================================================
     USER CHANGE
  ============================================================== */

  const handleUserChange = (
    userId: string
  ) => {

    setSelectedUserId(userId);

    setPage(1);
  };


  /* ==============================================================
     CLEAR USER
  ============================================================== */

  const handleClearUser = () => {

    setSelectedUserId(ALL_USERS);

    setPage(1);
  };


  /* ==============================================================
     PAGE CHANGE
  ============================================================== */

  const handlePageChange = (
    newPage: number
  ) => {

    if (
      !pagination ||
      newPage < 1 ||
      newPage >
      pagination.totalPages ||
      newPage === pagination.page ||
      isFetching
    ) {
      return;
    }


    setPage(newPage);


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* ==============================================================
     TOTAL
  ============================================================== */

  const totalReports =
    pagination?.total ?? 0;


  /* ==============================================================
     TITLE
  ============================================================== */

  const screenTitle =
    selectedUser
      ? `${selectedUser.name} 's Reports`
      : "Team Reports";


  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1100px]

        px-4
        py-5

        sm:px-6
        sm:py-7

        lg:px-8
        lg:py-8
      "
    >

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div
        className="
          border-b
          border-slate-200/80

          pb-5

          dark:border-zinc-800/80

          sm:pb-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          {/* =====================================================
              TITLE
          ===================================================== */}

          <div className="min-w-0">

            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
              "
            >

              <HiOutlineUsers
                className="
                  h-5
                  w-5
                  shrink-0

                  text-indigo-500

                  dark:text-indigo-400
                "
              />

              <h1
                className="
                  min-w-0

                  truncate

                  text-[25px]
                  font-bold
                  tracking-[-0.035em]

                  text-slate-950

                  dark:text-white

                  sm:text-3xl
                "
              >
                {screenTitle}
              </h1>

            </div>


            <p
              className="
                mt-1.5

                text-sm

                text-slate-500

                dark:text-zinc-500
              "
            >

              {selectedUser
                ? `Viewing all reports submitted by ${selectedUser.name}.`
                : "Browse the team's daily work reports."}

            </p>

          </div>


          {/* =====================================================
              FILTER AREA
          ===================================================== */}

          <div
            className="
              grid
              w-full
              grid-cols-1
              gap-2

              sm:grid-cols-2

              lg:w-auto
              lg:grid-cols-[minmax(210px,240px)_auto_auto]
            "
          >

            {/* ===================================================
                USER SELECTOR
            =================================================== */}

            <div
              className="
                relative
                min-w-0
              "
            >

              <select
                value={selectedUserId}
                onChange={(event) =>
                  handleUserChange(
                    event.target.value
                  )
                }

                disabled={usersLoading}

                className="
                  block

                  h-10
                  w-full
                  min-w-0

                  appearance-none

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  pl-3.5
                  pr-10

                  text-xs
                  font-semibold

                  text-slate-700

                  shadow-sm

                  outline-none

                  transition

                  focus:border-indigo-400
                  focus:ring-2
                  focus:ring-indigo-100

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-300

                  dark:focus:border-indigo-500
                  dark:focus:ring-indigo-500/10

                  sm:text-sm
                "
              >

                <option value={ALL_USERS}>
                  All users
                </option>


                {users.map(
                  (user) => (

                    <option
                      key={
                        user.id
                      }

                      value={
                        user.id
                      }
                    >
                      {user.name}
                      {user.deletedAt
                        ? " — Inactive"
                        : ""}
                    </option>

                  )
                )}

              </select>


              <HiOutlineChevronDown
                className="
                  pointer-events-none

                  absolute
                  right-3
                  top-1/2

                  h-4
                  w-4

                  -translate-y-1/2

                  text-slate-400

                  dark:text-zinc-500
                "
              />

            </div>


            {/* ===================================================
                DATE
            =================================================== */}

            <div
              className="
                min-w-0
              "
            >

              <DayPickerInput
                value={date}
                onChange={
                  handleDateChange
                }
                placeholder="Filter by date"
              />

            </div>


            {/* ===================================================
                CLEAR
            =================================================== */}

            <button
              type="button"

              onClick={() => {
                handleClearDate();
                handleClearUser();
              }}

              disabled={
                !date &&
                selectedUserId ===
                ALL_USERS
              }

              className="
                inline-flex

                h-10
                w-full

                items-center
                justify-center
                gap-1.5

                rounded-xl

                border
                border-slate-200

                bg-white

                px-3.5

                text-xs
                font-semibold

                text-slate-600

                shadow-sm

                transition

                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900

                disabled:cursor-not-allowed
                disabled:opacity-35

                dark:border-zinc-800
                dark:bg-zinc-900
                dark:text-zinc-400

                dark:hover:border-zinc-700
                dark:hover:bg-zinc-800
                dark:hover:text-zinc-200

                sm:w-auto
              "
            >

              <HiOutlineXMark
                className="
                  h-4
                  w-4
                "
              />

              Clear

            </button>

          </div>

        </div>


        {/* =======================================================
            ACTIVE FILTER / COUNT
        ======================================================= */}

        <div
          className="
            mt-4

            flex
            min-w-0
            flex-wrap
            items-center
            gap-2
          "
        >

          {!isLoading &&
            totalReports > 0 && (

              <div
                className="
                  inline-flex

                  h-8
                  items-center

                  rounded-lg

                  border
                  border-indigo-100

                  bg-indigo-50

                  px-3

                  text-[11px]
                  font-bold

                  text-indigo-600

                  dark:border-indigo-500/20
                  dark:bg-indigo-500/10
                  dark:text-indigo-400
                "
              >

                {totalReports}{" "}
                {totalReports === 1
                  ? "Report"
                  : "Reports"}

              </div>

            )}


          {selectedUser && (

            <div
              className="
                inline-flex
                min-w-0
                max-w-full

                items-center
                gap-1.5

                rounded-lg

                border
                border-slate-200

                bg-slate-50

                px-2.5
                py-1

                text-[11px]
                font-semibold

                text-slate-600

                dark:border-zinc-800
                dark:bg-zinc-900
                dark:text-zinc-400
              "
            >

              <span className="truncate">
                {selectedUser.name}
              </span>


              {selectedUser.deletedAt && (

                <span
                  className="
                    shrink-0

                    rounded-md

                    border
                    border-amber-200

                    bg-amber-50

                    px-1.5
                    py-0.5

                    text-[9px]
                    font-bold

                    uppercase
                    tracking-wide

                    text-amber-700

                    dark:border-amber-500/20
                    dark:bg-amber-500/10
                    dark:text-amber-400
                  "
                >
                  Inactive
                </span>

              )}

            </div>

          )}

        </div>

      </div>


      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div
        className="
          mt-7

          sm:mt-8
        "
      >

        {isLoading ? (

          <SkeletonList />

        ) : isError ? (

          <ErrorState />

        ) : groupedReports.length > 0 ? (

          <>

            <div
              className="
                space-y-8

                sm:space-y-9
              "
            >

              {groupedReports.map(
                (group) => (

                  <DateSection
                    key={
                      group.date
                    }

                    date={
                      group.date
                    }

                    reports={
                      group.reports
                    }

                    onCopy={
                      handleCopy
                    }
                  />

                )
              )}

            </div>


            {pagination &&
              pagination.totalPages >
              1 && (

                <Pagination
                  pagination={
                    pagination
                  }

                  isFetching={
                    isFetching
                  }

                  onPageChange={
                    handlePageChange
                  }
                />

              )}

          </>

        ) : (

          <EmptyState
            hasDateFilter={
              Boolean(date)
            }

            hasUserFilter={
              selectedUserId !==
              ALL_USERS
            }

            userName={
              selectedUser?.name
            }
          />

        )}

      </div>

    </div>
  );
}


/* ================================================================
   DATE SECTION
================================================================ */

function DateSection({
  date,
  reports,
  onCopy,
}: {
  date: string;
  reports: ReportItem[];
  onCopy: (
    text: string
  ) => void;
}) {

  const parsedDate =
    new Date(
      `${date}T00:00:00`
    );


  const formattedDate =
    parsedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone:
          "Asia/Kolkata",
      }
    );


  const mobileDate =
    parsedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone:
          "Asia/Kolkata",
      }
    );


  const day =
    parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        timeZone:
          "Asia/Kolkata",
      }
    );


  const month =
    parsedDate
      .toLocaleDateString(
        "en-IN",
        {
          month: "short",
          timeZone:
            "Asia/Kolkata",
        }
      )
      .toUpperCase();


  const dayText =
    reports
      .map(
        (report) =>
          `${report.user.name}${report.user.deletedAt
            ? " [Inactive]"
            : ""
          }\n${report.description}`
      )
      .join("\n\n");


  return (
    <section className="w-full">

      {/* DATE HEADER */}

      <div
        className="
          mb-4

          flex
          flex-col
          gap-3

          sm:mb-5
          sm:flex-row
          sm:items-center
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

              h-11
              w-11
              shrink-0

              flex-col
              items-center
              justify-center

              rounded-xl

              border
              border-slate-200

              bg-white

              shadow-[0_3px_12px_rgba(15,23,42,0.04)]

              dark:border-zinc-800
              dark:bg-zinc-950
              dark:shadow-none

              sm:h-12
              sm:w-12
            "
          >

            <span
              className="
                text-sm
                font-bold
                leading-none

                text-slate-900

                dark:text-white
              "
            >
              {day}
            </span>


            <span
              className="
                mt-1

                text-[8px]
                font-bold

                tracking-[0.14em]

                text-slate-400

                dark:text-zinc-600
              "
            >
              {month}
            </span>

          </div>


          <div className="min-w-0">

            <h2
              className="
                truncate

                text-sm
                font-bold

                text-slate-900

                dark:text-white

                sm:text-[15px]
              "
            >

              <span className="sm:hidden">
                {mobileDate}
              </span>

              <span className="hidden sm:inline">
                {formattedDate}
              </span>

            </h2>


            <p
              className="
                mt-0.5

                text-[10px]
                font-semibold

                uppercase

                tracking-[0.12em]

                text-slate-400

                dark:text-zinc-600
              "
            >

              {reports.length}{" "}
              {reports.length === 1
                ? "report"
                : "reports"}{" "}
              submitted

            </p>

          </div>

        </div>


        <div
          className="
            hidden
            h-px
            flex-1

            bg-slate-200

            dark:bg-zinc-800

            sm:block
          "
        />


        <button
          type="button"

          onClick={() =>
            onCopy(dayText)
          }

          className="
            inline-flex

            h-9
            w-fit
            shrink-0

            items-center
            justify-center
            gap-1.5

            self-start

            rounded-xl

            border
            border-slate-200

            bg-white

            px-3

            text-[11px]
            font-semibold

            text-slate-600

            shadow-sm

            transition

            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900

            dark:border-zinc-800
            dark:bg-zinc-900
            dark:text-zinc-400

            dark:hover:border-zinc-700
            dark:hover:bg-zinc-800
            dark:hover:text-zinc-200

            sm:self-auto
          "
        >

          <HiOutlineClipboardDocument
            className="
              h-3.5
              w-3.5
            "
          />

          Copy

        </button>

      </div>


      {/* TIMELINE */}

      <div
        className="
          relative

          ml-2

          space-y-3

          border-l
          border-slate-200

          pl-5

          dark:border-zinc-800

          sm:ml-4
          sm:space-y-4
          sm:pl-7
        "
      >

        {reports.map(
          (report) => (

            <ReportCard
              key={
                report.id
              }

              report={
                report
              }

            />

          )
        )}

      </div>

    </section>
  );
}


/* ================================================================
   REPORT CARD
================================================================ */

function ReportCard({
  report,
}: {
  report: ReportItem;
}) {

  const initials =
    report.user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .toUpperCase();


  const isDeleted =
    Boolean(
      report.user.deletedAt
    );


  return (
    <article
      className="
        group

        relative

        min-w-0
      "
    >

      {/* TIMELINE DOT */}

      <span
        className={`
          absolute

          -left-[25px]
          top-5

          h-2
          w-2

          rounded-full

          border
          border-white

          shadow-[0_0_0_3px_rgba(99,102,241,0.08)]

          dark:border-zinc-950

          sm:-left-[34px]

          ${isDeleted
            ? `
                  bg-amber-500
                  dark:bg-amber-400
                  dark:shadow-[0_0_0_3px_rgba(245,158,11,0.08)]
                `
            : `
                  bg-indigo-500
                  dark:bg-indigo-400
                  dark:shadow-[0_0_0_3px_rgba(129,140,248,0.08)]
                `
          }
        `}
      />


      {/* CARD */}

      <div
        className="
          overflow-hidden

          rounded-xl

          border
          border-slate-200/80

          bg-white

          shadow-[0_3px_16px_rgba(15,23,42,0.035)]

          transition-all
          duration-200

          hover:-translate-y-0.5

          hover:border-slate-300

          hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]

          dark:border-zinc-800
          dark:bg-zinc-950
          dark:shadow-none

          dark:hover:border-zinc-700
        "
      >

        {/* USER HEADER */}

        <div
          className={`
            flex
            min-w-0
            items-center
            gap-3

            border-b

            px-4
            py-3

            dark:border-zinc-900

            sm:px-5
            sm:py-3.5

            ${isDeleted
              ? `
                    border-amber-100
                    bg-amber-50/40
                    dark:bg-amber-500/[0.025]
                  `
              : `
                    border-slate-100
                  `
            }
          `}
        >

          {/* AVATAR */}

          <div
            className={`
              flex

              h-9
              w-9
              shrink-0

              items-center
              justify-center

              rounded-full

              text-[10px]
              font-bold

              ${isDeleted
                ? `
                      bg-amber-100
                      text-amber-700
                      dark:bg-amber-500/10
                      dark:text-amber-400
                    `
                : `
                      bg-indigo-50
                      text-indigo-600
                      dark:bg-indigo-500/10
                      dark:text-indigo-400
                    `
              }
            `}
          >
            {initials}
          </div>


          {/* USER DETAILS */}

          <div
            className="
              min-w-0
              flex-1
            "
          >

            <div
              className="
                flex
                min-w-0
                flex-wrap
                items-center
                gap-1.5
              "
            >

              <p
                className="
                  min-w-0
                  max-w-full

                  truncate

                  text-xs
                  font-bold

                  text-slate-900

                  dark:text-white
                "
              >
                {report.user.name}
              </p>




            </div>


            <p
              className="
                mt-0.5

                truncate

                text-[10px]

                text-slate-400

                dark:text-zinc-600
              "
            >
              {report.user.email}
            </p>

          </div>

        </div>


        {/* DESCRIPTION */}

        <div
          className="
            px-4
            py-4

            sm:px-5
            sm:py-4
          "
        >

          <p
            className="
              whitespace-pre-wrap
              break-words

              text-[13px]
              leading-6

              text-slate-600

              dark:text-zinc-400
            "
          >
            {report.description}
          </p>

        </div>

      </div>

    </article>
  );
}


/* ================================================================
   PAGINATION WINDOW
================================================================ */

function getPageWindow(
  page: number,
  totalPages: number
): (
  | number
  | "gap"
)[] {

  const pages =
    new Set<number>([
      1,
      totalPages,
      page,
      page - 1,
      page + 1,
    ]);


  const sorted =
    Array.from(pages)
      .filter(
        (p) =>
          p >= 1 &&
          p <= totalPages
      )
      .sort(
        (a, b) =>
          a - b
      );


  const result: (
    | number
    | "gap"
  )[] = [];


  for (
    let i = 0;
    i < sorted.length;
    i++
  ) {

    if (
      i > 0 &&
      sorted[i] -
      sorted[i - 1] >
      1
    ) {

      result.push(
        "gap"
      );

    }


    result.push(
      sorted[i]
    );
  }


  return result;
}


/* ================================================================
   PAGINATION
================================================================ */

function Pagination({
  pagination,
  isFetching,
  onPageChange,
}: {
  pagination: Pagination;

  isFetching: boolean;

  onPageChange: (
    page: number
  ) => void;
}) {

  const {
    page,
    totalPages,
    total,
    limit,
  } = pagination;


  const start =
    total === 0
      ? 0
      : (page - 1) *
      limit +
      1;


  const end =
    Math.min(
      page * limit,
      total
    );


  const pageWindow =
    getPageWindow(
      page,
      totalPages
    );


  return (
    <div
      className="
        mt-6

        flex
        flex-col
        items-center
        gap-3

        border-t
        border-slate-200/70

        pt-5

        dark:border-zinc-800/70

        sm:flex-row
        sm:justify-between
      "
    >

      <p
        className="
          text-[10px]

          text-slate-400

          dark:text-zinc-600
        "
      >

        Showing{" "}

        <span
          className="
            font-semibold

            text-slate-600

            dark:text-zinc-400
          "
        >
          {start}-{end}
        </span>

        {" "}of{" "}

        <span
          className="
            font-semibold

            text-slate-600

            dark:text-zinc-400
          "
        >
          {total}
        </span>

        {" "}entries

      </p>


      <div
        className="
          flex
          max-w-full
          items-center
          gap-1

          overflow-x-auto

          rounded-xl

          border
          border-slate-200

          bg-white

          p-1

          shadow-sm

          dark:border-zinc-800
          dark:bg-zinc-950
          dark:shadow-none
        "
      >

        {/* PREVIOUS */}

        <button
          type="button"

          disabled={
            page === 1 ||
            isFetching
          }

          onClick={() =>
            onPageChange(
              page - 1
            )
          }

          aria-label="Previous page"

          className="
            flex
            h-7
            w-7
            shrink-0

            items-center
            justify-center

            rounded-lg

            text-slate-400

            transition

            hover:bg-slate-100
            hover:text-slate-700

            disabled:cursor-not-allowed
            disabled:opacity-30

            dark:text-zinc-500

            dark:hover:bg-zinc-900
            dark:hover:text-zinc-200
          "
        >

          <HiOutlineChevronLeft
            className="
              h-3.5
              w-3.5
            "
          />

        </button>


        {pageWindow.map(
          (
            entry,
            index
          ) => {

            if (
              entry ===
              "gap"
            ) {

              return (
                <span
                  key={
                    `gap-${index}`
                  }

                  className="
                    flex

                    h-7
                    w-5
                    shrink-0

                    items-center
                    justify-center

                    text-[10px]

                    text-slate-300

                    dark:text-zinc-700
                  "
                >
                  ...
                </span>
              );

            }


            const isActive =
              entry === page;


            return (
              <button
                key={
                  entry
                }

                type="button"

                disabled={
                  isFetching
                }

                onClick={() =>
                  onPageChange(
                    entry
                  )
                }

                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }

                className={`
                  flex

                  h-7
                  min-w-7
                  shrink-0

                  items-center
                  justify-center

                  rounded-lg

                  px-2

                  text-[10px]
                  font-semibold

                  transition

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  ${isActive
                    ? `
                          bg-indigo-600
                          text-white
                          shadow-sm
                        `
                    : `
                          text-slate-500

                          hover:bg-slate-100
                          hover:text-slate-800

                          dark:text-zinc-500

                          dark:hover:bg-zinc-900
                          dark:hover:text-zinc-200
                        `
                  }
                `}
              >

                {entry}

              </button>
            );

          }
        )}


        {/* NEXT */}

        <button
          type="button"

          disabled={
            page ===
            totalPages ||
            isFetching
          }

          onClick={() =>
            onPageChange(
              page + 1
            )
          }

          aria-label="Next page"

          className="
            flex
            h-7
            w-7
            shrink-0

            items-center
            justify-center

            rounded-lg

            text-slate-400

            transition

            hover:bg-slate-100
            hover:text-slate-700

            disabled:cursor-not-allowed
            disabled:opacity-30

            dark:text-zinc-500

            dark:hover:bg-zinc-900
            dark:hover:text-zinc-200
          "
        >

          <HiOutlineChevronRight
            className="
              h-3.5
              w-3.5
            "
          />

        </button>

      </div>

    </div>
  );
}


/* ================================================================
   SKELETON
================================================================ */

function SkeletonList() {

  return (
    <div
      className="
        space-y-8

        sm:space-y-9
      "
    >

      {[1, 2].map(
        (section) => (

          <div
            key={
              section
            }
          >

            <div
              className="
                mb-5

                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-11
                  w-11
                  shrink-0

                  animate-pulse

                  rounded-xl

                  bg-slate-200

                  dark:bg-zinc-800
                "
              />


              <div
                className="
                  space-y-2
                "
              >

                <div
                  className="
                    h-3
                    w-36

                    animate-pulse

                    rounded

                    bg-slate-200

                    dark:bg-zinc-800
                  "
                />


                <div
                  className="
                    h-2.5
                    w-24

                    animate-pulse

                    rounded

                    bg-slate-100

                    dark:bg-zinc-900
                  "
                />

              </div>

            </div>


            <div
              className="
                ml-2

                space-y-4

                border-l
                border-slate-200

                pl-5

                dark:border-zinc-800

                sm:ml-4
                sm:pl-7
              "
            >

              {[1, 2].map(
                (item) => (

                  <div
                    key={
                      item
                    }

                    className="
                      overflow-hidden

                      rounded-xl

                      border
                      border-slate-200

                      bg-white

                      dark:border-zinc-800
                      dark:bg-zinc-950
                    "
                  >

                    <div
                      className="
                        flex

                        animate-pulse

                        items-center
                        gap-3

                        border-b
                        border-slate-100

                        px-4
                        py-3.5

                        dark:border-zinc-900
                      "
                    >

                      <div
                        className="
                          h-9
                          w-9
                          shrink-0

                          rounded-full

                          bg-slate-200

                          dark:bg-zinc-800
                        "
                      />


                      <div
                        className="
                          space-y-2
                        "
                      >

                        <div
                          className="
                            h-3
                            w-24

                            rounded

                            bg-slate-200

                            dark:bg-zinc-800
                          "
                        />


                        <div
                          className="
                            h-2.5
                            w-32

                            rounded

                            bg-slate-100

                            dark:bg-zinc-900
                          "
                        />

                      </div>

                    </div>


                    <div
                      className="
                        animate-pulse

                        space-y-2

                        px-4
                        py-5
                      "
                    >

                      <div
                        className="
                          h-3
                          w-full

                          rounded

                          bg-slate-100

                          dark:bg-zinc-900
                        "
                      />


                      <div
                        className="
                          h-3
                          w-5/6

                          rounded

                          bg-slate-100

                          dark:bg-zinc-900
                        "
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )
      )}

    </div>
  );
}


/* ================================================================
   EMPTY
================================================================ */

function EmptyState({
  hasDateFilter,
  hasUserFilter,
  userName,
}: {
  hasDateFilter: boolean;
  hasUserFilter: boolean;
  userName?: string;
}) {

  let title =
    "No team reports found";

  let description =
    "There are no team reports available yet.";


  if (
    hasUserFilter &&
    hasDateFilter
  ) {

    title =
      "No reports found";

    description =
      `No reports were submitted by ${userName ?? "this user"} on the selected date.`;

  } else if (
    hasUserFilter
  ) {

    title =
      "No reports found";

    description =
      `${userName ?? "This user"} has no reports available.`;

  } else if (
    hasDateFilter
  ) {

    title =
      "No reports for this date";

    description =
      "Try selecting another date or clear the date filter.";

  }


  return (
    <div
      className="
        flex

        min-h-[300px]
        w-full

        flex-col
        items-center
        justify-center

        rounded-xl

        border
        border-dashed
        border-slate-200

        bg-white/60

        px-5

        text-center

        dark:border-zinc-800
        dark:bg-zinc-950/40

        sm:min-h-[320px]
        sm:px-6
      "
    >

      <div
        className="
          flex

          h-12
          w-12

          items-center
          justify-center

          rounded-xl

          bg-slate-100

          text-slate-400

          dark:bg-zinc-900
          dark:text-zinc-600
        "
      >

        <HiOutlineDocumentMagnifyingGlass
          className="
            h-5
            w-5
          "
        />

      </div>


      <h3
        className="
          mt-4

          text-sm
          font-bold

          text-slate-900

          dark:text-white
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-2

          max-w-[340px]

          text-xs
          leading-5

          text-slate-400

          dark:text-zinc-600
        "
      >
        {description}
      </p>

    </div>
  );
}


/* ================================================================
   ERROR
================================================================ */

function ErrorState() {

  return (
    <div
      className="
        flex

        min-h-[300px]
        w-full

        flex-col
        items-center
        justify-center

        rounded-xl

        border
        border-red-200

        bg-red-50/50

        px-5

        text-center

        dark:border-red-500/20
        dark:bg-red-500/5
      "
    >

      <div
        className="
          flex

          h-12
          w-12

          items-center
          justify-center

          rounded-xl

          bg-red-100

          text-red-500

          dark:bg-red-500/10
          dark:text-red-400
        "
      >

        <HiOutlineXMark
          className="
            h-5
            w-5
          "
        />

      </div>


      <h3
        className="
          mt-4

          text-sm
          font-bold

          text-slate-900

          dark:text-white
        "
      >
        Unable to load reports
      </h3>


      <p
        className="
          mt-2

          text-xs

          text-slate-500

          dark:text-zinc-500
        "
      >
        Something went wrong while loading the reports.
      </p>

    </div>
  );
}
