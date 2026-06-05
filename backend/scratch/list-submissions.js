const prisma = require('../src/config/prisma');

async function main() {
    const submissions = await prisma.submission.findMany({
        orderBy: { id: 'desc' },
        take: 10
    });
    console.log("Last 10 Submissions in DB:");
    console.log(JSON.stringify(submissions, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
