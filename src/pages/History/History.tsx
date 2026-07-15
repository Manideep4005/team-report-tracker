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
        <div className="space-y-8">



            <div className="mt-4 flex gap-3">

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <button
                    onClick={() => setDate("")}
                    className="rounded-xl bg-slate-700 px-5 text-white hover:bg-slate-600"
                >
                    Clear
                </button>

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900">

                <div className="border-b border-slate-700 px-6 py-4">

                    <h2 className="text-lg font-semibold text-white">
                        My Report
                    </h2>

                </div>

                {isLoading ? (

                    <div className="p-6 text-slate-400">
                        Loading...
                    </div>

                ) : data && data.length > 0 ? (

                    <div className="space-y-4 p-6">

                        {data.map((report: any) => (
                            <div
                                key={report.id}
                                className="rounded-xl border border-slate-700 bg-[#0f172a] p-5"
                            >
                                <p className="mb-3 text-sm text-slate-500">
                                    {new Date(report.reportDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>

                                <p className="whitespace-pre-wrap leading-7 text-slate-300">
                                    {report.description}
                                </p>
                            </div>
                        ))}

                    </div>

                ) : (

                    <div className="p-8 text-center text-slate-500">
                        No report found for the selected date.
                    </div>

                )}

            </div>

        </div>
    );
}