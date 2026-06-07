const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.interviewQuestion.upsert({
        where: {
            interviewId_questionId: {
                interviewId: 8,
                questionId: 5
            }
        },
        update: {},
        create: {
            interviewId: 8,
            questionId: 5,
            order: 1
        }
    });
    console.log("Question 5 added to Interview 8 successfully!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
