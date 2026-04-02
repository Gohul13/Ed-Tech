import Enrollment from "../models/Enrollment.js";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPythonCmd() {
  return process.env.PYTHON_CMD || "py";
}

function riskLevelFromPercent(riskPercent) {
  if (riskPercent >= 70) return "high";
  if (riskPercent >= 40) return "medium";
  return "low";
}

function mlScriptPath(scriptName) {
  // controllers/ -> src/ -> edtech-backend/ -> Project/ -> ml/
  return path.resolve(__dirname, "../../../ml", scriptName);
}

export const getMLDataset = async (req, res) => {
  try {

    const dataset = await Enrollment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: "$student"
      },
      {
        $project: {
          studentId: "$student._id",
          courseId: "$courseId",
          progressPercentage: "$progressPercentage",
          completedLessons: { $size: "$completedLessons" },
          loginCount: "$student.loginCount",
          lastAccessedAt: "$lastAccessedAt"
        }
      }
    ]);

    const result = dataset.map((item) => {

      const daysInactive = Math.floor(
        (new Date() - new Date(item.lastAccessedAt)) / (1000 * 60 * 60 * 24)
      );

      return {
        studentId: item.studentId,
        courseId: item.courseId,
        progressPercentage: item.progressPercentage,
        completedLessons: item.completedLessons,
        loginCount: item.loginCount,
        daysInactive
      };

    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate ML dataset"
    });
  }
};

export const predictDropout = (req, res) => {
  const { progress, lessonsCompleted, loginCount, daysInactive } = req.query;

  const args = [
    mlScriptPath("predict.py"),
    String(progress ?? ""),
    String(lessonsCompleted ?? ""),
    String(loginCount ?? ""),
    String(daysInactive ?? "")
  ];

  const python = spawn(getPythonCmd(), args);

  let stdout = "";
  let stderr = "";

  python.stdout.on("data", (d) => {
    stdout += d.toString();
  });
  python.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.error("PYTHON EXIT CODE:", code);
      console.error("PYTHON STDERR:", stderr);
      return res.status(500).json({ message: "Prediction failed", error: stderr });
    }

    const risk = parseFloat(stdout);
    if (Number.isNaN(risk)) {
      console.error("PYTHON STDOUT:", stdout);
      return res.status(500).json({ message: "Prediction failed", error: "Invalid model output" });
    }

    const percent = Number((risk * 100).toFixed(2));
    res.json({ dropoutRisk: percent, riskLevel: riskLevelFromPercent(percent) });
  });
};

// export const getDropoutRiskStudents = async (req, res) => {
//   try {
//     const enrollments = await Enrollment.find()
//       .populate("studentId", "name loginCount") 
//       .populate("courseId", "title");

//     const results = [];

//     for (const enrollment of enrollments) {

//       const progress = enrollment.progressPercentage;
//       const lessonsCompleted = enrollment.completedLessons?.length || 0;
//       const loginCount = enrollment.studentId.loginCount || 0;

//       const daysInactive = Math.floor(
//         (new Date() - new Date(enrollment.lastAccessedAt)) /
//         (1000 * 60 * 60 * 24)
//       );

//       const command = `py ../ml/predict.py ${progress} ${lessonsCompleted} ${loginCount} ${daysInactive}`;

//       const risk = await new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//           if (error) return reject(stderr);
//           resolve(parseFloat(stdout));
//         });
//       });

//       results.push({
//         student: enrollment.studentId.name,
//         course: enrollment.courseId.title,
//         risk: Number((risk * 100).toFixed(2))
//       });
//     }

//     res.json(results);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to generate dropout predictions"
//     });
//   }
// };


export const getDropoutRiskStudents = async (req, res) => {
  try {

    const enrollments = await Enrollment.find()
      .populate("studentId", "name email loginCount")
      .populate("courseId", "title");

    const dataset = enrollments
      .filter((e) => e.studentId && e.courseId)
      .map((e) => {

        const daysInactive = Math.floor(
          (new Date() - new Date(e.lastAccessedAt)) /
          (1000 * 60 * 60 * 24)
        );

        return {
          studentId: String(e.studentId._id),
          courseId: String(e.courseId._id),
          studentName: e.studentId.name,
          studentEmail: e.studentId.email,
          courseTitle: e.courseId.title,
          progress: e.progressPercentage,
          lessonsCompleted: e.completedLessons?.length || 0,
          loginCount: e.studentId.loginCount || 0,
          daysInactive
        };
      });

    if (dataset.length === 0) return res.json([]);

    const python = spawn(getPythonCmd(), [mlScriptPath("predict_batch.py")]);

    python.stdin.write(JSON.stringify(dataset));
    python.stdin.end();

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    python.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("PYTHON EXIT CODE:", code);
        console.error("PYTHON STDERR:", stderr);
        return res.status(500).json({ message: "Failed to generate dropout predictions", error: stderr });
      }

      let predictions;
      try {
        predictions = JSON.parse(stdout);
      } catch (e) {
        console.error("PYTHON STDOUT:", stdout);
        return res.status(500).json({ message: "Failed to generate dropout predictions", error: "Invalid model output" });
      }

      // Use returned ids to match (more robust than relying on order).
      const byKey = new Map(
        (Array.isArray(predictions) ? predictions : []).map((p) => [
          `${String(p.studentId)}:${String(p.courseId)}`,
          p
        ])
      );

      const final = dataset.map((row) => {
        const p = byKey.get(`${row.studentId}:${row.courseId}`);
        const riskPercent = Number((((p?.risk ?? 0) * 100)).toFixed(2));
        return {
          // Back-compat fields (original endpoint response)
          student: row.studentName,
          course: row.courseTitle,
          risk: riskPercent,

          // Structured fields for UI integrations
          studentId: row.studentId,
          studentEmail: row.studentEmail,
          courseId: row.courseId,
          features: {
            progress: row.progress,
            lessonsCompleted: row.lessonsCompleted,
            loginCount: row.loginCount,
            daysInactive: row.daysInactive
          },
          riskPercent,
          riskLevel: riskLevelFromPercent(riskPercent)
        };
      });

      res.json(final);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate dropout predictions"
    });
  }
};

