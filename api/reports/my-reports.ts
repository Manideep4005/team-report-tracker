import type { VercelResponse } from "@vercel/node";
import prisma from "../../lib/prisma";
import { authenticate, AuthRequest } from "../../middleware/auth";

export default async function handler(
  req: AuthRequest,
  res: VercelResponse
) {
  if (!authenticate(req, res)) {
    return;
  }

  try {
    const userId = req.userId!;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const report = await prisma.workReport.findFirst({
      where: {
        userId: userId,
        reportDate: {
          gte: start,
          lt: end,
        },
      },
    });

    res.json({
      success: true,
      data: report,
    });
  } catch {
    res.status(500).json({
      success: false,
    });
  }
}