import { useEffect, useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
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

interface SummaryItem {
    name: string;
    description: string;
}

export default function Dashboard() {
    const queryClient = useQueryClient();

    const { data, isLoading } =
        useQuery<DashboardResponse>({
            queryKey: ["dashboard"],
            queryFn: async () => {
                const response =
                    await getDashboard();

                return response.data;
            },
        });

    const [description, setDescription] =
        useState("");

    const [summaryLoading, setSummaryLoading] =
        useState(false);

    useEffect(() => {
        if (
            data?.myReport &&
            description === ""
        ) {
            setDescription(
                data.myReport.description
            );
        }
    }, [data, description]);

    const reportMutation = useMutation({
        mutationFn: saveReport,

        onSuccess: (response) => {
            setDescription(
                response.data.description
            );

            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            });

            toast.success(
                "Report saved successfully."
            );
        },
    });

    async function handleSave() {
        const text = description.trim();

        if (!text) {
            toast.warning(
                "Please enter today's work."
            );
            return;
        }

        reportMutation.mutate(text);
    }

    const handleSummary = async () => {
        setSummaryLoading(true);

        try {
            const response = await getSummary();

            const summary: SummaryItem[] = response.data;

            const text = summary
                .map(
                    (item) =>
                        `${item.name}:\n${item.description}`
                )
                .join("\n\n");

            await navigator.clipboard.writeText(text);

            toast.success("Summary copied successfully.");
        } catch {
            toast.error("Unable to generate summary.");
        } finally {
            setSummaryLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                    Loading dashboard...
                </p>
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
            : Math.round(
                (submitted / total) * 100
            );

    return (
        <div className="space-y-6 md:space-y-8">


            {/* Today's Progress */}

            <section className="card">

                <div className="card-body">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                                Today's Progress
                            </h2>

                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                {submitted} of {total}
                                {" "}
                                team members have
                                submitted today's
                                report.
                            </p>

                        </div>

                        <div className="w-full lg:w-80">

                            <div className="mb-2 flex items-center justify-between">

                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Completion
                                </span>

                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {progress}%
                                </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">

                                <div
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* Stats */}

            <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

                <div className="card">
                    <div className="card-body !p-4 sm:!p-6">
                        <p className="text-2xl font-bold text-emerald-500 sm:text-3xl">
                            {data?.stats.submitted}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">
                            Submitted
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body !p-4 sm:!p-6">
                        <p className="text-2xl font-bold text-red-500 sm:text-3xl">
                            {data?.stats.pending}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">
                            Pending
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body !p-4 sm:!p-6">
                        <p className="text-2xl font-bold text-cyan-500 sm:text-3xl">
                            {data?.stats.totalMembers}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">
                            Members
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body !p-4 sm:!p-6">
                        <p className="text-2xl font-bold text-blue-500 sm:text-3xl">
                            {data?.stats.completion}%
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">
                            Completion
                        </p>
                    </div>
                </div>

            </section>

            {/* Today's Report */}

            <section className="card">

                <div className="card-header">

                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        📝 Today's Report
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Write what you've completed today.
                    </p>

                </div>

                <div className="card-body">

                    <textarea
                        rows={7}
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Completed login page, fixed API bugs, deployed frontend..."
                        className="input min-h-[140px] resize-none sm:min-h-[180px]"
                    />

                    <div className="mt-4 flex justify-end sm:mt-5">

                        <button
                            onClick={handleSave}
                            disabled={reportMutation.isPending}
                            className="btn-primary w-full sm:w-auto"
                        >
                            {reportMutation.isPending
                                ? "Saving..."
                                : "Save Report"}
                        </button>

                    </div>

                </div>

            </section>

            {/* Team Status + Latest Reports */}

            <section className="grid gap-5 xl:grid-cols-2 xl:gap-6">

                {/* Team Status */}

                <div className="card">

                    <div className="card-header">

                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            👥 Team Status
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Today's submission status
                        </p>

                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">

                        {data?.teamStatus.map((member) => (

                            <div
                                key={member.id}
                                className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
                            >

                                <div className="flex min-w-0 items-center gap-3">

                                    <div
                                        className={`h-3 w-3 shrink-0 rounded-full ${member.submitted
                                            ? "bg-emerald-500"
                                            : "bg-red-500"
                                            }`}
                                    />

                                    <div className="min-w-0">

                                        <p className="truncate font-medium text-slate-900 dark:text-white">
                                            {member.name}
                                        </p>

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {member.submitted
                                                ? "Submitted"
                                                : "Pending"}
                                        </p>

                                    </div>

                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${member.submitted
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
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

                <div className="card">

                    <div className="card-header">

                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            📋 Latest Reports
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Today's submissions
                        </p>

                    </div>

                    <div className="max-h-[500px] divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">

                        {data?.reports.length === 0 && (

                            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                                No reports submitted today.
                            </div>

                        )}

                        {data?.reports.map((report) => (

                            <div
                                key={report.id}
                                className="px-4 py-4 sm:px-6 sm:py-5"
                            >

                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white sm:h-10 sm:w-10 sm:text-base">

                                            {report.user.name
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                {report.user.name}
                                            </p>

                                            <p className="text-xs text-slate-500 dark:text-slate-400">
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

                                    <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                        Submitted
                                    </span>

                                </div>

                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300 sm:leading-7">
                                    {report.description}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>

            {/* Daily Summary */}

            <section className="card">

                <div className="card-body">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-5">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                📄 Daily Team Summary
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Generate a formatted summary of today's reports
                                and copy it to your clipboard for sharing with
                                the team.
                            </p>

                        </div>

                        <button
                            onClick={handleSummary}
                            disabled={summaryLoading}
                            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[180px]"
                        >
                            {summaryLoading ? (
                                <span className="flex items-center justify-center gap-2">

                                    <svg
                                        className="h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="opacity-25"
                                        />

                                        <path
                                            fill="currentColor"
                                            className="opacity-75"
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

                </div>

            </section>

        </div>
    );
}