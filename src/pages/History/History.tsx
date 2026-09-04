import { useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  HiOutlineXMark,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineClipboardDocument,
  HiOutlinePencilSquare,
  HiOutlineArrowPath,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

import { format } from "date-fns";
import { toast } from "sonner";

import {
  getHistory,
  saveReport,
  exportOwnReports,
} from "../../services/report";

import DayPickerInput from "../../components/DayPickerInput";
import { useAuth } from "../../context/AuthContext";

/* ================================================================
   TYPES
================================================================ */

interface ReportItem {
  id: string;
  reportDate: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface HistoryResponse {
  reports: ReportItem[];
  pagination: Pagination;
}

/* ================================================================
   CONSTANTS
================================================================ */

const REPORTS_PER_PAGE = 10;

/* ================================================================
   HISTORY
================================================================ */

export default function History() {

  const { hasPermission } = useAuth();

  const [date, setDate] =
    useState<Date | null>(null);

  const [page, setPage] =
    useState(1);

  /* =============================================================
       EXPORT STATE
  ============================================================= */

  const [exportOpen, setExportOpen] =
    useState(false);

  const [exportMonth, setExportMonth] =
    useState("");

  const [isExporting, setIsExporting] =
    useState(false);

  /* =============================================================
       HISTORY QUERY
  ============================================================= */

  const {
    data,
    isLoading,
    isFetching,
  } = useQuery<HistoryResponse>({
    queryKey: [
      "history",
      date
        ? format(date, "yyyy-MM-dd")
        : "",
      page,
      REPORTS_PER_PAGE,
    ],

    queryFn: async () => {
      const response =
        await getHistory(
          date
            ? format(
              date,
              "yyyy-MM-dd"
            )
            : undefined,
          page,
          REPORTS_PER_PAGE
        );

      return response.data;
    },

    staleTime: 30 * 1000,
  });

  /* =============================================================
       DATE PARAM
  ============================================================= */

  const dateParam = date
    ? format(
      date,
      "yyyy-MM-dd"
    )
    : "";

  /* =============================================================
       DATE CHANGE
  ============================================================= */

  const handleDateChange = (
    newDate: Date | null
  ) => {
    setDate(newDate);

    /*
     * Always return to first page
     * when filter changes.
     */
    setPage(1);
  };

  /* =============================================================
       CLEAR FILTER
  ============================================================= */

  const handleClearDate = () => {
    setDate(null);

    setPage(1);
  };

  /* =============================================================
       EXPORT
  ============================================================= */

  const handleExport = async (
    type:
      | "all"
      | "date"
      | "month"
  ) => {
    try {
      setIsExporting(true);

      /*
       * Close dropdown immediately
       * when export begins.
       */
      setExportOpen(false);

      let blob: Blob;

      /* =========================================================
         ALL REPORTS
      ========================================================= */

      if (type === "all") {
        blob =
          await exportOwnReports({
            filter: "all",
          });
      }

      /* =========================================================
         SELECTED DATE
      ========================================================= */

      else if (type === "date") {
        if (!dateParam) {
          toast.warning(
            "Please select a date first."
          );

          setIsExporting(false);

          return;
        }

        blob =
          await exportOwnReports({
            filter: "date",
            date: dateParam,
          });
      }

      /* =========================================================
         MONTH
      ========================================================= */

      else {
        if (!exportMonth) {
          toast.warning(
            "Please select a month first."
          );

          setIsExporting(false);

          return;
        }

        blob =
          await exportOwnReports({
            filter: "month",
            month: exportMonth,
          });
      }

      /* =========================================================
         DOWNLOAD
      ========================================================= */

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      let filename =
        "reports_all.xlsx";

      if (type === "date") {
        filename =
          `reports_${dateParam}.xlsx`;
      }

      if (type === "month") {
        filename =
          `reports_${exportMonth}.xlsx`;
      }

      link.setAttribute(
        "download",
        filename
      );

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      toast.success(
        "Excel exported successfully."
      );
    } catch (error: any) {
      console.error(
        "Report export failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to export reports."
      );
    } finally {
      setIsExporting(false);
    }
  };

  /* =============================================================
       PAGINATION
  ============================================================= */

  const handlePreviousPage = () => {
    if (
      !data?.pagination
        ?.hasPreviousPage ||
      isFetching
    ) {
      return;
    }

    setPage(
      (currentPage) =>
        Math.max(
          currentPage - 1,
          1
        )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNextPage = () => {
    if (
      !data?.pagination
        ?.hasNextPage ||
      isFetching
    ) {
      return;
    }

    setPage(
      (currentPage) =>
        currentPage + 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =============================================================
       VALUES
  ============================================================= */

  const reports =
    data?.reports ?? [];

  const pagination =
    data?.pagination;

  const hasReports =
    reports.length > 0;

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1040px]

        px-4
        py-5

        sm:px-6
        sm:py-7

        lg:px-8
        lg:py-8
      "
    >

      {/* ===========================================================
          PAGE ANIMATIONS
      =========================================================== */}

      <style>{`
        @keyframes historyReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes exportSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes exportPulse {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(0.97);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes exportMenuReveal {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .export-spin {
          animation: exportSpin 0.8s linear infinite;
        }

        .export-menu-reveal {
          animation: exportMenuReveal 0.16s ease-out forwards;
          transform-origin: top right;
        }

        .export-clicking {
          animation: exportPulse 0.25s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .history-reveal {
            animation: none !important;
            opacity: 1 !important;
          }

          .export-spin {
            animation: none !important;
          }

          .export-menu-reveal {
            animation: none !important;
          }

          .export-clicking {
            animation: none !important;
          }
        }
      `}</style>


      {/* ===========================================================
          PAGE HEADER
      =========================================================== */}

      <div
        className="
          flex
          flex-col
          gap-5

          border-b
          border-slate-200/80

          pb-5

          dark:border-zinc-800/80

          sm:gap-6
          sm:pb-6

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >

        {/* =========================================================
            TITLE
        ========================================================= */}

        <div className="min-w-0">

          <h1
            className="
              text-[26px]
              font-bold
              tracking-[-0.035em]

              text-slate-950

              dark:text-white

              sm:text-3xl
            "
          >
            History
          </h1>

          <p
            className="
              mt-1.5

              text-sm

              text-slate-500

              dark:text-zinc-500
            "
          >
            Browse and manage your daily work reports.
          </p>

        </div>


        {/* =========================================================
            FILTER TOOLBAR
        ========================================================= */}

        <div
          className="
            grid
            w-full
            grid-cols-1
            gap-2

            sm:flex
            sm:w-auto
            sm:flex-wrap
            sm:items-center
            sm:justify-end
          "
        >

          {/* =======================================================
              TOTAL REPORT COUNT
          ======================================================= */}

          {!isLoading &&
            pagination &&
            pagination.total > 0 && (

              <div
                className="
                  inline-flex
                  h-10
                  w-fit
                  items-center

                  rounded-xl

                  border
                  border-indigo-100

                  bg-indigo-50

                  px-3.5

                  text-xs
                  font-bold

                  text-indigo-600

                  dark:border-indigo-500/20
                  dark:bg-indigo-500/10
                  dark:text-indigo-400
                "
              >
                {pagination.total}{" "}
                {pagination.total === 1
                  ? "Report"
                  : "Reports"}
              </div>

            )}


          {/* =======================================================
              DATE PICKER
          ======================================================= */}

          <div
            className="
              min-w-0
              w-full

              sm:w-auto
            "
          >

            <div
              className="
                w-full
                min-w-0

                sm:w-auto
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

          </div>


          {/* =======================================================
              CLEAR
          ======================================================= */}

          <button
            type="button"
            onClick={
              handleClearDate
            }
            disabled={!date}
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

              duration-200

              hover:border-slate-300
              hover:bg-slate-50

              active:scale-[0.97]

              disabled:cursor-not-allowed
              disabled:opacity-35

              dark:border-zinc-800
              dark:bg-zinc-900
              dark:text-zinc-400

              dark:hover:border-zinc-700
              dark:hover:bg-zinc-800

              sm:w-auto
            "
          >

            <HiOutlineXMark
              className="h-4 w-4"
            />

            Clear

          </button>


          {/* =======================================================
              EXPORT WRAPPER
          ======================================================= */}

          <div
            className="
              relative
              w-full

              sm:w-auto
            "
          >

            {/* =====================================================
                EXPORT BUTTON
            ===================================================== */}
            {hasPermission("REPORT_EXPORT_OWN") && (
              <button
                type="button"

                onClick={() =>
                  setExportOpen(
                    (current) =>
                      !current
                  )
                }

                disabled={
                  isExporting
                }

                className={`
                inline-flex
                h-10
                w-full

                items-center
                justify-center
                gap-1.5

                rounded-xl

                bg-indigo-600

                px-3.5

                text-xs
                font-semibold

                text-white

                shadow-sm

                transition-all
                duration-200

                hover:bg-indigo-500
                hover:shadow-md
                hover:shadow-indigo-500/15

                active:scale-[0.97]

                disabled:cursor-not-allowed
                disabled:opacity-70

                sm:w-auto

                ${isExporting
                    ? "export-clicking"
                    : ""
                  }
              `}
              >

                {isExporting ? (

                  <HiOutlineArrowPath
                    className="
                    export-spin

                    h-4
                    w-4
                  "
                  />

                ) : (

                  <HiOutlineArrowDownTray
                    className="
                    h-4
                    w-4
                  "
                  />

                )}

                <span>
                  {isExporting
                    ? "Exporting..."
                    : "Export"}
                </span>

              </button>
            )}

            {/* =====================================================
                EXPORT MENU
            ===================================================== */}

            {exportOpen &&
              !isExporting && (

                <div
                  className="
                    export-menu-reveal

                    absolute
                    right-0
                    top-full
                    z-50

                    mt-2

                    w-full
                    min-w-[240px]

                    overflow-hidden

                    rounded-xl

                    border
                    border-slate-200

                    bg-white

                    p-1.5

                    shadow-xl
                    shadow-slate-900/10

                    dark:border-zinc-800
                    dark:bg-zinc-950
                    dark:shadow-black/30

                    sm:w-[270px]
                  "
                >

                  {/* =================================================
                      ALL REPORTS
                  ================================================= */}

                  <button
                    type="button"

                    onClick={() =>
                      handleExport(
                        "all"
                      )
                    }

                    className="
                      group

                      flex
                      w-full
                      flex-col
                      items-start

                      rounded-lg

                      px-3
                      py-2.5

                      text-left

                      transition-all
                      duration-150

                      hover:bg-slate-50

                      active:scale-[0.99]

                      dark:hover:bg-zinc-900
                    "
                  >

                    <div
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold

                          text-slate-800

                          dark:text-zinc-100
                        "
                      >
                        All Reports
                      </span>

                      <HiOutlineArrowDownTray
                        className="
                          h-3.5
                          w-3.5

                          text-slate-300

                          transition

                          group-hover:text-indigo-500

                          dark:text-zinc-700
                          dark:group-hover:text-indigo-400
                        "
                      />

                    </div>

                    <span
                      className="
                        mt-0.5

                        text-[10px]

                        text-slate-400

                        dark:text-zinc-600
                      "
                    >
                      Export all your reports
                    </span>

                  </button>


                  {/* =================================================
                      SELECTED DATE
                  ================================================= */}

                  <button
                    type="button"

                    disabled={
                      !dateParam
                    }

                    onClick={() =>
                      handleExport(
                        "date"
                      )
                    }

                    className="
                      group

                      flex
                      w-full
                      flex-col
                      items-start

                      rounded-lg

                      px-3
                      py-2.5

                      text-left

                      transition-all
                      duration-150

                      hover:bg-slate-50

                      active:scale-[0.99]

                      disabled:cursor-not-allowed
                      disabled:opacity-40

                      dark:hover:bg-zinc-900
                    "
                  >

                    <div
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold

                          text-slate-800

                          dark:text-zinc-100
                        "
                      >
                        Selected Date
                      </span>

                      {dateParam && (

                        <HiOutlineArrowDownTray
                          className="
                            h-3.5
                            w-3.5

                            text-slate-300

                            transition

                            group-hover:text-indigo-500

                            dark:text-zinc-700
                            dark:group-hover:text-indigo-400
                          "
                        />

                      )}

                    </div>

                    <span
                      className="
                        mt-0.5

                        text-[10px]

                        text-slate-400

                        dark:text-zinc-600
                      "
                    >
                      {dateParam
                        ? `Export ${dateParam}`
                        : "Select a date first"}
                    </span>

                  </button>


                  {/* =================================================
                      MONTH DIVIDER
                  ================================================= */}

                  <div
                    className="
                      mt-1

                      border-t
                      border-slate-100

                      pt-1

                      dark:border-zinc-900
                    "
                  >

                    <div
                      className="
                        px-3
                        pt-2
                        pb-1
                      "
                    >

                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase

                          tracking-[0.1em]

                          text-slate-400

                          dark:text-zinc-600
                        "
                      >
                        Month
                      </span>

                    </div>


                    {/* =================================================
                        MONTH INPUT
                    ================================================= */}

                    <div
                      className="
                        flex
                        gap-2

                        px-2
                        pb-2
                      "
                    >

                      <input
                        type="month"

                        value={
                          exportMonth
                        }

                        onChange={(e) =>
                          setExportMonth(
                            e.target.value
                          )
                        }

                        className="
                          h-9
                          min-w-0
                          flex-1

                          rounded-lg

                          border
                          border-slate-200

                          bg-white

                          px-2.5

                          text-xs

                          text-slate-700

                          outline-none

                          transition

                          focus:border-indigo-400
                          focus:ring-4
                          focus:ring-indigo-500/10

                          dark:border-zinc-800
                          dark:bg-zinc-900
                          dark:text-zinc-200

                          dark:focus:border-indigo-500/50
                        "
                      />


                      {/* =================================================
                          MONTH EXPORT BUTTON
                      ================================================= */}

                      <button
                        type="button"

                        disabled={
                          !exportMonth
                        }

                        onClick={() =>
                          handleExport(
                            "month"
                          )
                        }

                        className="
                          inline-flex
                          h-9

                          shrink-0

                          items-center
                          justify-center
                          gap-1.5

                          rounded-lg

                          bg-indigo-600

                          px-3

                          text-[11px]
                          font-semibold

                          text-white

                          transition-all
                          duration-200

                          hover:bg-indigo-500
                          hover:shadow-md
                          hover:shadow-indigo-500/15

                          active:scale-[0.96]

                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >

                        <HiOutlineArrowDownTray
                          className="
                            h-3.5
                            w-3.5
                          "
                        />

                        Export

                      </button>

                    </div>

                  </div>

                </div>

              )}

          </div>

        </div>

      </div>


      {/* ===========================================================
          CONTENT
      =========================================================== */}

      <div
        className="
          mt-7

          sm:mt-8
        "
      >

        {/* =========================================================
            LOADING
        ========================================================= */}

        {isLoading ? (

          <SkeletonList />

        ) : hasReports ? (

          <>

            {/* =====================================================
                REPORT TIMELINE
            ===================================================== */}

            <ol className="relative">

              {reports.map(
                (
                  report,
                  index
                ) => (

                  <TimelineEntry
                    key={report.id}
                    report={report}
                    index={index}
                    isLast={
                      index ===
                      reports.length - 1
                    }
                  />

                )
              )}

            </ol>


            {/* =====================================================
                PAGINATION
            ===================================================== */}

            {pagination &&
              pagination.totalPages >
              1 && (

                <Pagination
                  pagination={
                    pagination
                  }
                  onPrevious={
                    handlePreviousPage
                  }
                  onNext={
                    handleNextPage
                  }
                  onPageChange={
                    setPage
                  }
                  isFetching={
                    isFetching
                  }
                />

              )}

          </>

        ) : (

          <EmptyState
            hasDateFilter={
              !!date
            }
          />

        )}

      </div>

    </div>
  );
}


/* ================================================================
   TIMELINE ENTRY
================================================================ */

function TimelineEntry({
  report,
  index,
  isLast,
}: {
  report: ReportItem;
  index: number;
  isLast: boolean;
}) {
  const queryClient =
    useQueryClient();

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    description,
    setDescription,
  ] = useState(
    report.description
  );

  const textareaRef =
    useRef<HTMLTextAreaElement>(
      null
    );


  /* =============================================================
       SYNC DESCRIPTION
  ============================================================= */

  useEffect(() => {

    if (!isEditing) {
      setDescription(
        report.description
      );
    }

  }, [
    report.description,
    isEditing,
  ]);


  /* =============================================================
       AUTO RESIZE TEXTAREA
  ============================================================= */

  useEffect(() => {

    if (!isEditing) {
      return;
    }

    const textarea =
      textareaRef.current;

    if (textarea) {

      textarea.style.height =
        "auto";

      textarea.style.height =
        `${textarea.scrollHeight}px`;

    }

  }, [
    description,
    isEditing,
  ]);


  /* =============================================================
       SAVE MUTATION
  ============================================================= */

  const reportMutation =
    useMutation({
      mutationFn: saveReport,

      onSuccess: (
        response
      ) => {

        setDescription(
          response.data.description
        );

        setIsEditing(false);

        queryClient.invalidateQueries({
          queryKey: [
            "history",
          ],
        });

        toast.success(
          "Report updated successfully."
        );
      },

      onError: (
        error: any
      ) => {

        const response =
          error.response?.data;

        if (
          response?.errors?.length
        ) {

          response.errors.forEach(
            (
              err: {
                message: string;
              }
            ) => {

              toast.error(
                err.message
              );

            }
          );

          return;
        }

        toast.error(
          response?.message ||
          "Failed to update report."
        );
      },
    });


  /* =============================================================
       COPY
  ============================================================= */

  const handleCopyReport =
    async (
      text: string
    ) => {

      try {

        await navigator.clipboard.writeText(
          text
        );

        toast.success(
          "Report copied successfully."
        );

      } catch {

        toast.error(
          "Unable to copy report."
        );

      }

    };


  /* =============================================================
       SAVE
  ============================================================= */

  const handleSave = () => {

    const text =
      description.trim();

    if (!text) {

      toast.warning(
        "Please enter a report."
      );

      return;
    }

    reportMutation.mutate({
      description: text,

      reportDate:
        format(
          new Date(
            report.reportDate
          ),
          "yyyy-MM-dd"
        ),
    });

  };


  /* =============================================================
       CANCEL
  ============================================================= */

  const handleCancel = () => {

    setDescription(
      report.description
    );

    setIsEditing(false);

  };


  /* =============================================================
       DATE FORMATTING
  ============================================================= */

  const parsed =
    new Date(
      report.reportDate
    );


  const day =
    parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        timeZone:
          "Asia/Kolkata",
      }
    );


  const month =
    parsed.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        timeZone:
          "Asia/Kolkata",
      }
    ).toUpperCase();


  const fullDate =
    parsed.toLocaleDateString(
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
    parsed.toLocaleDateString(
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


  return (
    <li
      className="
        history-reveal
        relative

        grid
        grid-cols-[52px_minmax(0,1fr)]

        gap-3
        pb-5

        opacity-0

        sm:grid-cols-[64px_minmax(0,1fr)]
        sm:gap-4
        sm:pb-6

        lg:grid-cols-[68px_minmax(0,1fr)]
      "
      style={{
        animation:
          "historyReveal 0.4s cubic-bezier(0.22,1,0.36,1) forwards",

        animationDelay:
          `${Math.min(index, 12) * 40}ms`,
      }}
    >

      {/* =========================================================
          CONNECTING LINE
      ========================================================= */}

      {!isLast && (

        <div
          className="
            absolute
            bottom-0

            left-[25px]
            top-[50px]

            w-px

            bg-gradient-to-b
            from-slate-200
            via-slate-200
            to-transparent

            dark:from-zinc-800
            dark:via-zinc-800
            dark:to-transparent

            sm:left-[31px]
            sm:top-[56px]

            lg:left-[33px]
          "
        />

      )}


      {/* =========================================================
          DATE MARKER
      ========================================================= */}

      <div
        className="
          relative
          z-10

          flex
          justify-center
        "
      >

        <div
          className="
            flex
            h-[48px]
            w-[48px]

            flex-col
            items-center
            justify-center

            rounded-xl

            border
            border-slate-200

            bg-white

            shadow-[0_3px_12px_rgba(15,23,42,0.04)]

            transition-all
            duration-300

            dark:border-zinc-800
            dark:bg-zinc-950
            dark:shadow-none

            sm:h-[54px]
            sm:w-[54px]
            sm:rounded-2xl
          "
        >

          <span
            className="
              text-sm
              font-bold
              leading-none

              text-slate-900

              dark:text-white

              sm:text-[15px]
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

      </div>


      {/* =========================================================
          REPORT CARD
      ========================================================= */}

      <article
        className="
          group
          min-w-0

          overflow-hidden

          rounded-xl

          border
          border-slate-200/80

          bg-white

          shadow-[0_3px_16px_rgba(15,23,42,0.035)]

          transition-all
          duration-300

          hover:-translate-y-0.5

          hover:border-slate-300

          hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]

          dark:border-zinc-800
          dark:bg-zinc-950
          dark:shadow-none

          dark:hover:border-zinc-700
        "
      >

        {/* =======================================================
            CARD HEADER
        ======================================================= */}

        <div
          className="
            flex
            flex-col
            gap-3

            px-4
            py-3.5

            sm:px-5
            sm:py-4

            lg:flex-row
            lg:items-center
            lg:justify-between
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

            {/* INDICATOR */}

            <div
              className="
                flex
                h-7
                w-7
                shrink-0

                items-center
                justify-center

                rounded-lg

                bg-indigo-50

                dark:bg-indigo-500/10
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5

                  rounded-full

                  bg-indigo-500

                  dark:bg-indigo-400
                "
              />

            </div>


            <div className="min-w-0">

              <h3
                className="
                  truncate

                  text-sm
                  font-bold

                  text-slate-900

                  dark:text-white

                  sm:text-[14px]
                "
              >

                <span className="sm:hidden">
                  {mobileDate}
                </span>

                <span className="hidden sm:inline">
                  {fullDate}
                </span>

              </h3>


              <p
                className="
                  mt-0.5

                  text-[9px]
                  font-medium
                  uppercase

                  tracking-[0.12em]

                  text-slate-400

                  dark:text-zinc-600
                "
              >
                Daily work report
              </p>

            </div>

          </div>


          {/* =====================================================
              ACTIONS
          ===================================================== */}

          {!isEditing && (

            <div
              className="
                flex
                w-full
                items-center
                gap-2

                lg:w-auto
              "
            >

              {/* EDIT */}

              <button
                type="button"
                onClick={() =>
                  setIsEditing(true)
                }
                className="
                  inline-flex
                  h-8

                  flex-1

                  items-center
                  justify-center
                  gap-1.5

                  rounded-lg

                  border
                  border-slate-200

                  bg-white

                  px-2.5

                  text-[11px]
                  font-semibold

                  text-slate-600

                  transition

                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-600

                  active:scale-[0.97]

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-400

                  dark:hover:border-indigo-500/30
                  dark:hover:bg-indigo-500/10
                  dark:hover:text-indigo-400

                  lg:flex-none
                "
              >

                <HiOutlinePencilSquare
                  className="h-3.5 w-3.5"
                />

                Edit

              </button>


              {/* COPY */}

              <button
                type="button"
                onClick={() =>
                  handleCopyReport(
                    report.description
                  )
                }
                className="
                  inline-flex
                  h-8

                  flex-1

                  items-center
                  justify-center
                  gap-1.5

                  rounded-lg

                  border
                  border-slate-200

                  bg-white

                  px-2.5

                  text-[11px]
                  font-semibold

                  text-slate-600

                  transition

                  hover:border-slate-300
                  hover:bg-slate-50

                  active:scale-[0.97]

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-400

                  dark:hover:border-zinc-700
                  dark:hover:bg-zinc-800
                  dark:hover:text-zinc-200

                  lg:flex-none
                "
              >

                <HiOutlineClipboardDocument
                  className="h-3.5 w-3.5"
                />

                Copy

              </button>

            </div>

          )}

        </div>


        {/* =========================================================
            DIVIDER
        ========================================================= */}

        <div
          className="
            border-t
            border-slate-100

            dark:border-zinc-900
          "
        />


        {/* =========================================================
            EDIT MODE
        ========================================================= */}

        {isEditing ? (

          <div className="p-4 sm:p-5">

            <textarea
              ref={textareaRef}

              rows={5}

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              autoFocus

              className="
                min-h-[120px]

                w-full

                resize-none
                overflow-hidden

                rounded-xl

                border
                border-slate-200

                bg-slate-50

                px-3.5
                py-3

                text-sm
                leading-6

                text-slate-800

                outline-none

                transition

                placeholder:text-slate-400

                focus:border-indigo-400
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-500/10

                dark:border-zinc-800
                dark:bg-zinc-900
                dark:text-zinc-100

                dark:placeholder:text-zinc-600

                dark:focus:border-indigo-500/50
                dark:focus:bg-zinc-900
              "
            />


            <div
              className="
                mt-3

                flex
                flex-col
                gap-3

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <span
                className="
                  text-[10px]
                  font-medium
                  tabular-nums

                  text-slate-400

                  dark:text-zinc-600
                "
              >
                {description.length} characters
              </span>


              <div
                className="
                  flex
                  w-full
                  gap-2

                  sm:w-auto
                "
              >

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    reportMutation.isPending
                  }
                  className="
                    flex-1

                    rounded-lg

                    border
                    border-slate-200

                    bg-white

                    px-4
                    py-2

                    text-xs
                    font-semibold

                    text-slate-600

                    transition

                    hover:bg-slate-50

                    active:scale-[0.98]

                    disabled:opacity-50

                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-zinc-400

                    dark:hover:bg-zinc-800

                    sm:flex-none
                  "
                >
                  Cancel
                </button>


                {/* SAVE */}

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={
                    reportMutation.isPending
                  }
                  className="
                    inline-flex

                    flex-1

                    items-center
                    justify-center
                    gap-2

                    rounded-lg

                    bg-indigo-600

                    px-4
                    py-2

                    text-xs
                    font-semibold

                    text-white

                    shadow-sm

                    transition-all
                    duration-200

                    hover:bg-indigo-500

                    active:scale-[0.98]

                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    sm:flex-none
                  "
                >

                  {reportMutation.isPending ? (

                    <>

                      <HiOutlineArrowPath
                        className="
                          h-4
                          w-4
                          animate-spin
                        "
                      />

                      Saving...

                    </>

                  ) : (

                    "Save report"

                  )}

                </button>

              </div>

            </div>

          </div>

        ) : (

          /* =======================================================
             REPORT CONTENT
          ======================================================= */

          <div
            className="
              px-4
              py-4

              sm:px-5
              sm:py-5
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

        )}

      </article>

    </li>
  );
}


