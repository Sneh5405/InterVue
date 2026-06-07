const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const emails = ['candidate@intervue.com', 'interviewer@intervue.com', 'hr@intervue.com'];
    
    for (const email of emails) {
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                emailVerified: true
            }
        });
        console.log(`Updated password for ${email}`);
    }
    
    console.log("All test user passwords updated successfully to: password123");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
