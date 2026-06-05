const prisma = require('../src/config/prisma');

async function main() {
    const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public'
    `;
    console.log("Tables in DB:", tables);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
