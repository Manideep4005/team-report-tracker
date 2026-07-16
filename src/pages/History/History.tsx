import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
        <div className="space-y-6 lg:space-y-8">

            {/* Filter */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-blue-500 sm:w-auto"
                />

                <button
                    onClick={() => setDate("")}
                    className="w-full rounded-xl bg-slate-700 px-5 py-3 font-medium text-white transition hover:bg-slate-600 sm:w-auto"
                >
                    Clear
                </button>

            </div>

            {/* History */}

            <div className="rounded-xl border border-slate-700 bg-slate-900 lg:rounded-2xl">

                <div className="border-b border-slate-700 px-5 py-4 lg:px-6">

                    <h2 className="text-lg font-semibold text-white lg:text-xl">
                        My Reports
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        View your previously submitted daily reports.
                    </p>

                </div>

                {isLoading ? (

                    <div className="flex h-40 items-center justify-center text-slate-400">
                        Loading reports...
                    </div>

                ) : data && data.length > 0 ? (

                    <div className="space-y-4 p-5 lg:p-6">

                        {data.map((report: any) => (

                            <div
                                key={report.id}
                                className="rounded-xl border border-slate-700 bg-[#0f172a] p-4 transition hover:border-slate-600 lg:p-5"
                            >

                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                    <h3 className="font-semibold text-white">
                                        Daily Work Report
                                    </h3>

                                    <span className="text-sm text-slate-500">
                                        {new Date(report.reportDate).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}
                                    </span>

                                </div>

                                <p className="whitespace-pre-wrap break-words leading-7 text-slate-300">
                                    {report.description}
                                </p>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="flex h-48 flex-col items-center justify-center px-6 text-center">

                        <div className="text-5xl">
                            📝
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-white">
                            No Reports Found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            {date
                                ? "No report was submitted for the selected date."
                                : "You haven't submitted any reports yet."}
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}