import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function generateToken(userId: string) {
    return jwt.sign(
        { userId },
        SECRET,
        {
            expiresIn: "7d",
        }
    );
}

export function verifyToken(token: string) {
    return jwt.verify(token, SECRET);
}