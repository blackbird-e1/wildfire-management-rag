import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const router = Router();

router.post("/optimize", async (_req, res) => {
  try {
    const projectRoot = path.resolve(__dirname, "../..");

    const pythonWindows = path.join(
      projectRoot,
      "quantum",
      "venv",
      "Scripts",
      "python.exe"
    );

    const pythonUnix = path.join(
      projectRoot,
      "quantum",
      "venv",
      "bin",
      "python"
    );

    let pythonExecutable = "python";

    if (fs.existsSync(pythonWindows)) {
      pythonExecutable = pythonWindows;
    } else if (fs.existsSync(pythonUnix)) {
      pythonExecutable = pythonUnix;
    }

    const scriptPath = path.join(
      projectRoot,
      "quantum",
      "run_optimizer.py"
    );

    console.log("[Quantum] Starting optimizer...");

    const pythonProcess = spawn(
      pythonExecutable,
      [scriptPath],
      {
        cwd: path.join(projectRoot, "quantum")
      }
    );

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {

      if (code !== 0) {
        console.error(
          "[Quantum] Python process failed:",
          stderr
        );

        res.status(500).json({
          success: false,
          error: "Quantum optimizer failed.",
          details: stderr
        });

        return;
      }

      try {
        const result = JSON.parse(stdout.trim());

        console.log(
          "[Quantum] Optimization completed."
        );

        res.status(200).json(result);

      } catch (error) {

        console.error(
          "[Quantum] Invalid Python output:",
          stdout
        );

        res.status(500).json({
          success: false,
          error: "Invalid quantum optimizer response."
        });
      }
    });

  } catch (error) {

    console.error(
      "[Quantum] Unexpected error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Quantum optimization failed."
    });
  }
});

export default router;