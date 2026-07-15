import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getDashboard,
    saveReport,
    getSummary,
} from "../../services/report";

interface DashboardResponse {
    stats: {
        submitted: number;
        pending: number;
        totalMembers: number;
        completion: number;
    };

    reports: {
        id: string;
        description: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
        };
    }[];

    myReport: {
        id: string;
        description: string;
    } | null;

    teamStatus: {
        id: string;
        name: string;
        email: string;
        submitted: boolean;
    }[];
}

export default function Dashboard() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<DashboardResponse>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const response = await getDashboard();
            return response.data;
        },
    });

    const [description, setDescription] = useState("");

    const reportMutation = useMutation({
        mutationFn: saveReport,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            });

            alert("Report saved successfully.");
        },
    });

    async function handleSave() {
        if (!description.trim()) {
            alert("Please enter today's work.");
            return;
        }

        reportMutation.mutate(description);
    }

    async function handleSummary() {
        try {
            const response = await getSummary();

            await navigator.clipboard.writeText(response.data);

            alert("Team summary copied.");
        } catch {
            alert("Unable to generate summary.");
        }
    }

    if (isLoading) {
        return (
            <div className="text-slate-300">
                Loading dashboard...
            </div>
        );
    }

    const reportText =
        description || data?.myReport?.description || "";
    return (
        <div className="space-y-8">

            {/* Stats */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Submitted Today
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-green-400">
                        {data?.stats.submitted}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Reports Submitted
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Pending Today
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-red-400">
                        {data?.stats.pending}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Members Pending
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Total Members
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-blue-400">
                        {data?.stats.totalMembers}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Active Users
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Completion
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-cyan-400">
                        {data?.stats.completion}%
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Team Progress
                    </p>
                </div>

            </div>

            {/* My Report */}

            <div className="rounded-2xl border border-slate-700 bg-slate-900">

                <div className="border-b border-slate-700 px-6 py-4">

                    <h2 className="text-xl font-semibold text-white">
                        Today's Report
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Submit or update today's work report.
                    </p>

                </div>

                <div className="p-6">

                    <textarea
                        rows={8}
                        value={reportText}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what you worked on today..."
                        className="w-full rounded-xl border border-slate-700 bg-[#0f172a] p-4 text-slate-200 outline-none transition focus:border-blue-500"
                    />

                    <div className="mt-5 flex justify-end">

                        <button
                            onClick={handleSave}
                            disabled={reportMutation.isPending}
                            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {reportMutation.isPending
                                ? "Saving..."
                                : data?.myReport
                                    ? "Update Report"
                                    : "Submit Report"}
                        </button>

                    </div>

                </div>

            </div>

            {/* Pending & Reports */}

            <div className="grid gap-8 lg:grid-cols-2">

                {/* Pending Members */}

                <div className="rounded-2xl border border-slate-700 bg-slate-900">

                    <div className="border-b border-slate-700 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            Pending Submission
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-800">

                        {data?.teamStatus
                            .filter((m) => !m.submitted)
                            .map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between px-6 py-4"
                                >
                                    <div>
                                        <p className="font-medium text-white">
                                            {member.name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {member.email}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                                        Pending
                                    </span>
                                </div>
                            ))}

                        {data?.teamStatus.filter((m) => !m.submitted).length === 0 && (
                            <div className="px-6 py-8 text-center text-green-400">
                                🎉 Everyone has submitted today's report.
                            </div>
                        )}

                    </div>

                </div>

                {/* Today's Reports */}

                <div className="rounded-2xl border border-slate-700 bg-slate-900">

                    <div className="border-b border-slate-700 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            Today's Reports
                        </h3>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800">

                        {data?.reports.map((report) => (
                            <div
                                key={report.id}
                                className="px-6 py-5"
                            >
                                <div className="flex items-start justify-between gap-4">

                                    <div className="flex-1">

                                        <p className="font-semibold text-white">
                                            {report.user.name}
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                            {report.description}
                                        </p>

                                    </div>

                                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                                        Submitted
                                    </span>

                                </div>
                            </div>
                        ))}

                        {data?.reports.length === 0 && (
                            <div className="px-6 py-8 text-center text-slate-500">
                                No reports submitted today.
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Team Summary */}

            <div className="rounded-2xl border border-slate-700 bg-slate-900">

                <div className="flex items-center justify-between px-6 py-5">

                    <div>

                        <h2 className="text-xl font-semibold text-white">
                            Daily Team Summary
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Generate today's summary and copy it in one click.
                        </p>

                    </div>

                    <button
                        onClick={handleSummary}
                        className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
                    >
                        Copy Summary
                    </button>

                </div>

            </div>

        </div>
    );
}