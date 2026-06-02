const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function test() {
    const userId = 1;
    const otp = '123456';
    const otpHash = await bcrypt.hash(otp, 10);
    
    await prisma.emailOtp.upsert({
        where: { userId },
        update: { otpHash, expiresAt: new Date(Date.now() + 100000) },
        create: { userId, otpHash, expiresAt: new Date(Date.now() + 100000) }
    });
    
    const res = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp, newPassword: 'newpassword123' })
    });
    
    console.log(await res.json());
}

test().catch(console.error).finally(()=>prisma.$disconnect());
