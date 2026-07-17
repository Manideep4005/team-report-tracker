import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getDashboard,
    getSummary,
    saveReport,
} from "../../services/report";
import { toast } from "sonner";

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
    const [summaryLoading, setSummaryLoading] = useState(false);

    useEffect(() => {
        if (data?.myReport && !description) {
            setDescription(data.myReport.description);
        }
    }, [data]);

    const reportMutation = useMutation({
        mutationFn: saveReport,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            });

            toast.success("Report saved successfully.");
        },
    });

    async function handleSave() {
        const text = description.trim();

        if (!text) {
            toast.warning("Please enter today's work.");
            return;
        }

        reportMutation.mutate(text);
    }

    async function handleSummary() {
        try {
            setSummaryLoading(true);

            const response = await getSummary();

            await navigator.clipboard.writeText(response.data);

            toast.success("Team summary copied.");
        } catch {
            toast.error("Unable to copy summary.");
        } finally {
            setSummaryLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-slate-400">
                    Loading dashboard...
                </div>
            </div>
        );
    }



    const submitted =
        data?.stats.submitted ?? 0;

    const total =
        data?.stats.totalMembers ?? 0;

    const progress =
        total === 0
            ? 0
            : Math.round((submitted / total) * 100);



    return (
        <div className="space-y-5">


            {/* Today's Progress */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h2 className="text-xl font-semibold text-white">
                            Today's Progress
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {submitted} of {total} team members have submitted today's report.
                        </p>

                    </div>

                    <div className="w-full md:w-72">

                        <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm text-slate-400">
                                Completion
                            </span>

                            <span className="text-sm font-semibold text-white">
                                {progress}%
                            </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                            <div
                                style={{ width: `${progress}%` }}
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                            />

                        </div>

                    </div>

                </div>

            </section>

            {/* Stats */}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

                    <p className="text-3xl font-bold text-emerald-400">
                        {data?.stats.submitted}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Submitted
                    </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

                    <p className="text-3xl font-bold text-red-400">
                        {data?.stats.pending}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Pending
                    </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

                    <p className="text-3xl font-bold text-cyan-400">
                        {data?.stats.totalMembers}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Members
                    </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

                    <p className="text-3xl font-bold text-blue-400">
                        {data?.stats.completion}%
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Complete
                    </p>

                </div>

            </section>

            {/* Today's Report */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900">

                <div className="border-b border-slate-800 px-5 py-4">

                    <h2 className="text-lg font-semibold text-white">
                        📝 Today's Report
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Write what you've completed today.
                    </p>

                </div>

                <div className="p-5">

                    <textarea
                        rows={6}
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Completed login page, fixed API bugs, deployed frontend..."
                        className="min-h-[170px] w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none transition focus:border-blue-500"
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">

                        <button
                            onClick={handleSave}
                            disabled={reportMutation.isPending}
                            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                        >
                            {reportMutation.isPending
                                ? "Saving..."
                                : "Save Report"}
                        </button>

                    </div>

                </div>

            </section>

            {/* Team Status + Latest Reports */}

            <section className="grid gap-5 lg:grid-cols-2">                {/* Team Status */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900">

                    <div className="border-b border-slate-800 px-5 py-4">

                        <h2 className="text-lg font-semibold text-white">
                            👥 Team Status
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Today's submission status
                        </p>

                    </div>

                    <div className="divide-y divide-slate-800">

                        {data?.teamStatus.map((member) => (

                            <div
                                key={member.id}
                                className="flex items-center justify-between px-5 py-4"
                            >

                                <div className="flex items-center gap-3">

                                    <div
                                        className={`h-3 w-3 rounded-full ${member.submitted
                                            ? "bg-emerald-500"
                                            : "bg-red-500"
                                            }`}
                                    />

                                    <div>

                                        <p className="font-medium text-white">
                                            {member.name}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {member.submitted
                                                ? "Submitted"
                                                : "Pending"}
                                        </p>

                                    </div>

                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${member.submitted
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-red-500/15 text-red-400"
                                        }`}
                                >
                                    {member.submitted
                                        ? "Done"
                                        : "Pending"}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

                {/* Latest Reports */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900">

                    <div className="border-b border-slate-800 px-5 py-4">

                        <h2 className="text-lg font-semibold text-white">
                            📋 Latest Reports
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Today's submissions
                        </p>

                    </div>

                    <div className="max-h-[480px] divide-y divide-slate-800 overflow-y-auto">

                        {data?.reports.length === 0 && (

                            <div className="py-10 text-center text-slate-500">
                                No reports submitted today.
                            </div>

                        )}

                        {data?.reports.map((report) => (

                            <div
                                key={report.id}
                                className="px-5 py-4"
                            >

                                <div className="mb-2 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">

                                            {report.user.name
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>

                                        <div>

                                            <p className="text-sm font-semibold text-white">
                                                {report.user.name}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {new Date(
                                                    report.createdAt
                                                ).toLocaleTimeString(
                                                    "en-IN",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                                        Submitted
                                    </span>

                                </div>

                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                    {report.description}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>

            {/* Daily Summary */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900">

                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 className="text-lg font-semibold text-white">
                            📄 Daily Team Summary
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Ready to share with your team.
                        </p>

                    </div>

                    <button
                        onClick={handleSummary}
                        disabled={summaryLoading}
                        className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {summaryLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="h-4 w-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Generating...
                            </span>
                        ) : (
                            "📋 Copy Summary"
                        )}
                    </button>

                </div>

            </section></div>
    );
}