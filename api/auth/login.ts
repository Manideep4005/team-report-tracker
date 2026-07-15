import prisma from "../../lib/prisma";

import bcrypt from "bcryptjs";

import { generateToken } from "../../lib/jwt";

export default async function handler(

    req: any,

    res: any

) {

    if (req.method !== "POST") {

        return res.status(405).end();

    }

    const {

        email,

        password,

    } = req.body;

    const user = await prisma.user.findUnique({

        where: {

            email,

        },

    });

    if (!user) {

        return res.status(401).json({

            success: false,

        });

    }

    const ok = await bcrypt.compare(

        password,

        user.password

    );

    if (!ok) {

        return res.status(401).json({

            success: false,

        });

    }

    const token = generateToken(user.id);

    res.setHeader(

        "Set-Cookie",

        `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`

    );

    return res.json({

        success: true,

        user: {

            id: user.id,

            name: user.name,

            email: user.email,

        },

    });

}