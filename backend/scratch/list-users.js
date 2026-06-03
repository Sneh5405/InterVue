const prisma = require('../src/config/prisma');

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users in DB:");
    console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name })));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