/* ================================================================
   PAGINATION
================================================================ */

function getPageWindow(
  page: number,
  totalPages: number
): (number | "gap")[] {
  const pages = new Set<number>([
    1,
    totalPages,
    page,
    page - 1,
    page + 1,
  ]);

  const sorted = Array.from(
    pages
  )
    .filter(
      (p) =>
        p >= 1 &&
        p <= totalPages
    )
    .sort(
      (a, b) => a - b
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
      result.push("gap");
    }

    result.push(
      sorted[i]
    );
  }

  return result;
}


function Pagination({
  pagination,
  onPrevious,
  onNext,
  onPageChange,
  isFetching,
}: {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (
    page: number
  ) => void;
  isFetching: boolean;
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
        mt-5

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

      {/* =========================================================
          RESULT INFORMATION
      ========================================================= */}

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


      {/* =========================================================
          PAGINATION CONTROLS
      ========================================================= */}

      <div
        className="
          flex
          items-center
          gap-1

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

        {/* =======================================================
            PREVIOUS
        ======================================================= */}

        <button
          type="button"

          onClick={
            onPrevious
          }

          disabled={
            page === 1 ||
            isFetching
          }

          aria-label="Previous page"

          className="
            flex
            h-7
            w-7

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


        {/* =======================================================
            PAGE NUMBERS
        ======================================================= */}

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
                  key={`gap-${index}`}

                  className="
                    flex
                    h-7
                    w-5

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
                key={entry}

                type="button"

                onClick={() =>
                  onPageChange(
                    entry
                  )
                }

                disabled={
                  isFetching
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


        {/* =======================================================
            NEXT
        ======================================================= */}

        <button
          type="button"

          onClick={
            onNext
          }

          disabled={
            page ===
            totalPages ||
            isFetching
          }

          aria-label="Next page"

          className="
            flex
            h-7
            w-7

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

    <div className="space-y-5">

      {Array.from({
        length: 4,
      }).map(
        (_, index) => (

          <div
            key={index}

            className="
              flex

              animate-pulse

              gap-3

              sm:gap-4
            "
          >

            {/* DATE */}

            <div
              className="
                h-[48px]
                w-[48px]

                shrink-0

                rounded-xl

                bg-slate-200

                dark:bg-zinc-800

                sm:h-[54px]
                sm:w-[54px]
              "
            />


            {/* CARD */}

            <div
              className="
                min-w-0
                flex-1

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
                  items-center
                  justify-between

                  border-b
                  border-slate-100

                  px-4
                  py-4

                  dark:border-zinc-900
                "
              >

                <div className="space-y-2">

                  <div
                    className="
                      h-3
                      w-32

                      rounded

                      bg-slate-200

                      dark:bg-zinc-800
                    "
                  />

                  <div
                    className="
                      h-2
                      w-20

                      rounded

                      bg-slate-100

                      dark:bg-zinc-900
                    "
                  />

                </div>


                <div
                  className="
                    h-8
                    w-16

                    rounded-lg

                    bg-slate-100

                    dark:bg-zinc-900
                  "
                />

              </div>


              <div
                className="
                  space-y-3

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

                <div
                  className="
                    h-3
                    w-2/3

                    rounded

                    bg-slate-100

                    dark:bg-zinc-900
                  "
                />

              </div>

            </div>

          </div>

        )
      )}

    </div>

  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({
  hasDateFilter,
}: {
  hasDateFilter: boolean;
}) {

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

        px-4

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
          className="h-5 w-5"
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
        No reports found
      </h3>


      <p
        className="
          mt-2

          max-w-[300px]

          text-xs
          leading-5

          text-slate-400

          dark:text-zinc-600
        "
      >

        {hasDateFilter
          ? "There are no reports matching the selected date."
          : "You haven't submitted any reports yet."}

      </p>


      {hasDateFilter && (

        <p
          className="
            mt-3

            text-[11px]
            font-semibold

            text-indigo-500

            dark:text-indigo-400
          "
        >
          Try clearing the date filter.
        </p>

      )}

    </div>

  );
}