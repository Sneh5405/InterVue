const { getQuestions } = require('../src/controllers/question');
const prisma = require('../src/config/prisma');

async function testFilterForUser(userId, role) {
    const req = {
        query: { page: 1, limit: 10 },
        user: { id: userId, role }
    };
    
    let responseData = null;
    const res = {
        json: (data) => {
            responseData = data;
        },
        status: (code) => ({
            json: (data) => {
                console.error("Error response from controller:", code, data);
            }
        })
    };
    
    await getQuestions(req, res);
    
    console.log(`\n--- Questions fetched for User ID ${userId} (Role: ${role}) ---`);
    if (responseData) {
        console.log(`Total questions: ${responseData.totalCount}`);
        console.log(`Returned list:`, responseData.questions.map(q => ({
            id: q.id,
            text: q.text,
            createdById: q.createdById,
            createdByName: q.createdBy?.name
        })));
    } else {
        console.log("No response returned.");
    }
}

async function main() {
    // 1. Clear prisma cache pattern before test
    const cache = require('../src/utils/cache');
    await cache.clearPattern("questions:list:*");

    // 2. Test for User ID 3 (INTERVIEWER)
    await testFilterForUser(3, 'INTERVIEWER');

    // 3. Test for User ID 1 (HR)
    await testFilterForUser(1, 'HR');
    
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
