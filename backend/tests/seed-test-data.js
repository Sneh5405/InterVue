const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log("=== Seeding Performance Test Data ===");

    // Clean up existing data to ensure a fresh test environment
    console.log("Cleaning up database...");
    try {
        await prisma.submission.deleteMany();
        await prisma.assessmentAnswer.deleteMany();
        await prisma.assessmentCandidate.deleteMany();
        await prisma.assessmentQuestion.deleteMany();
        await prisma.assessment.deleteMany();
        await prisma.interviewQuestion.deleteMany();
        await prisma.interview.deleteMany();
        await prisma.emailOtp.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.user.deleteMany();
        await prisma.question.deleteMany();
    } catch (err) {
        console.log("Cleanup warnings (expected if DB empty):", err.message);
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Create HR User
    console.log("Creating HR User...");
    const hr = await prisma.user.create({
        data: {
            email: "hr@intervue.test",
            name: "Test HR Admin",
            role: "HR",
            password: hashedPassword,
            emailVerified: true
        }
    });

    // 2. Create Interviewer User
    console.log("Creating Interviewer User...");
    const interviewer = await prisma.user.create({
        data: {
            email: "interviewer@intervue.test",
            name: "Test Interviewer",
            role: "INTERVIEWER",
            password: hashedPassword,
            emailVerified: true
        }
    });

    // 3. Create 1000 Candidates
    console.log("Creating 1000 Candidates (Bulk)...");
    const candidatesData = [];
    for (let i = 1; i <= 1000; i++) {
        candidatesData.push({
            email: `candidate${i}@intervue.test`,
            name: `Test Candidate ${i}`,
            role: "INTERVIEWEE",
            password: hashedPassword,
            emailVerified: true
        });
    }
    await prisma.user.createMany({ data: candidatesData });

    // Fetch the created candidates to get their IDs
    const candidates = await prisma.user.findMany({
        where: { email: { startsWith: "candidate" } },
        orderBy: { id: "asc" }
    });
    console.log(`Successfully created ${candidates.length} candidates.`);

    // 4. Create 1000 Interview Rooms
    console.log("Creating 1000 Interview Rooms (Bulk)...");
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    const interviewsData = [];
    for (let i = 0; i < 1000; i++) {
        interviewsData.push({
            startTime,
            endTime,
            status: "SCHEDULED",
            hrId: hr.id,
            interviewerId: interviewer.id,
            intervieweeId: candidates[i].id,
            interviewerAccepted: true,
            intervieweeAccepted: true
        });
    }
    await prisma.interview.createMany({ data: interviewsData });

    const interviews = await prisma.interview.findMany({
        orderBy: { id: "asc" }
    });
    console.log(`Successfully created ${interviews.length} interviews.`);

    // 5. Create Questions
    console.log("Creating Test Questions...");
    const questionsData = [];
    for (let i = 1; i <= 5; i++) {
        questionsData.push({
            text: `Performance Test Coding Problem ${i}: Write a function that returns the square of the input.`,
            type: "CODE",
            difficulty: "MEDIUM",
            tags: ["performance", "test"],
            createdById: hr.id,
            testCases: JSON.stringify([
                { input: "2", output: "4" },
                { input: "5", output: "25" }
            ])
        });
    }
    await prisma.question.createMany({ data: questionsData });
    const questions = await prisma.question.findMany({
        where: { createdById: hr.id },
        orderBy: { id: "asc" }
    });

    // 6. Link first question to all 1000 interviews
    console.log("Linking questions to interviews...");
    const interviewQuestionsData = [];
    for (let i = 0; i < 1000; i++) {
        interviewQuestionsData.push({
            interviewId: interviews[i].id,
            questionId: questions[0].id,
            order: 1
        });
    }
    await prisma.interviewQuestion.createMany({ data: interviewQuestionsData });

    // 7. Create Assessment for Scale Testing
    console.log("Creating Assessment and Candidate Enrollments...");
    const assessment = await prisma.assessment.create({
        data: {
            title: "Performance Scalability OA",
            description: "Scale test assessment with 5 code questions",
            duration: 60,
            hrId: hr.id
        }
    });

    // Link all 5 questions to this assessment
    const assessmentQuestionsData = questions.map((q, idx) => ({
        assessmentId: assessment.id,
        questionId: q.id,
        order: idx + 1,
        points: 20
    }));
    await prisma.assessmentQuestion.createMany({ data: assessmentQuestionsData });

    // Enroll all 1000 candidates to the assessment
    const assessmentCandidatesData = candidates.map(c => ({
        assessmentId: assessment.id,
        candidateId: c.id,
        status: "ACCEPTED"
    }));
    await prisma.assessmentCandidate.createMany({ data: assessmentCandidatesData });

    console.log("=== Seeding Completed Successfully ===");
    process.exit(0);
}

main().catch(err => {
    console.error("Seeding Failed:", err);
    process.exit(1);
});
