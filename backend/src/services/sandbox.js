const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Let's use simple IDs or uuid if they have it, wait I must install uuid or use crypto
const crypto = require("crypto");

/**
 * Executes code securely in a Docker container inside a temporary directory.
 * @param {string} code - The candidate's code.
 * @param {string} language - The programming language (e.g. 'python', 'javascript').
 * @param {string} input - The input data, if any, for testing.
 * @returns {Promise<{stdout: string, stderr: string, error: Error | null}>}
 */
const runInSandbox = async (code, language, input = "") => {
    // Generate a unique ID for this execution instance
    const executionId = crypto.randomUUID();
    const tempDir = path.join(__dirname, "..", "..", "tmp", executionId);
    
    // Config based on language
    let fileName = "";
    let dockerImage = "";
    let runCommand = "";

    switch (language.toLowerCase()) {
        case "python":
            fileName = "solution.py";
            dockerImage = "python:3.9-alpine";
            runCommand = "python solution.py < input.txt";
            break;
        case "javascript":
        case "nodejs":
        case "node":
            fileName = "solution.js";
            dockerImage = "node:18-alpine";
            runCommand = "node solution.js < input.txt";
            break;
        // Add more languages (e.g., C++, Java, Go) here in the future
        default:
            throw new Error(`Unsupported language: ${language}`);
    }

    // Step 1: Create a temporary directory purely for this run
    await fs.ensureDir(tempDir);
    
    // Step 2: Write the candidate's code and standard input to files in the temp dir
    const codeFilePath = path.join(tempDir, fileName);
    const inputFilePath = path.join(tempDir, "input.txt");
    await fs.writeFile(codeFilePath, code);
    await fs.writeFile(inputFilePath, input);

    // Step 2.5: Ensure the docker image is pulled
    console.log(`[Sandbox] Ensuring image ${dockerImage} is pulled...`);
    await new Promise((resolve) => {
        exec(`docker pull ${dockerImage}`, { timeout: 60000 }, (error) => {
            if (error) {
                console.warn(`[Sandbox] Failed to pull image ${dockerImage}: ${error.message}. Attempting run anyway...`);
            } else {
                console.log(`[Sandbox] Image ${dockerImage} successfully pulled / up to date.`);
            }
            resolve();
        });
    });

    // Step 3: Construct the highly restrictive Docker run command
    // Convert absolute path to standard Docker format:
    // e.g. C:\Projects\foo -> /c/Projects/foo
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

    // Step 4: Execute the Docker command
    return new Promise((resolve) => {
        // Enforce a strict timeout at the OS level (5000ms)
        const child = exec(dockerCmd, { timeout: 5000 }, async (error, stdout, stderr) => {
            
            // Clean up: delete the temporary files regardless of outcome
            try {
                // Ensure we delete recursively after execution completes
                await fs.remove(tempDir);
            } catch (cleanupErr) {
                console.error("Failed to clean up temp dir:", cleanupErr);
            }

            // Resolve gracefully so the worker can report success/failure back to DB
            resolve({ error, stdout, stderr });
        });
    });
};

module.exports = { runInSandbox };
