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
        <div className="mx-auto max-w-5xl space-y-5">

            {/* Filter */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

                <div className="flex flex-col gap-4 md:flex-row md:items-end">

                    <div className="flex-1">

                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Report Date
                        </label>

                        <div className="relative">

                            <HiOutlineCalendarDays
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                size={20}
                            />

                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-blue-500"
                            />

                        </div>

                    </div>

                    <button
                        onClick={() => setDate("")}
                        className="rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
                    >
                        Clear Filter
                    </button>

                </div>

            </div>

            {/* Reports */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900">

                <div className="border-b border-slate-800 px-5 py-4">

                    <h2 className="text-lg font-semibold text-white">
                        📝 My Reports
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Browse your previous daily work reports.
                    </p>

                </div>

                {isLoading ? (

                    <div className="flex h-56 items-center justify-center text-slate-400">
                        Loading reports...
                    </div>

                ) : data?.length ? (

                    <div className="space-y-4 p-4 sm:p-5">

                        {data.map((report: any) => (

                            <div
                                key={report.id}
                                className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700"
                            >

                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                    <span className="rounded-full bg-blue-600/15 px-3 py-1 text-xs font-semibold text-blue-400 w-fit">
                                        Daily Report
                                    </span>

                                    <span className="text-xs text-slate-500 sm:text-sm">
                                        {new Date(
                                            report.reportDate
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}
                                    </span>

                                </div>

                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                                    {report.description}
                                </p>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="flex h-64 flex-col items-center justify-center px-6 text-center">

                        <div className="text-6xl">
                            📄
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-white">
                            No Reports Found
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            {date
                                ? "There are no reports for the selected date."
                                : "You haven't submitted any reports yet."}
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}