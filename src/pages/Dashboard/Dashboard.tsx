// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//     getDashboard,
//     saveReport,
//     getSummary,
// } from "../../services/report";

// interface DashboardResponse {
//     stats: {
//         submitted: number;
//         pending: number;
//         totalMembers: number;
//         completion: number;
//     };

//     reports: {
//         id: string;
//         description: string;
//         createdAt: string;
//         user: {
//             name: string;
//             email: string;
//         };
//     }[];

//     myReport: {
//         id: string;
//         description: string;
//     } | null;

//     teamStatus: {
//         id: string;
//         name: string;
//         email: string;
//         submitted: boolean;
//     }[];
// }

// export default function Dashboard() {
//     const queryClient = useQueryClient();

//     const { data, isLoading } = useQuery<DashboardResponse>({
//         queryKey: ["dashboard"],
//         queryFn: async () => {
//             const response = await getDashboard();
//             return response.data;
//         },
//     });

//     const [description, setDescription] = useState("");

//     const reportMutation = useMutation({
//         mutationFn: saveReport,

//         onSuccess: () => {
//             queryClient.invalidateQueries({
//                 queryKey: ["dashboard"],
//             });

//             alert("Report saved successfully.");
//         },
//     });

//     async function handleSave() {
//         if (!description.trim()) {
//             alert("Please enter today's work.");
//             return;
//         }

//         reportMutation.mutate(description);
//     }

//     async function handleSummary() {
//         try {
//             const response = await getSummary();

//             await navigator.clipboard.writeText(response.data);

//             alert("Team summary copied.");
//         } catch {
//             alert("Unable to generate summary.");
//         }
//     }

//     if (isLoading) {
//         return (
//             <div className="flex h-60 items-center justify-center text-slate-400">
//                 Loading dashboard...
//             </div>
//         );
//     }

//     const reportText =
//         description || data?.myReport?.description || "";

//     return (
//         <div className="space-y-6 lg:space-y-8">

//             {/* Stats */}

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//                 <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900 p-5 lg:p-6">
//                     <p className="text-sm text-slate-400">
//                         Submitted Today
//                     </p>

//                     <h2 className="mt-3 text-3xl font-bold text-green-400 lg:text-4xl">
//                         {data?.stats.submitted}
//                     </h2>

//                     <p className="mt-2 text-sm text-slate-500">
//                         Reports Submitted
//                     </p>
//                 </div>

//                 <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900 p-5 lg:p-6">
//                     <p className="text-sm text-slate-400">
//                         Pending Today
//                     </p>

//                     <h2 className="mt-3 text-3xl font-bold text-red-400 lg:text-4xl">
//                         {data?.stats.pending}
//                     </h2>

//                     <p className="mt-2 text-sm text-slate-500">
//                         Members Pending
//                     </p>
//                 </div>

//                 <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900 p-5 lg:p-6">
//                     <p className="text-sm text-slate-400">
//                         Total Members
//                     </p>

//                     <h2 className="mt-3 text-3xl font-bold text-blue-400 lg:text-4xl">
//                         {data?.stats.totalMembers}
//                     </h2>

//                     <p className="mt-2 text-sm text-slate-500">
//                         Active Users
//                     </p>
//                 </div>

//                 <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900 p-5 lg:p-6">
//                     <p className="text-sm text-slate-400">
//                         Completion
//                     </p>

//                     <h2 className="mt-3 text-3xl font-bold text-cyan-400 lg:text-4xl">
//                         {data?.stats.completion}%
//                     </h2>

//                     <p className="mt-2 text-sm text-slate-500">
//                         Team Progress
//                     </p>
//                 </div>

//             </div>

//             {/* My Report */}

//             <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900">

//                 <div className="border-b border-slate-700 px-5 py-4 lg:px-6">

//                     <h2 className="text-lg font-semibold text-white lg:text-xl">
//                         Today's Report
//                     </h2>

//                     <p className="mt-1 text-sm text-slate-400">
//                         Submit or update today's work report.
//                     </p>

//                 </div>

//                 <div className="p-5 lg:p-6">

//                     <textarea
//                         rows={7}
//                         value={reportText}
//                         onChange={(e) => setDescription(e.target.value)}
//                         placeholder="Describe what you worked on today..."
//                         className="min-h-[200px] w-full rounded-xl border border-slate-700 bg-[#0f172a] p-4 text-slate-200 outline-none transition focus:border-blue-500"
//                     />

