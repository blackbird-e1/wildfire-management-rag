import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const router = Router();

type RiskZone = {
  id: string;
  risk: number;
};

type OptimizationRequest = {
  zones: RiskZone[];
};

router.post(
  "/optimize",
  async (req, res) => {
    try {
      const { zones } =
        req.body as OptimizationRequest;

      if (!Array.isArray(zones)) {
        res.status(400).json({
          success: false,
          error: "zones must be an array.",
        });

        return;
      }

      const projectRoot = path.resolve(
        __dirname,
        "../.."
      );

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

      const quantumDirectory = path.join(
        projectRoot,
        "quantum"
      );

      console.log(
        "[Quantum] Starting optimizer..."
      );

      console.log(
        "[Quantum] Received zones:",
        zones
      );

      const pythonProcess = spawn(
        pythonExecutable,
        [scriptPath, "--stdin"],
        {
          cwd: quantumDirectory,
        }
      );

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on(
        "data",
        (data) => {
          stdout += data.toString();
        }
      );

      pythonProcess.stderr.on(
        "data",
        (data) => {
          stderr += data.toString();
        }
      );

      pythonProcess.on(
        "error",
        (error) => {
          console.error(
            "[Quantum] Failed to start Python:",
            error
          );

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error:
                "Unable to start quantum optimizer.",
              details: error.message,
            });
          }
        }
      );

      pythonProcess.on(
        "close",
        (code) => {
          if (code !== 0) {
            console.error(
              "[Quantum] Python process failed:",
              stderr
            );

            if (!res.headersSent) {
              res.status(500).json({
                success: false,
                error:
                  "Quantum optimizer failed.",
                details: stderr,
              });
            }

            return;
          }

          try {
            const result = JSON.parse(
              stdout.trim()
            );

            console.log(
              "[Quantum] Optimization completed."
            );

            res.status(200).json(result);
          } catch (error) {
            console.error(
              "[Quantum] Invalid Python output:",
              stdout
            );

            if (!res.headersSent) {
              res.status(500).json({
                success: false,
                error:
                  "Invalid quantum optimizer response.",
              });
            }
          }
        }
      );

      /*
       * Send the frontend risk data
       * to the Python optimizer.
       */
      pythonProcess.stdin.write(
        JSON.stringify({
          zones,
        })
      );

      pythonProcess.stdin.end();
    } catch (error) {
      console.error(
        "[Quantum] Unexpected error:",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error:
            "Quantum optimization failed.",
        });
      }
    }
  }
);

export default router;