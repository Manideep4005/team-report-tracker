import type { VercelResponse } from "@vercel/node";
import prisma from "../../lib/prisma";
import { authenticate, AuthRequest } from "../../middleware/auth";

export default async function handler(
    req: AuthRequest,
    res: VercelResponse
) {
    if (req.method !== "GET")
        return res.status(405).end();

    if (!authenticate(req, res))
        return;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const users = await prisma.user.findMany({
        orderBy: {
            name: "asc",
        },
    });

    const reports = await prisma.workReport.findMany({
        where: {
            reportDate: {
                gte: start,
                lt: end,
            },
        },
        include: {
            user: true,
        },
    });

    let summary = "";

    users.forEach((user) => {
        const report = reports.find((r) => r.userId === user.id);

        summary += `${user.name}\n`;

        if (report) {
            summary += `${report.description}\n\n`;
        } else {
            summary += "Pending\n\n";
        }
    });

    return res.json({
        success: true,
        data: summary,
    });
}