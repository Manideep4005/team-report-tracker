import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { parseCookie } from "cookie";

const SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends VercelRequest {
    userId?: string;
}

export function authenticate(
    req: AuthRequest,
    res: VercelResponse
): boolean {
    let token: string | undefined = req.cookies?.token;

    if (!token && req.headers.cookie) {
        try {
            const parsed = parseCookie(req.headers.cookie);
            token = parsed.token;
        } catch (err) {
            console.error("Failed to parse cookie header:", err);
        }
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return false;
    }

    try {
        const decoded = jwt.verify(token, SECRET) as {
            userId?: string;
            id?: string;
        };

        const userId = decoded.userId || decoded.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Invalid Token Payload",
            });
            return false;
        }

        req.userId = userId;
        return true;
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
        return false;
    }
}