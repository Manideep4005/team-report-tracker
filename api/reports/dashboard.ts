import type { VercelResponse } from "@vercel/node";
import prisma from "../../lib/prisma";
import { authenticate, AuthRequest } from "../../middleware/auth";

export default async function handler(
  req: AuthRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
    });
  }

  if (!authenticate(req, res)) {
    return;
  }

  try {
    const userId = req.userId!;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const myReport = reports.find(
      (r) => r.userId === userId
    );

    const teamStatus = users.map((u) => {
      const hasSubmitted = reports.some((r) => r.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        submitted: hasSubmitted,
      };
    });

    return res.json({
      success: true,
      data: {
        stats: {
          submitted: reports.length,
          pending: users.length - reports.length,
          totalMembers: users.length,
          completion:
            users.length === 0
              ? 0
              : Math.round((reports.length / users.length) * 100),
        },
        reports,
        myReport,
        teamStatus,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
}