//                     <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">

//                         <button
//                             onClick={handleSave}
//                             disabled={reportMutation.isPending}
//                             className="w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
//                         >
//                             {reportMutation.isPending
//                                 ? "Saving..."
//                                 : data?.myReport
//                                     ? "Update Report"
//                                     : "Submit Report"}
//                         </button>

//                     </div>

//                 </div>

//             </div>

//             {/* Pending & Reports */}

//             <div className="grid gap-6 lg:grid-cols-2">

//                 {/* Pending Members */}

//                 <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900">

//                     <div className="border-b border-slate-700 px-5 py-4 lg:px-6">

//                         <h3 className="text-lg font-semibold text-white">
//                             Pending Submission
//                         </h3>

//                     </div>

//                     <div className="divide-y divide-slate-800">

//                         {data?.teamStatus
//                             .filter((m) => !m.submitted)
//                             .map((member) => (
//                                 <div
//                                     key={member.id}
//                                     className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6"
//                                 >

//                                     <div className="min-w-0">

//                                         <p className="font-medium text-white">
//                                             {member.name}
//                                         </p>

//                                         <p className="truncate text-sm text-slate-500">
//                                             {member.email}
//                                         </p>

//                                     </div>

//                                     <span className="w-fit rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
//                                         Pending
//                                     </span>

//                                 </div>
//                             ))}

//                         {data?.teamStatus.filter((m) => !m.submitted).length === 0 && (
//                             <div className="px-6 py-8 text-center text-green-400">
//                                 🎉 Everyone has submitted today's report.
//                             </div>
//                         )}
//                     </div>
//                 </div>                {/* Today's Reports */}

//                 <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900">

//                     <div className="border-b border-slate-700 px-5 py-4 lg:px-6">

//                         <h3 className="text-lg font-semibold text-white">
//                             Today's Reports
//                         </h3>

//                     </div>

//                     <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800">

//                         {data?.reports.map((report) => (
//                             <div
//                                 key={report.id}
//                                 className="px-5 py-5 lg:px-6"
//                             >

//                                 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

//                                     <div className="min-w-0 flex-1">

//                                         <p className="font-semibold text-white">
//                                             {report.user.name}
//                                         </p>

//                                         <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
//                                             {report.description}
//                                         </p>

//                                     </div>

//                                     <span className="w-fit rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
//                                         Submitted
//                                     </span>

//                                 </div>

//                             </div>
//                         ))}

//                         {data?.reports.length === 0 && (
//                             <div className="px-6 py-8 text-center text-slate-500">
//                                 No reports submitted today.
//                             </div>
//                         )}

//                     </div>

//                 </div>

//             </div>

//             {/* Team Summary */}

//             <div className="rounded-xl lg:rounded-2xl border border-slate-700 bg-slate-900">

//                 <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">

//                     <div>

//                         <h2 className="text-lg font-semibold text-white lg:text-xl">
//                             Daily Team Summary
//                         </h2>

//                         <p className="mt-1 text-sm text-slate-400">
//                             Generate today's summary and copy it in one click.
//                         </p>

//                     </div>

//                     <button
//                         onClick={handleSummary}
//                         className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
//                     >
//                         Copy Summary
//                     </button>

//                 </div>

//             </div>

//         </div>
//     );
// }

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getDashboard,
    getSummary,
    saveReport,
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

            alert("Summary copied.");
        } catch {
            alert("Unable to copy summary.");
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

    const reportText =
        description || data?.myReport?.description || "";

    const submitted =
        data?.stats.submitted ?? 0;

    const total =
        data?.stats.totalMembers ?? 0;

    const progress =
        total === 0
            ? 0
            : Math.round((submitted / total) * 100);

    const greeting = (() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    })();

    return (
        <div className="space-y-5">

            {/* Greeting */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-white">
                            👋 {greeting}
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Let's see today's team progress.
                        </p>

                    </div>

                    <div className="w-full md:w-72">

                        <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm text-slate-400">
                                Today's Progress
                            </span>

                            <span className="text-sm font-semibold text-white">
                                {progress}%
                            </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                            <div
                                style={{
                                    width: `${progress}%`,
                                }}
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                            />

                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            {submitted} of {total} members submitted today
                        </p>

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
                        value={reportText}
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
                        className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
                    >
                        📋 Copy Summary
                    </button>

                </div>

            </section></div>
    );
}