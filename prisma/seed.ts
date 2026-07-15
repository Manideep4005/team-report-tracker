import prisma from "../api/lib/prisma";
import { hashPassword } from "../api/lib/password";

async function main() {

    const password = await hashPassword("test123");

    const users = [

        {
            name: "Manideep",
            email: "manideep@test.com",
        },

        {
            name: "Vijay",
            email: "vijay@test.com",
        },

        {
            name: "Raghu DP",
            email: "raghu@test.com",
        },

        {
            name: "Ajay",
            email: "ajay@test.com",
        },

    ];

    for (const user of users) {

        await prisma.user.upsert({

            where: {
                email: user.email,
            },

            update: {},

            create: {

                ...user,

                password,

            },

        });

    }

    console.log("Seed completed");
}

main()
    .catch(console.error)
    .finally(async () => {

        await prisma.$disconnect();

    });