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
        <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-0">


            {/* Filter */}

            <section className="card p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-end">

                    <div className="flex-1">

                        <label className="label">
                            Report Date
                        </label>

                        <div className="relative">

                            <HiOutlineCalendarDays
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                        disabled={!date}
                        className="btn-secondary h-11 w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Clear
                    </button>

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

                    <div className="space-y-5 p-4 sm:p-6">

                        {data.map((report: any) => (

                            <article
                                key={report.id}
                                className="rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:border-l-blue-500 dark:bg-slate-900"
                            >

                                <div className="mb-4 flex items-center gap-2">

                                    <HiOutlineCalendarDays
                                        size={18}
                                        className="text-blue-600 dark:text-blue-400"
                                    />

                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">

                                        {new Date(report.reportDate).toLocaleDateString(
                                            "en-IN",
                                            {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                timeZone: "Asia/Kolkata",
                                            }
                                        )}

                                    </h3>

                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-800 mb-4" />

                                <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700 dark:text-slate-300">

                                    {report.description}

                                </p>

                            </article>

                        ))}

                    </div>

                ) : (

                    <div className="flex h-64 flex-col items-center justify-center px-4 text-center sm:h-72 sm:px-6">

                        <div className="text-5xl sm:text-6xl">
                            📄
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white sm:mt-5 sm:text-xl">
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