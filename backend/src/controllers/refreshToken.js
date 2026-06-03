const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { generateAccessToken, generateRefreshToken } = require("../tokens");

const refreshTokenController = async (req, res) => {
    let refreshToken = null;
    if (req.cookies) {
        refreshToken = req.cookies.refreshToken;
    }

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token is required" });
    }

    try {
        // 1. Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // 2. Check if it exists in DB (and verify user ownership)
        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!savedToken || savedToken.userId !== decoded.id) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        // 3. Token Rotation: Delete valid used token, issue new pair
        // Transaction to ensure atomicity
        const newAccessToken = generateAccessToken(savedToken.user);
        const newRefreshToken = generateRefreshToken(savedToken.user);

        await prisma.$transaction([
            prisma.refreshToken.delete({ where: { token: refreshToken } }),
            prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: savedToken.userId,
                    device: req.headers['user-agent'] || 'Unknown',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days match usually
                }
            })
        ]);

        const cookieOptions = {
            httpOnly: true,
            secure: false, // set to false for local HTTP development
            sameSite: 'lax',
        };

        res.cookie('accessToken', newAccessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.cookie('refreshToken', newRefreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            message: "Token refreshed successfully"
        });

    } catch (err) {
        console.error("Refresh Token Error:", err);
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};

module.exports = refreshTokenController;
