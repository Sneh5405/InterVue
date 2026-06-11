const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const { generateAccessToken, generateRefreshToken } = require("../tokens");

const googleRedirect = (req, res) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    const qs = new URLSearchParams(options);
    res.redirect(`${rootUrl}?${qs.toString()}`);
};

const googleCallback = async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.redirect("https://localhost:5173/login?error=no_auth_code");
    }

    try {
        // Exchange code for tokens
        const tokenUrl = "https://oauth2.googleapis.com/token";
        const values = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        };

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(values),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Token Exchange Error:", errBody);
            throw new Error("Failed to exchange code for tokens");
        }

        const { access_token } = await response.json();

        // Get user profile using access token
        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!profileResponse.ok) {
            throw new Error("Failed to fetch user profile");
        }

        const { email, name } = await profileResponse.json();

        if (!email) {
            return res.redirect("https://localhost:5173/login?error=email_not_provided");
        }

        // Upsert user in the database
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Register a new user
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    password: dummyPassword,
                    role: "INTERVIEWEE", // Default role
                    emailVerified: true,
                    status: "ACTIVE",
                },
            });
        }

        if (user.status === "BLOCKED") {
            return res.redirect("https://localhost:5173/login?error=account_blocked");
        }

        // Generate JWTs
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in DB
        await prisma.refreshToken.upsert({
            where: { userId: user.id },
            update: {
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
            create: {
                token: refreshToken,
                userId: user.id,
                device: req.headers["user-agent"] || "OAuth Client",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        // Set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: false, // set to false for local HTTP development
            sameSite: "lax",
        };

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // Redirect to login page on frontend with oauth success query parameters
        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        };

        res.redirect(`https://localhost:5173/login?oauth_success=true&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
    } catch (error) {
        console.error("OAuth Error:", error);
        res.redirect("https://localhost:5173/login?error=oauth_failed");
    }
};

module.exports = {
    googleRedirect,
    googleCallback,
};
