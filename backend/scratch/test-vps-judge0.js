const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const apiHost = process.env.JUDGE0_API_URL || "http://localhost:2358";
const authHeaders = {};

if (process.env.JUDGE0_AUTH_TOKEN) {
    authHeaders["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
}

const encodeBase64 = (str) => {
    if (!str) return "";
    return Buffer.from(str).toString("base64");
};

const decodeBase64 = (base64Str) => {
    if (!base64Str) return "";
    return Buffer.from(base64Str, "base64").toString("utf-8");
};

async function testConnection() {
    console.log(`[Test] Connecting to Judge0 at: ${apiHost}`);
    console.log(`[Test] Auth token set: ${process.env.JUDGE0_AUTH_TOKEN ? "YES (hidden)" : "NO"}`);
    
    // Step 1: Get Languages
    console.log("\n[1/3] Fetching language list...");
    const langRes = await fetch(`${apiHost}/languages`, { headers: authHeaders });
    if (!langRes.ok) {
        throw new Error(`Failed to fetch languages: ${langRes.status} ${langRes.statusText}`);
    }
    const languages = await langRes.json();
    console.log(`Successfully fetched ${languages.length} languages!`);
    
    // Pick python3 (ID 71) or javascript (ID 93) if available
    let languageId = 71; // Default Python 3 fallback
    const pyMatch = languages.find(l => l.name.toLowerCase().includes("python (3"));
    if (pyMatch) {
        languageId = pyMatch.id;
        console.log(`Using resolved language: ${pyMatch.name} (ID: ${languageId})`);
    } else {
        console.log(`Fallback to language ID: ${languageId}`);
    }

    // Step 2: Submit a simple Python code execution
    console.log("\n[2/3] Submitting test code execution...");
    const testCode = "import sys\nprint('Hello from InterVue VPS Judge0!')\nsys.stdout.flush()";
    
    const submissionBody = {
        source_code: encodeBase64(testCode),
        language_id: languageId,
        stdin: encodeBase64("")
    };

    const submitRes = await fetch(`${apiHost}/submissions?base64_encoded=true`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders
        },
        body: JSON.stringify(submissionBody)
    });

    if (!submitRes.ok) {
        const errText = await submitRes.text();
        throw new Error(`Failed to submit job: ${submitRes.status} - ${errText}`);
    }

    const { token } = await submitRes.json();
    if (!token) {
        throw new Error("No token returned from Judge0 submission!");
    }
    console.log(`Job queued successfully! Token: ${token}`);

    // Step 3: Poll for results
    console.log("\n[3/3] Polling execution result...");
    let attempts = 0;
    const maxAttempts = 10;
    let result = null;

    while (attempts < maxAttempts) {
        const pollRes = await fetch(`${apiHost}/submissions/${token}?base64_encoded=true`, {
            headers: authHeaders
        });

        if (!pollRes.ok) {
            throw new Error(`Poll failed: ${pollRes.status}`);
        }

        result = await pollRes.json();
        const statusId = result.status?.id;

        // statusId 1: In Queue, 2: Processing
        if (statusId !== 1 && statusId !== 2) {
            break;
        }

        console.log(`Still processing (status ID: ${statusId})...`);
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
    }

    if (attempts >= maxAttempts) {
        throw new Error("Polling timed out!");
    }

    console.log("\n--- Judge0 Execution Result ---");
    console.log(`Status: ${result.status?.description} (ID: ${result.status?.id})`);
    console.log(`Stdout: "${decodeBase64(result.stdout).trim()}"`);
    console.log(`Stderr: "${decodeBase64(result.stderr).trim()}"`);
    console.log(`Compile Output: "${decodeBase64(result.compile_output).trim()}"`);
    console.log(`Message: "${decodeBase64(result.message).trim()}"`);
    console.log("--------------------------------");

    if (result.status?.id === 3) {
        console.log("\n✅ Success! Your VPS Judge0 instance is fully configured and working!");
    } else {
        console.log("\n❌ Submission completed, but status was not Accepted. Check errors above.");
    }
}

testConnection().catch(err => {
    console.error("\n❌ Test Failed:", err.message);
    process.exit(1);
});
