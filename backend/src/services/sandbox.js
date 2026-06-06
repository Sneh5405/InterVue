const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const FALLBACK_LANGUAGES = {
    python: 71,
    python3: 71,
    py: 71,
    javascript: 93,
    js: 93,
    node: 93,
    nodejs: 93,
    typescript: 94,
    ts: 94,
    cpp: 54,
    c: 50,
    java: 62,
    go: 60,
    rust: 73
};

let cachedLanguages = null;

const encodeBase64 = (str) => {
    if (!str) return "";
    return Buffer.from(str).toString("base64");
};

const decodeBase64 = (base64Str) => {
    if (!base64Str) return "";
    return Buffer.from(base64Str, "base64").toString("utf-8").replace(/\r\n/g, "\n");
};

/**
 * Fetches the list of languages from Judge0 and caches them in memory.
 */
const fetchLanguages = async (apiHost, authHeaders) => {
    if (cachedLanguages) return cachedLanguages;
    try {
        console.log(`[Sandbox] Fetching languages from Judge0 at ${apiHost}...`);
        const response = await fetch(`${apiHost}/languages`, {
            headers: authHeaders
        });
        if (response.ok) {
            cachedLanguages = await response.json();
            console.log(`[Sandbox] Successfully cached ${cachedLanguages.length} languages from Judge0.`);
            return cachedLanguages;
        } else {
            console.warn(`[Sandbox] Failed to fetch languages from Judge0: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.error("[Sandbox] Failed to fetch Judge0 languages dynamically:", err.message);
    }
    return null;
};

/**
 * Gets the Judge0 language ID for a given language name.
 */
const getJudge0LanguageId = async (language, apiHost, authHeaders) => {
    if (typeof language === "number") return language;
    if (typeof language === "string" && !isNaN(language) && language.trim() !== "") {
        return parseInt(language, 10);
    }

    const normalized = language.toLowerCase().trim();

    // Try dynamic matching from the API
    const apiLanguages = await fetchLanguages(apiHost, authHeaders);
    if (apiLanguages && Array.isArray(apiLanguages)) {
        let searchTerm = normalized;
        if (normalized === "js" || normalized === "nodejs" || normalized === "node") {
            searchTerm = "javascript";
        }
        if (normalized === "py") {
            searchTerm = "python";
        }
        if (normalized === "cpp") {
            searchTerm = "c++";
        }
        if (normalized === "cs" || normalized === "csharp") {
            searchTerm = "c#";
        }

        const matches = apiLanguages.filter(lang => {
            const name = lang.name.toLowerCase();
            return name.includes(searchTerm);
        });

        if (matches.length > 0) {
            // If Python, filter out Python 2
            if (searchTerm === "python") {
                const py3 = matches.filter(lang => 
                    !lang.name.toLowerCase().includes("python 2") && 
                    !lang.name.toLowerCase().includes("python (2")
                );
                if (py3.length > 0) {
                    return py3[py3.length - 1].id; // Return the latest python 3 ID
                }
            }
            return matches[matches.length - 1].id; // Return the latest version matching
        }
    }

    // Fallback mapping
    const fallbackId = FALLBACK_LANGUAGES[normalized];
    if (fallbackId) {
        console.log(`[Sandbox] Dynamic match not found. Using fallback ID ${fallbackId} for language: ${language}`);
        return fallbackId;
    }

    throw new Error(`Unsupported or unrecognized language: ${language}`);
};

/**
 * Fallback execution flow utilizing local Docker daemon directly.
 */
const runInLocalDocker = async (code, language, input = "") => {
    console.log(`[Sandbox] Running code locally via Docker daemon...`);
    const executionId = crypto.randomUUID();
    const tempDir = path.join(__dirname, "..", "..", "tmp", executionId);
    
    let fileName = "";
    let dockerImage = "";
    let runCommand = "";

    const normalizedLang = language.toLowerCase().trim();
    if (normalizedLang.includes("python") || normalizedLang === "py") {
        fileName = "solution.py";
        dockerImage = "python:3.9-alpine";
        runCommand = "python solution.py < input.txt";
    } else if (normalizedLang.includes("javascript") || normalizedLang === "js" || normalizedLang.includes("node")) {
        fileName = "solution.js";
        dockerImage = "node:18-alpine";
        runCommand = "node solution.js < input.txt";
    } else {
        throw new Error(`Unsupported language for local Docker fallback: ${language}`);
    }

    try {
        // Step 1: Ensure temporary directory is created
        await fs.ensureDir(tempDir);
        
        // Step 2: Write solutions and inputs
        await fs.writeFile(path.join(tempDir, fileName), code);
        await fs.writeFile(path.join(tempDir, "input.txt"), input);

        // Step 3: Ensure docker image is pulled
        await new Promise((resolve) => {
            exec(`docker pull ${dockerImage}`, { timeout: 30000 }, (err) => {
                if (err) {
                    console.warn(`[Sandbox] Failed to pull docker image ${dockerImage}. Running anyway...`);
                }
                resolve();
            });
        });

        // Step 4: Resolve Windows drive and volume formatting
        let absoluteTempDir = path.resolve(tempDir).replace(/\\/g, '/');
        const driveLetterMatch = absoluteTempDir.match(/^([A-Za-z]):/);
        if (driveLetterMatch) {
            const driveLetter = driveLetterMatch[1].toLowerCase();
            absoluteTempDir = `/${driveLetter}${absoluteTempDir.substring(2)}`;
        }

        const dockerCmd = `docker run --rm -i \
          --network none \
          --memory 256m \
          --cpus 1.0 \
          --pids-limit 50 \
          -v "${absoluteTempDir}:/app" \
          -w /app \
          ${dockerImage} /bin/sh -c "${runCommand}"`;

        // Step 5: Execute and clean up
        return new Promise((resolve) => {
            exec(dockerCmd, { timeout: 5000 }, async (error, stdout, stderr) => {
                try {
                    await fs.remove(tempDir);
                } catch (cleanupErr) {
                    console.error("[Sandbox] Cleanup failed:", cleanupErr.message);
                }

                // If error is killed by timeout, map it
                if (error && error.killed) {
                    resolve({ error, stdout, stderr });
                } else {
                    resolve({ error: error || null, stdout, stderr });
                }
            });
        });

    } catch (err) {
        console.error("[Sandbox] Local Docker run failed:", err);
        return {
            error: err,
            stdout: "",
            stderr: err.message || "Local Execution Error"
        };
    }
};

/**
 * Executes code securely using the Judge0 API, with local Docker execution fallback.
 * @param {string} code - The candidate's code.
 * @param {string} language - The programming language.
 * @param {string} input - The input data.
 * @returns {Promise<{stdout: string, stderr: string, error: Error | null}>}
 */
const runInSandbox = async (code, language, input = "") => {
    // If local Docker is forced, go straight to it
    if (process.env.USE_LOCAL_DOCKER_FALLBACK === "true") {
        return runInLocalDocker(code, language, input);
    }

    const apiHost = process.env.JUDGE0_API_URL || "http://localhost:2358";
    
    // Prepare auth headers
    const authHeaders = {};
    if (process.env.JUDGE0_AUTH_TOKEN) {
        authHeaders["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
    }
    if (process.env.JUDGE0_RAPIDAPI_KEY) {
        authHeaders["X-RapidAPI-Key"] = process.env.JUDGE0_RAPIDAPI_KEY;
    }
    if (process.env.JUDGE0_RAPIDAPI_HOST) {
        authHeaders["X-RapidAPI-Host"] = process.env.JUDGE0_RAPIDAPI_HOST;
    }

    try {
        const languageId = await getJudge0LanguageId(language, apiHost, authHeaders);
        console.log(`[Sandbox] Resolved language "${language}" to Judge0 ID: ${languageId}`);

        // Step 1: Submit code to Judge0
        const submissionBody = {
            source_code: encodeBase64(code),
            language_id: languageId,
            stdin: encodeBase64(input)
        };

        const response = await fetch(`${apiHost}/submissions?base64_encoded=true`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders
            },
            body: JSON.stringify(submissionBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Judge0 POST submission failed: ${response.status} - ${errText}`);
        }

        const { token } = await response.json();
        if (!token) {
            throw new Error("Judge0 did not return a submission token");
        }

        console.log(`[Sandbox] Queued Judge0 submission token: ${token}`);

        // Step 2: Poll for the result
        let attempts = 0;
        const maxAttempts = 20; // 20 * 500ms = 10s max execution time
        let result = null;

        while (attempts < maxAttempts) {
            const pollRes = await fetch(`${apiHost}/submissions/${token}?base64_encoded=true`, {
                headers: authHeaders
            });

            if (!pollRes.ok) {
                throw new Error(`Judge0 poll failed: ${pollRes.status} ${pollRes.statusText}`);
            }

            result = await pollRes.json();
            const statusId = result.status?.id;

            // statusId 1: In Queue, 2: Processing
            if (statusId !== 1 && statusId !== 2) {
                break;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (attempts >= maxAttempts) {
            console.warn(`[Sandbox] Execution timed out waiting for token: ${token}`);
            return {
                error: { killed: true, message: "Execution timed out on Judge0" },
                stdout: "",
                stderr: "Execution timed out. The compilation or execution process took too long."
            };
        }

        // Step 3: Decode outputs and map results to worker format
        const decodedStdout = decodeBase64(result.stdout);
        const decodedStderr = decodeBase64(result.stderr);
        const decodedCompileOutput = decodeBase64(result.compile_output);
        const decodedMessage = decodeBase64(result.message);

        const statusId = result.status?.id;
        const statusDescription = result.status?.description || "Unknown Status";

        console.log(`[Sandbox] Judge0 Result status id: ${statusId} (${statusDescription})`);

        // Check for Docker/WSL2 cgroups v1 incompatibility error
        if (statusId === 13 && decodedMessage.includes("rb_sysopen")) {
            console.warn("[Sandbox] Judge0 failed with cgroups v1 compatibility error. Falling back to local Docker execution...");
            return runInLocalDocker(code, language, input);
        }

        if (statusId === 3) {
            // Accepted
            return {
                error: null,
                stdout: decodedStdout,
                stderr: decodedStderr
            };
        } else if (statusId === 5) {
            // Time Limit Exceeded
            return {
                error: { killed: true, message: "Time Limit Exceeded" },
                stdout: decodedStdout,
                stderr: decodedStderr || "Time Limit Exceeded"
            };
        } else if (statusId === 6) {
            // Compilation Error
            return {
                error: new Error(`Compilation Error: ${statusDescription}`),
                stdout: decodedStdout,
                stderr: decodedCompileOutput || decodedStderr || `Compilation Error: ${statusDescription}`
            };
        } else {
            // Any other runtime error (statusId: 7, 8, 9, 10, 11, 12, 13 etc.)
            return {
                error: new Error(decodedMessage || statusDescription),
                stdout: decodedStdout,
                stderr: decodedStderr || decodedMessage || statusDescription
            };
        }

    } catch (err) {
        console.warn(`[Sandbox] Judge0 failed with: "${err.message}". Falling back to local Docker execution...`);
        return runInLocalDocker(code, language, input);
    }
};

module.exports = { runInSandbox };
