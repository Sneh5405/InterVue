const express = require("express");
const app = express();
const port = 3000;

const cors = require("cors");
const signupRoute = require("./routes/signup");
const authRoute = require("./routes/auth");
const verifyOtpRoute = require("./routes/verifyOtp");
const prisma = require("./config/prisma");

app.use(express.json());
app.use(cors());

app.use("/api", signupRoute);
app.use("/api", authRoute);
app.use("/api", verifyOtpRoute);
const adminRoute = require("./routes/admin");
app.use("/api/admin", adminRoute);
const interviewRoute = require("./routes/interview");
app.use("/api/interviews", interviewRoute);
const questionRoute = require("./routes/question");
app.use("/api/questions", questionRoute);
const submissionRoute = require("./routes/submission");
app.use("/api/submissions", submissionRoute);
const assessmentRoute = require("./routes/assessment");
app.use("/api/assessments", assessmentRoute);





const http = require("http");
const { initSocket } = require("./socket");

const server = http.createServer(app);
initSocket(server);

server.listen(port, "localhost", async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (e) {
        console.error("Database connection failed", e);
    }
    console.log(`Example app listening on port ${port}`);
});