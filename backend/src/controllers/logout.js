const prisma = require("../config/prisma");

const logoutController = async (req, res) => {
    let refreshToken = null;
    if (req.cookies) {
        refreshToken = req.cookies.refreshToken;
    }

    try {
        if (refreshToken) {
            await prisma.refreshToken.delete({
                where: { token: refreshToken }
            });
        }
    } catch (err) {
        // Build robustly: if token not found, it's already "logged out"
        if (err.code !== 'P2025') { // P2025 = Record to delete does not exist
            console.error("Logout Error:", err);
        }
    }

    res.clearCookie('accessToken', { httpOnly: true, secure: false, sameSite: 'lax' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'lax' });
    res.sendStatus(204); // No content
};

module.exports = logoutController;
