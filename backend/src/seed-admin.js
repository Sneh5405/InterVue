const bcrypt = require("bcrypt");
const prisma = require("./config/prisma");

async function main() {
    const EMAIL = "admin@gmail.com";
    const PASSWORD = "admin";
    const NAME = "Admin";
    const ROLE = "HR";

    console.log("Seeding Admin User:", EMAIL);

    try {
        // Check if admin user already exists
        const existing = await prisma.user.findUnique({
            where: { email: EMAIL }
        });

        if (existing) {
            console.log("Admin user already exists. Updating password...");
            const hashedPassword = await bcrypt.hash(PASSWORD, 10);
            await prisma.user.update({
                where: { email: EMAIL },
                data: {
                    password: hashedPassword,
                    role: ROLE,
                    emailVerified: true,
                    status: "ACTIVE"
                }
            });
            console.log("Admin user updated successfully.");
        } else {
            const hashedPassword = await bcrypt.hash(PASSWORD, 10);
            const user = await prisma.user.create({
                data: {
                    email: EMAIL,
                    password: hashedPassword,
                    name: NAME,
                    role: ROLE,
                    emailVerified: true,
                    status: "ACTIVE"
                }
            });
            console.log("Admin user created successfully. ID:", user.id);
        }
    } catch (e) {
        console.error("Error seeding admin:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
