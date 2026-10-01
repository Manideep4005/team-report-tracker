
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";

import {
  HiOutlineClipboardDocument,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineChevronDown,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

import { format } from "date-fns";
import { toast } from "sonner";

import {
  getAllReports,
  getUsersForReports,
  getUserReports,
  exportAllReports,
  type ReportUser,
} from "../../services/report";

import DayPickerInput from "../../components/DayPickerInput";
import PageTitle from "../../components/PageTitle";
import UserAvatar from "../../components/UserAvatar";

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
    avatarUrl: string;
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

  const [exportOpen, setExportOpen] =
    useState(false);

  const [userOpen, setUserOpen] =
    useState(false);

  const [exportMonth, setExportMonth] =
    useState("");


  const [exportFromDate, setExportFromDate] =
    useState<Date | null>(null);

  const [exportToDate, setExportToDate] =
    useState<Date | null>(null);

  const [isExporting, setIsExporting] =
    useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  /* =============================================================
       CLOSE EXPORT MENU ON OUTSIDE CLICK
       (matches History.tsx behavior)
  ============================================================= */

  useEffect(() => {
    if (!exportOpen && !userOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (exportRef.current && !exportRef.current.contains(target)) {
        setExportOpen(false);
      }

      if (userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [exportOpen, userOpen]);

  const dateParam = date
    ? format(date, "yyyy-MM-dd")
    : undefined;

  const { hasPermission } = useAuth();
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


      const groups = new Map<string, ReportItem[]>();


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
    EXPORT
  ============================================================== */

  const handleExport = async (
    type: "all" | "date" | "month" | "range"
  ) => {
    if (isExporting) {
      return;
    }

    try {
      setIsExporting(true);

      /*
       * Close dropdown immediately
       * when export begins (matches History.tsx).
       */
      setExportOpen(false);

      let response;

      if (type === "all") {
        response = await exportAllReports({
          filter: "all",
        });
      }

      if (type === "date") {
        if (!dateParam) {
          toast.error("Please select a date first.");
          return;
        }

        response = await exportAllReports({
          filter: "date",
          date: dateParam,
        });
      }

      if (type === "month") {
        if (!exportMonth) {
          toast.error("Please select a month first.");
          return;
        }

        response = await exportAllReports({
          filter: "month",
          month: exportMonth,
        });
      }

      if (type === "range") {
        if (!exportFromDate || !exportToDate) {
          toast.error(
            "Please select both From and To dates."
          );
          return;
        }

        const from =
          format(exportFromDate, "yyyy-MM-dd");

        const to =
          format(exportToDate, "yyyy-MM-dd");

        if (from > to) {
          toast.error(
            "From date cannot be after To date."
          );
          return;
        }

        response = await exportAllReports({
          filter: "range",
          from,
          to,
        });
      }

      if (!response) {
        return;
      }

      const blob =
        response instanceof Blob
          ? response
          : new Blob(
            [response],
            {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
          );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      if (type === "all") {
        link.download =
          "team_reports_all.xlsx";
      } else if (type === "date") {
        link.download =
          `team_reports_${dateParam}.xlsx`;
      } else if (type === "month") {
        link.download =
          `team_reports_${exportMonth}.xlsx`;
      } else {
        const from =
          format(
            exportFromDate!,
            "yyyy-MM-dd"
          );

        const to =
          format(
            exportToDate!,
            "yyyy-MM-dd"
          );

        link.download =
          `team_reports_${from}_to_${to}.xlsx`;
      }

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Excel exported successfully."
      );
    } catch {
      toast.error(
        "Unable to export reports."
      );
    } finally {
      setIsExporting(false);
    }
  };


  /* ==============================================================
    PAGE CHANGE
    (already scrolls smoothly to top on every page change —
    prev, next, or a specific page number)
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
    TITLE
  ============================================================== */

  const screenTitle =
    selectedUser
      ? `${selectedUser.name}'s Reports`
      : "Team Reports";

  const hasActiveFilters =
    Boolean(date) || selectedUserId !== ALL_USERS;


  /* ==============================================================
    RENDER
  ============================================================== */

  return (
    <div
      className="
    relative
    z-0
    mx-auto
    w-full
    max-w-[1100px]
    min-w-0
    px-4
    py-5
    sm:px-6
    sm:py-7
    lg:px-8
    lg:py-8
  "
    >
      <PageTitle title="All Reports" />

      {/* ===========================================================
          PAGE HEADER
          (mirrors History.tsx's structure and toolbar styling)
      =========================================================== */}

      <div
        className="
          relative
          z-10
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
              truncate

              text-[26px]
              font-bold
              tracking-[-0.035em]

              text-slate-950

              dark:text-white

              sm:text-3xl
            "
          >
            {screenTitle}
          </h1>

          <p
            className="
              mt-1.5

              text-sm

              text-slate-500

              dark:text-zinc-500
            "
          >
            Browse and manage team work reports.
          </p>

        </div>


        {/* =========================================================
            PREMIUM FILTER TOOLBAR
        ========================================================= */}

        <div
          className="
            relative
            z-[10]
            flex
            w-full
            flex-wrap
            items-center
            gap-2

            rounded-2xl
            border
            border-slate-200/80
            bg-white/80
            p-1.5

            shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)]
            backdrop-blur-sm

            dark:border-zinc-800
            dark:bg-zinc-950/80
            dark:shadow-none

            sm:w-auto
            sm:flex-nowrap

            lg:border-0
            lg:bg-transparent
            lg:p-0
            lg:shadow-none
            lg:backdrop-blur-0
          "
        >

          {/* REPORT COUNT */}

          {!isLoading && pagination && pagination.total > 0 && (
            <div
              className="
                flex
                h-9
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-50
                px-3

                dark:bg-zinc-900
              "
            >
              <span
                className="
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-md
                  bg-indigo-100
                  px-1.5
                  text-[10px]
                  font-bold
                  tabular-nums
                  text-indigo-600

                  dark:bg-indigo-500/10
                  dark:text-indigo-400
                "
              >
                {pagination.total}
              </span>

              <span
                className="
                  text-[11px]
                  font-medium
                  text-slate-500
                  dark:text-zinc-500
                "
              >
                {pagination.total === 1
                  ? "Report"
                  : "Reports"}
              </span>
            </div>
          )}

          {/* DIVIDER */}

          {!isLoading &&
            pagination &&
            pagination.total > 0 && (
              <div
                className="
                  hidden
                  h-5
                  w-px
                  bg-slate-200
                  sm:block
                  dark:bg-zinc-800
                "
              />
            )}

          {/* USER FILTER */}

          <div ref={userRef} className="relative min-w-0">
            <button
              type="button"
              disabled={usersLoading}
              aria-haspopup="listbox"
              aria-expanded={userOpen}
              onClick={() => {
                setUserOpen((current) => !current);
                setExportOpen(false);
              }}
              className={`
                flex h-9 w-full min-w-0 items-center gap-2 rounded-xl
                border px-2.5 text-left text-[11px] font-semibold outline-none
                transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60
                sm:w-[180px]
                ${userOpen
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10"
                }
              `}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[9px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                {selectedUser
                  ? selectedUser.name.trim().charAt(0).toUpperCase()
                  : <HiOutlineUsers className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {selectedUser?.name ?? "All users"}
                {selectedUser?.deletedAt ? " · Inactive" : ""}
              </span>
              <HiOutlineChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform dark:text-zinc-500 ${userOpen ? "rotate-180 text-indigo-500" : ""}`} />
            </button>

            {userOpen && (
              <div
                className="absolute right-0 top-full z-[10000] mt-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.28)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_20px_50px_-18px_rgba(0,0,0,0.7)]"
                role="listbox"
              >
                <div className="px-2.5 pb-1.5 pt-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-zinc-600">Filter by user</p>
                </div>

                <button
                  type="button"
                  role="option"
                  aria-selected={selectedUserId === ALL_USERS}
                  onClick={() => { handleClearUser(); setUserOpen(false); }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${selectedUserId === ALL_USERS ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <HiOutlineUsers className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold">All users</span>
                    <span className="block text-[9px] text-slate-400 dark:text-zinc-600">Show the complete team</span>
                  </span>
                  {selectedUserId === ALL_USERS && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                <div className="max-h-64 overflow-y-auto">
                  {users.map((user) => {
                    const active = user.id === selectedUserId;
                    // const initial = user.name.trim().charAt(0).toUpperCase();
                    return (
                      <button
                        key={user.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => { handleUserChange(user.id); setUserOpen(false); }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${user.deletedAt ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : active ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" : "bg-slate-100 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400"}`}>
                          <UserAvatar
                            name={user.name}
                            avatarUrl={user.avatarUrl}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-semibold">{user.name}</span>
                          <span className="block text-[9px] text-slate-400 dark:text-zinc-600">{user.deletedAt ? "Inactive user" : "Team member"}</span>
                        </span>
                        {user.deletedAt && <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Inactive</span>}
                        {active && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DATE FILTER */}

          <div className="min-w-0 w-full sm:w-[180px]">
            <div className="min-w-0">
              <DayPickerInput
                value={date}
                onChange={handleDateChange}
                placeholder="Filter by date"
              />
            </div>
          </div>

          {/* CLEAR */}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                handleClearDate();
                handleClearUser();
              }}
              className="
                inline-flex
                h-9
                w-full
                shrink-0
                sm:w-auto
                items-center
                justify-center
                gap-1.5
                rounded-xl
                px-3
                text-[11px]
                font-semibold
                text-slate-500
                transition-all
                duration-200

                hover:bg-slate-100
                hover:text-slate-800

                active:scale-[0.97]

                dark:text-zinc-500
                dark:hover:bg-zinc-800
                dark:hover:text-zinc-200
              "
            >
              <HiOutlineXMark className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          {/* EXPORT */}

          {hasPermission("REPORT_EXPORT_ALL") && (
            <div
              ref={exportRef}
              className="relative z-[70] w-full shrink-0 sm:w-auto"
            >
              <button
                type="button"
                onClick={() =>
                  setExportOpen((current) => !current)
                }
                disabled={isExporting}
                aria-expanded={exportOpen}
                className={`
                  inline-flex
                  h-9
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-3.5
                  text-[11px]
                  font-semibold
                  transition-all
                  duration-200

                  sm:w-auto

                  lg:px-4

                  ${exportOpen
                    ? `
                      bg-slate-900
                      text-white
                      shadow-md
                      shadow-slate-900/15
                      dark:bg-white
                      dark:text-zinc-900
                    `
                    : `
                      bg-indigo-600
                      text-white
                      shadow-sm
                      shadow-indigo-500/15
                      hover:bg-indigo-500
                      hover:shadow-md
                    `
                  }

                  active:scale-[0.97]

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                `}
              >
                {isExporting ? (
                  <HiOutlineArrowPath
                    className="h-3.5 w-3.5 animate-spin"
                  />
                ) : (
                  <HiOutlineArrowDownTray
                    className={`
                      h-3.5
                      w-3.5
                      transition-transform
                      duration-200
                      ${exportOpen ? "-translate-y-px" : ""}
                    `}
                  />
                )}

                <span>
                  {isExporting
                    ? "Exporting..."
                    : "Export"}
                </span>
              </button>

              {/* EXPORT POPOVER */}

              {exportOpen && !isExporting && (
                <div
                  className="
                    fixed
                    left-3
                    right-3
                    top-1/2
                    z-[9999]
                    max-h-[calc(100vh-2rem)]
                    -translate-y-1/2
                    overflow-y-auto
                    rounded-2xl

                    w-auto
                    max-w-none
                    overflow-visible

                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white

                    shadow-[0_20px_50px_-18px_rgba(15,23,42,0.25)]

                    dark:border-zinc-800
                    dark:bg-zinc-950
                    dark:shadow-[0_20px_50px_-18px_rgba(0,0,0,0.65)]

                    sm:absolute
                    sm:left-auto
                    sm:right-0
                    sm:top-full
                    sm:mt-2.5
                    sm:w-[370px]
                    sm:max-h-[calc(100vh-7rem)]
                    sm:translate-y-0
                  "
                >
                  {/* POPOVER HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      border-slate-100
                      px-4
                      py-3.5

                      dark:border-zinc-800
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-indigo-50
                          text-indigo-600

                          dark:bg-indigo-500/10
                          dark:text-indigo-400
                        "
                      >
                        <HiOutlineArrowDownTray className="h-4 w-4" />
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            font-semibold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          Export reports
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-600
                          "
                        >
                          Choose what you want to export
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExportOpen(false)}
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

                        dark:text-zinc-500
                        dark:hover:bg-zinc-900
                        dark:hover:text-zinc-200
                      "
                    >
                      <HiOutlineXMark className="h-4 w-4" />
                    </button>
                  </div>

                  {/* EXPORT OPTIONS */}

                  <div className="p-2">
                    {/* ALL */}

                    <button
                      type="button"
                      onClick={() => handleExport("all")}
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        transition-all
                        duration-150

                        hover:bg-slate-50

                        dark:hover:bg-zinc-900
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                          transition
                          group-hover:bg-indigo-50
                          group-hover:text-indigo-600

                          dark:bg-zinc-900
                          dark:text-zinc-500
                          dark:group-hover:bg-indigo-500/10
                          dark:group-hover:text-indigo-400
                        "
                      >
                        <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-[11px]
                            font-semibold
                            text-slate-800
                            dark:text-zinc-100
                          "
                        >
                          All reports
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-600
                          "
                        >
                          Export the complete team history
                        </p>
                      </div>

                      <HiOutlineChevronRight
                        className="
                          h-3.5
                          w-3.5
                          text-slate-300
                          transition-transform
                          group-hover:translate-x-0.5
                          group-hover:text-indigo-500

                          dark:text-zinc-700
                        "
                      />
                    </button>

                    {/* SELECTED DATE */}

                    <button
                      type="button"
                      disabled={!dateParam}
                      onClick={() => handleExport("date")}
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        transition-all
                        duration-150

                        hover:bg-slate-50

                        disabled:cursor-not-allowed
                        disabled:opacity-40

                        dark:hover:bg-zinc-900
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-slate-500

                          dark:bg-zinc-900
                          dark:text-zinc-500
                        "
                      >
                        <HiOutlineDocumentMagnifyingGlass className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-[11px]
                            font-semibold
                            text-slate-800
                            dark:text-zinc-100
                          "
                        >
                          Selected date
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-600
                          "
                        >
                          {dateParam
                            ? `Export reports from ${dateParam}`
                            : "Select a date first"}
                        </p>
                      </div>

                      {dateParam && (
                        <HiOutlineChevronRight
                          className="
                            h-3.5
                            w-3.5
                            text-slate-300
                            transition-transform
                            group-hover:translate-x-0.5
                            dark:text-zinc-700
                          "
                        />
                      )}
                    </button>

                    {/* DATE RANGE */}

                    <div
                      className="
                        mt-1
                        border-t
                        border-slate-100
                        pt-2
                        dark:border-zinc-800
                      "
                    >
                      <div className="px-3 pb-1.5">
                        <span
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                            dark:text-zinc-600
                          "
                        >
                          Date range
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 px-2 sm:grid-cols-2">
                        <DayPickerInput
                          value={exportFromDate}
                          onChange={setExportFromDate}
                          placeholder="From date"
                        />

                        <DayPickerInput
                          value={exportToDate}
                          onChange={setExportToDate}
                          placeholder="To date"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={
                          !exportFromDate ||
                          !exportToDate
                        }
                        onClick={() => handleExport("range")}
                        className="
                          mx-2
                          mt-2
                          mb-1
                          inline-flex
                          h-9
                          w-[calc(100%-1rem)]
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

                          active:scale-[0.97]

                          disabled:cursor-not-allowed
                          disabled:opacity-35
                        "
                      >
                        <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
                        Export date range
                      </button>
                    </div>

                    {/* MONTH */}

                    <div
                      className="
                        mt-2
                        border-t
                        border-slate-100
                        pt-2
                        dark:border-zinc-800
                      "
                    >
                      <div className="px-3 pb-1.5">
                        <span
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                            dark:text-zinc-600
                          "
                        >
                          Month
                        </span>
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-[minmax(0,1fr)_auto]
                          gap-2
                          px-2
                          pb-1
                        "
                      >
                        <input
                          type="month"
                          value={exportMonth}
                          onChange={(event) =>
                            setExportMonth(event.target.value)
                          }
                          className="
                            h-9
                            min-w-0
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-2.5
                            text-[11px]
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

                        <button
                          type="button"
                          disabled={!exportMonth}
                          onClick={() =>
                            handleExport("month")
                          }
                          className="
                            inline-flex
                            h-9
                            min-w-[82px]
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

                            hover:bg-indigo-500
                            hover:shadow-md
                            hover:shadow-indigo-500/15

                            active:scale-[0.97]

                            disabled:cursor-not-allowed
                            disabled:opacity-35
                          "
                        >
                          <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ACTIVE FILTER TAG */}

      {selectedUser && (
        <div className="mt-3 flex min-w-0 items-center">
          <div
            className="
              inline-flex
              min-w-0
              max-w-full
              items-center
              gap-1.5
              rounded-md
              bg-slate-100
              px-2.5
              py-1
              text-[11px]
              font-medium
              text-slate-600

              dark:bg-zinc-900
              dark:text-zinc-400
            "
          >
            <HiOutlineUsers className="h-3 w-3 shrink-0" />

            <span className="truncate">
              {selectedUser.name}
            </span>

            {selectedUser.deletedAt && (
              <span
                className="
                  shrink-0
                  rounded
                  bg-amber-50
                  px-1.5
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-amber-700

                  dark:bg-amber-500/10
                  dark:text-amber-400
                "
              >
                Inactive
              </span>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
        CONTENT
    ========================================================= */}

      <div className="mt-7 sm:mt-8">
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
              {groupedReports.map((group) => (
                <DateSection
                  key={group.date}
                  date={group.date}
                  reports={group.reports}
                  onCopy={handleCopy}
                />
              ))}
            </div>

            {pagination &&
              pagination.totalPages > 1 && (
                <Pagination
                  pagination={pagination}
                  isFetching={isFetching}
                  onPageChange={handlePageChange}
                />
              )}
          </>
        ) : (
          <EmptyState
            hasDateFilter={Boolean(date)}
            hasUserFilter={
              selectedUserId !== ALL_USERS
            }
            userName={selectedUser?.name}
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
            <UserAvatar
              name={report.user.name}
              avatarUrl={report.user.avatarUrl}
            />
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
