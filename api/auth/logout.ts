import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed",
        });
    }

    res.setHeader(
        "Set-Cookie",
        "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return res.json({
        success: true,
    });
}