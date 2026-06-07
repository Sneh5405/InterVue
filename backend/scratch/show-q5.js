const prisma = require('../src/config/prisma');

async function main() {
    const q = await prisma.question.findUnique({ where: { id: 5 } });
    console.log("Question 5 details:");
    console.log(JSON.stringify(q, null, 2));
}

main().finally(() => prisma.$disconnect());
