import type { VercelResponse } from "@vercel/node";

import prisma from "../../lib/prisma";

import {
    authenticate,
    AuthRequest,
} from "../../middleware/auth";

export default async function handler(
    req: AuthRequest,
    res: VercelResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed",
        });
    }

    if (!authenticate(req, res))
        return;

    if (!req.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const user = await prisma.user.findUnique({

        where: {
            id: req.userId,
        },

        select: {

            id: true,

            name: true,

            email: true,

        },

    });

    return res.json(user);

}