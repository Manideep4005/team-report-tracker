import {
  HiOutlineClock,
  HiOutlineComputerDesktop,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
} from "react-icons/hi2";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getLoginHistory } from "../../services/loginHistory";
import type { LoginHistoryItem } from "../../services/loginHistory";

export default function LoginHistory() {
  const [page, setPage] = useState(1);

  const limit = 10;

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["login-history", page, limit],

    queryFn: async () => {
      const response = await getLoginHistory(page, limit);

      return response.data;
    },

    placeholderData: (previousData) => previousData,
  });

  const history: LoginHistoryItem[] = data?.items ?? [];

  const pagination = data?.pagination;

  const total = pagination?.total ?? 0;

  const totalPages = pagination?.totalPages ?? 1;

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
  }

  /*
   * These counts represent the currently
   * loaded page because the API currently
   * returns paginated records.
   */
  const successCount = history.filter(
    (item) => item.status === "SUCCESS",
  ).length;

  const failedCount = history.filter(
    (item) => item.status !== "SUCCESS",
  ).length;

  return (
    <div
      className="
                mx-auto
                w-full
                max-w-[1180px]
                px-4
                py-5
                sm:px-6
                sm:py-7
                lg:px-8
                lg:py-8
            "
    >
      {/* ==================================================
                HEADER
            ================================================== */}

      <div
        className="
                    flex
                    flex-col
                    gap-5
                    border-b
                    border-slate-200/80
                    pb-5
                    dark:border-zinc-800/80
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                    sm:pb-6
                "
      >
        <div className="min-w-0">
          <div
            className="
                            mb-3
                            flex
                            items-center
                            gap-2
                        "
          ></div>

          <div
            className="
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        "
          >
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
              Login History
            </h1>

            {!isLoading && (
              <span
                className="
                                    inline-flex
                                    h-7
                                    items-center
                                    rounded-full
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    px-2.5
                                    text-[10px]
                                    font-bold
                                    text-indigo-600
                                    dark:border-indigo-500/20
                                    dark:bg-indigo-500/10
                                    dark:text-indigo-400
                                "
              >
                {total} {total === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>

          <p
            className="
                            mt-1.5
                            text-sm
                            text-slate-500
                            dark:text-zinc-500
                        "
          >
            Monitor account sign-ins and access attempts.
          </p>
        </div>

        {!isLoading && !isError && (
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="
                            inline-flex
                            h-9
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-[11px]
                            font-semibold
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-slate-50
                            hover:text-slate-800
                            disabled:opacity-50
                            sm:w-auto
                            dark:border-zinc-800
                            dark:bg-zinc-950
                            dark:text-zinc-400
                            dark:hover:bg-zinc-900
                            dark:hover:text-zinc-200
                        "
          >
            <HiOutlineArrowPath
              className={`
                                h-3.5
                                w-3.5
                                ${isFetching ? "animate-spin" : ""}
                            `}
            />
            Refresh
          </button>
        )}
      </div>

      {/* ==================================================
                SUMMARY
            ================================================== */}

      {!isLoading && !isError && history.length > 0 && (
        <div
          className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-3
                        "
        >
          <LoginStat
            icon={<HiOutlineShieldCheck />}
            label="Total entries"
            value={total}
            type="total"
          />

          <LoginStat
            icon={<HiOutlineCheckCircle />}
            label="Successful"
            value={successCount}
            type="success"
          />

          <LoginStat
            icon={<HiOutlineXCircle />}
            label="Failed attempts"
            value={failedCount}
            type="failed"
          />
        </div>
      )}

      {/* ==================================================
                CONTENT
            ================================================== */}

      <div className="relative mt-5">
        {isFetching && !isLoading && (
          <div
            className="
                                pointer-events-none
                                absolute
                                inset-x-0
                                top-0
                                z-20
                                flex
                                justify-center
                            "
          >
            <div
              className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-medium
                                    text-slate-500
                                    shadow-sm
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-400
                                "
            >
              <span
                className="
                                        h-3
                                        w-3
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-slate-300
                                        border-t-indigo-500
                                        dark:border-zinc-700
                                        dark:border-t-indigo-400
                                    "
              />
              Loading...
            </div>
          </div>
        )}

        {isLoading ? (
          <LoginHistorySkeleton />
        ) : isError ? (
          <LoginHistoryError onRetry={() => refetch()} />
        ) : history.length === 0 ? (
          <EmptyLoginHistory />
        ) : (
          <>
            {/* ==================================================
                            DESKTOP / TABLET
                        ================================================== */}

            <div
              className="
                                hidden
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                shadow-[0_3px_16px_rgba(15,23,42,0.035)]
                                md:block
                                dark:border-zinc-800
                                dark:bg-zinc-950
                                dark:shadow-none
                            "
            >
              <div
                className="
                                    border-b
                                    border-slate-100
                                    bg-slate-50/60
                                    px-5
                                    py-3
                                    dark:border-zinc-800
                                    dark:bg-zinc-900/30
                                "
              >
                <div
                  className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                >
                  <div>
                    <p
                      className="
                                                text-[11px]
                                                font-bold
                                                text-slate-700
                                                dark:text-zinc-300
                                            "
                    >
                      Recent activity
                    </p>

                    <p
                      className="
                                                mt-0.5
                                                text-[10px]
                                                text-slate-400
                                                dark:text-zinc-600
                                            "
                    >
                      Latest authentication attempts
                    </p>
                  </div>

                  <div
                    className="
                                            flex
                                            items-center
                                            gap-3
                                            text-[10px]
                                        "
                  >
                    <span
                      className="
                                                flex
                                                items-center
                                                gap-1.5
                                                text-slate-400
                                                dark:text-zinc-600
                                            "
                    >
                      <span
                        className="
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    bg-emerald-500
                                                "
                      />
                      Success
                    </span>

                    <span
                      className="
                                                flex
                                                items-center
                                                gap-1.5
                                                text-slate-400
                                                dark:text-zinc-600
                                            "
                    >
                      <span
                        className="
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    bg-red-500
                                                "
                      />
                      Failed
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="
                                        w-full
                                        min-w-[760px]
                                    "
                >
                  <thead>
                    <tr
                      className="
                                                border-b
                                                border-slate-100
                                                dark:border-zinc-800
                                            "
                    >
                      <th
                        className="
                                                    w-[80px]
                                                    px-5
                                                    py-3
                                                    text-left
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-600
                                                "
                      >
                        Status
                      </th>

                      <th
                        className="
                                                    px-4
                                                    py-3
                                                    text-left
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-600
                                                "
                      >
                        User
                      </th>

                      <th
                        className="
                                                    px-4
                                                    py-3
                                                    text-left
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-600
                                                "
                      >
                        Date & Time
                      </th>

                      <th
                        className="
                                                    px-4
                                                    py-3
                                                    text-left
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-600
                                                "
                      >
                        Network
                      </th>

                      <th
                        className="
                                                    px-4
                                                    py-3
                                                    text-left
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-600
                                                "
                      >
                        Browser
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((item) => (
                      <LoginHistoryRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ==================================================
                            MOBILE
                        ================================================== */}

            <div
              className="
                                space-y-3
                                md:hidden
                            "
            >
              {history.map((item) => (
                <MobileLoginHistoryCard key={item.id} item={item} />
              ))}
            </div>

            {/* ==================================================
                            PAGINATION
                        ================================================== */}

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={goToPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function LoginStat({
  icon,
  label,
  value,
  type,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  type: "total" | "success" | "failed";
}) {
  const styles = {
    total: {
      wrapper: "bg-white dark:bg-zinc-950",
      icon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    },

    success: {
      wrapper: "bg-white dark:bg-zinc-950",
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },

    failed: {
      wrapper: "bg-white dark:bg-zinc-950",
      icon: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
    },
  };

  const current = styles[type];

  return (
    <div
      className={`
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                px-4
                py-3
                ${current.wrapper}
                dark:border-zinc-800
            `}
    >
      <div
        className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${current.icon}
                `}
      >
        <span className="h-4 w-4">{icon}</span>
      </div>

      <div>
        <p
          className="
                        text-[18px]
                        font-bold
                        leading-none
                        text-slate-900
                        dark:text-white
                    "
        >
          {value}
        </p>

        <p
          className="
                        mt-1
                        text-[10px]
                        font-medium
                        text-slate-400
                        dark:text-zinc-600
                    "
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   DESKTOP ROW
================================================================ */

function LoginHistoryRow({ item }: { item: LoginHistoryItem }) {
  const success = item.status === "SUCCESS";

  const { formattedDate, formattedTime } = formatDateParts(item.createdAt);

  return (
    <tr
      className="
                group
                border-b
                border-slate-100
                transition-colors
                last:border-0
                hover:bg-slate-50/60
                dark:border-zinc-800/60
                dark:hover:bg-zinc-900/40
            "
    >
      {/* STATUS */}

      <td className="px-5 py-3.5">
        <div
          className={`
                        inline-flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          success
                            ? `
                                    bg-emerald-50
                                    text-emerald-600
                                    dark:bg-emerald-500/10
                                    dark:text-emerald-400
                                `
                            : `
                                    bg-red-50
                                    text-red-500
                                    dark:bg-red-500/10
                                    dark:text-red-400
                                `
                        }
                    `}
        >
          {success ? (
            <HiOutlineCheckCircle className="h-4 w-4" />
          ) : (
            <HiOutlineXCircle className="h-4 w-4" />
          )}
        </div>
      </td>

      {/* USER */}

      <td className="px-4 py-3.5">
        <div
          className="
                        flex
                        items-center
                        gap-3
                    "
        >
          <UserAvatar name={item.user?.name ?? "Unknown User"} />

          <div
            className="
                            min-w-0
                        "
          >
            <p
              className="
                                truncate
                                text-xs
                                font-semibold
                                text-slate-800
                                dark:text-zinc-200
                            "
            >
              {item.user?.name ?? "Unknown User"}
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
              {item.email}
            </p>
          </div>
        </div>
      </td>

      {/* DATE */}

      <td className="px-4 py-3.5">
        <p
          className="
                        text-xs
                        font-semibold
                        text-slate-700
                        dark:text-zinc-300
                    "
        >
          {formattedDate}
        </p>

        <p
          className="
                        mt-0.5
                        text-[10px]
                        text-slate-400
                        dark:text-zinc-600
                    "
        >
          {formattedTime}
        </p>
      </td>

      {/* NETWORK */}

      <td className="px-4 py-3.5">
        <div
          className="
                        flex
                        items-center
                        gap-1.5
                    "
        >
          <HiOutlineMapPin
            className="
                            h-3.5
                            w-3.5
                            text-slate-300
                            dark:text-zinc-700
                        "
          />

          <code
            className="
                            text-[10px]
                            text-slate-500
                            dark:text-zinc-500
                        "
          >
            {item.ipAddress ?? "Not available"}
          </code>
        </div>
      </td>

      {/* BROWSER */}

      <td className="px-4 py-3.5">
        <div
          className="
                        flex
                        items-center
                        gap-2
                    "
        >
          <div
            className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                            text-slate-400
                            dark:bg-zinc-900
                            dark:text-zinc-600
                        "
          >
            <HiOutlineComputerDesktop className="h-3.5 w-3.5" />
          </div>

          <span
            className="
                            text-[10px]
                            font-medium
                            text-slate-600
                            dark:text-zinc-400
                        "
          >
            {formatUserAgent(item.userAgent)}
          </span>
        </div>
      </td>
    </tr>
  );
}

/* ================================================================
   USER AVATAR
================================================================ */

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-indigo-50
                text-[10px]
                font-bold
                text-indigo-600
                dark:bg-indigo-500/10
                dark:text-indigo-400
            "
    >
      {initial}
    </div>
  );
}

/* ================================================================
   MOBILE CARD
================================================================ */

function MobileLoginHistoryCard({ item }: { item: LoginHistoryItem }) {
  const success = item.status === "SUCCESS";

  const { formattedDate, formattedTime } = formatDateParts(item.createdAt);

  return (
    <div
      className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_2px_12px_rgba(15,23,42,0.035)]
                dark:border-zinc-800
                dark:bg-zinc-950
                dark:shadow-none
            "
    >
      <div className="p-4">
        {/* TOP */}

        <div
          className="
                        flex
                        items-center
                        gap-3
                    "
        >
          <div
            className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${
                              success
                                ? `
                                        bg-emerald-50
                                        text-emerald-600
                                        dark:bg-emerald-500/10
                                        dark:text-emerald-400
                                    `
                                : `
                                        bg-red-50
                                        text-red-500
                                        dark:bg-red-500/10
                                        dark:text-red-400
                                    `
                            }
                        `}
          >
            {success ? (
              <HiOutlineCheckCircle className="h-5 w-5" />
            ) : (
              <HiOutlineXCircle className="h-5 w-5" />
            )}
          </div>

          <div
            className="
                            min-w-0
                            flex-1
                        "
          >
            <div
              className="
                                flex
                                items-center
                                gap-2
                            "
            >
              <p
                className="
                                    truncate
                                    text-xs
                                    font-bold
                                    text-slate-800
                                    dark:text-zinc-200
                                "
              >
                {item.user?.name ?? "Unknown User"}
              </p>

              <span
                className={`
                                    shrink-0
                                    rounded-full
                                    px-2
                                    py-0.5
                                    text-[8px]
                                    font-bold
                                    ${
                                      success
                                        ? `
                                                bg-emerald-50
                                                text-emerald-600
                                                dark:bg-emerald-500/10
                                                dark:text-emerald-400
                                            `
                                        : `
                                                bg-red-50
                                                text-red-600
                                                dark:bg-red-500/10
                                                dark:text-red-400
                                            `
                                    }
                                `}
              >
                {success ? "SUCCESS" : "FAILED"}
              </span>
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
              {item.email}
            </p>
          </div>

          <div
            className="
                            shrink-0
                            text-right
                        "
          >
            <p
              className="
                                text-[10px]
                                font-semibold
                                text-slate-600
                                dark:text-zinc-400
                            "
            >
              {formattedDate}
            </p>

            <p
              className="
                                mt-0.5
                                text-[9px]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              {formattedTime}
            </p>
          </div>
        </div>

        {/* META */}

        <div
          className="
                        mt-3
                        grid
                        grid-cols-1
                        gap-2
                        border-t
                        border-slate-100
                        pt-3
                        dark:border-zinc-800
                        sm:grid-cols-2
                    "
        >
          <div
            className="
                            flex
                            min-w-0
                            items-center
                            gap-2
                        "
          >
            <HiOutlineMapPin
              className="
                                h-3.5
                                w-3.5
                                shrink-0
                                text-slate-300
                                dark:text-zinc-700
                            "
            />

            <span
              className="
                                truncate
                                text-[9px]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              {item.ipAddress ?? "Not available"}
            </span>
          </div>

          <div
            className="
                            flex
                            min-w-0
                            items-center
                            gap-2
                        "
          >
            <HiOutlineComputerDesktop
              className="
                                h-3.5
                                w-3.5
                                shrink-0
                                text-slate-300
                                dark:text-zinc-700
                            "
            />

            <span
              className="
                                truncate
                                text-[9px]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              {formatUserAgent(item.userAgent)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DATE FORMAT
================================================================ */

function formatDateParts(createdAt: string) {
  const date = new Date(createdAt);

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return {
    formattedDate,
    formattedTime,
  };
}

/* ================================================================
   USER AGENT
================================================================ */

function formatUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return "Not available";
  }

  if (userAgent.includes("Edg/")) {
    return "Microsoft Edge";
  }

  if (userAgent.includes("Chrome/")) {
    return "Google Chrome";
  }

  if (userAgent.includes("Firefox/")) {
    return "Mozilla Firefox";
  }

  if (userAgent.includes("Safari/")) {
    return "Safari";
  }

  return userAgent;
}

/* ================================================================
   PAGINATION
================================================================ */

function getPageWindow(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);

  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("gap");
    }

    result.push(sorted[i]);
  }

  return result;
}

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const start = (page - 1) * limit + 1;

  const end = Math.min(page * limit, total);

  const pageWindow = getPageWindow(page, totalPages);

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
        </span>{" "}
        of{" "}
        <span
          className="
                        font-semibold
                        text-slate-600
                        dark:text-zinc-400
                    "
        >
          {total}
        </span>{" "}
        entries
      </p>

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
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
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
          aria-label="Previous page"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pageWindow.map((entry, index) =>
          entry === "gap" ? (
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
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
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
                                    ${
                                      entry === page
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
              aria-current={entry === page ? "page" : undefined}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
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
          aria-label="Next page"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   SKELETON
================================================================ */

function LoginHistorySkeleton() {
  return (
    <div
      className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                dark:border-zinc-800
                dark:bg-zinc-950
            "
    >
      <div className="animate-pulse">
        <div
          className="
                        border-b
                        border-slate-100
                        px-5
                        py-4
                        dark:border-zinc-800
                    "
        >
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
                            mt-2
                            h-2
                            w-48
                            rounded
                            bg-slate-100
                            dark:bg-zinc-900
                        "
          />
        </div>

        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="
                                flex
                                items-center
                                gap-4
                                border-b
                                border-slate-100
                                px-5
                                py-4
                                last:border-0
                                dark:border-zinc-800
                            "
          >
            <div
              className="
                                    h-8
                                    w-8
                                    rounded-lg
                                    bg-slate-200
                                    dark:bg-zinc-800
                                "
            />

            <div
              className="
                                    w-32
                                    space-y-2
                                "
            >
              <div
                className="
                                        h-2.5
                                        w-20
                                        rounded
                                        bg-slate-200
                                        dark:bg-zinc-800
                                    "
              />

              <div
                className="
                                        h-2
                                        w-28
                                        rounded
                                        bg-slate-100
                                        dark:bg-zinc-900
                                    "
              />
            </div>

            <div
              className="
                                    ml-6
                                    hidden
                                    w-24
                                    space-y-2
                                    sm:block
                                "
            >
              <div
                className="
                                        h-2.5
                                        w-20
                                        rounded
                                        bg-slate-200
                                        dark:bg-zinc-800
                                    "
              />

              <div
                className="
                                        h-2
                                        w-14
                                        rounded
                                        bg-slate-100
                                        dark:bg-zinc-900
                                    "
              />
            </div>

            <div
              className="
                                    ml-auto
                                    hidden
                                    h-2.5
                                    w-24
                                    rounded
                                    bg-slate-100
                                    dark:bg-zinc-900
                                    sm:block
                                "
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   ERROR
================================================================ */

function LoginHistoryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="
                flex
                min-h-[300px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-red-200
                bg-red-50/40
                px-6
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
        <HiOutlineXCircle className="h-6 w-6" />
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
        Unable to load login history
      </h3>

      <p
        className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-zinc-500
                "
      >
        Something went wrong while loading login activity.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="
                    mt-5
                    inline-flex
                    h-9
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-xs
                    font-semibold
                    text-slate-600
                    shadow-sm
                    transition
                    hover:bg-slate-50
                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-zinc-400
                    dark:hover:bg-zinc-800
                "
      >
        <HiOutlineArrowPath className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyLoginHistory() {
  return (
    <div
      className="
                flex
                min-h-[300px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-white/60
                px-6
                text-center
                dark:border-zinc-800
                dark:bg-zinc-950/40
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
        <HiOutlineClock className="h-6 w-6" />
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
        No login activity
      </h3>

      <p
        className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-400
                    dark:text-zinc-600
                "
      >
        No login history has been recorded yet.
      </p>
    </div>
  );
}
