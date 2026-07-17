import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { getHistory } from "../../services/report";

export default function History() {
    const [date, setDate] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["history", date],
        queryFn: async () => {
            const response = await getHistory(date || undefined);
            return response.data;
        },
    });

    return (
        <div className="mx-auto max-w-5xl space-y-8">

            <div>
                <h1 className="page-title">
                    My Reports
                </h1>

                <p className="page-description">
                    Browse and review your previously submitted daily reports.
                </p>
            </div>

            {/* Filter */}

            <section className="card">

                <div className="card-header">

                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Filter Reports
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Select a specific date to view your report.
                    </p>

                </div>

                <div className="card-body">

                    <div className="flex flex-col gap-4 md:flex-row md:items-end">

                        <div className="flex-1">

                            <label className="label">
                                Report Date
                            </label>

                            <div className="relative">

                                <HiOutlineCalendarDays
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={20}
                                />

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        setDate(e.target.value)
                                    }
                                    className="input pl-12"
                                />

                            </div>

                        </div>

                        <button
                            onClick={() => setDate("")}
                            className="btn-secondary"
                        >
                            Clear Filter
                        </button>

                    </div>

                </div>

            </section>

            {/* Reports */}

            <section className="card">

                <div className="card-header">

                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        📝 Report History
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Browse your previous daily work reports.
                    </p>

                </div>

                {isLoading ? (

                    <div className="flex h-56 items-center justify-center">

                        <p className="text-slate-500 dark:text-slate-400">
                            Loading reports...
                        </p>

                    </div>

                ) : data?.length ? (

                    <div className="space-y-5 p-6">

                        {data.map((report: any) => (

                            <div
                                key={report.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
                            >

                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                                        Daily Report
                                    </span>

                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(
                                            report.reportDate
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                timeZone:
                                                    "Asia/Kolkata",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}
                                    </span>

                                </div>

                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                                    {report.description}
                                </p>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="flex h-72 flex-col items-center justify-center px-6 text-center">

                        <div className="text-6xl">
                            📄
                        </div>

                        <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
                            No Reports Found
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                            {date
                                ? "There are no reports for the selected date."
                                : "You haven't submitted any reports yet."}
                        </p>

                    </div>

                )}

            </section>

        </div>
    );
}