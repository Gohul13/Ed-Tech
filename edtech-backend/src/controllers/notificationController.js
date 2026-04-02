import User from "../models/User.js";
import Course from "../models/Course.js";

async function sendEmail({ to, subject, text }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user;

  if (!host || !from || !to) {
    return { ok: false, simulated: true, reason: "SMTP not configured" };
  }

  let nodemailer;
  try {
    const m = await import("nodemailer");
    nodemailer = m.default || m;
  } catch (e) {
    return { ok: false, simulated: true, reason: "nodemailer not installed" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined
  });

  await transporter.sendMail({ from, to, subject, text });
  return { ok: true, simulated: false };
}

export const sendRiskNotification = async (req, res) => {
  try {
    const { studentId, courseId, channel = "email", subject, message, riskPercent } = req.body || {};

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const student = await User.findById(studentId).select("name email role");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const course = courseId ? await Course.findById(courseId).select("title") : null;

    const safeRisk = typeof riskPercent === "number" ? riskPercent : undefined;
    const defaultSubject = course?.title
      ? `Support for your progress in ${course.title}`
      : "Support for your learning progress";

    const text =
      message?.trim() ||
      `Hi ${student.name},\n\n` +
        `We noticed you may be at risk of dropping out${course?.title ? ` from "${course.title}"` : ""}` +
        `${safeRisk != null ? ` (risk: ${safeRisk}%).` : "."}\n\n` +
        `If you need help, reply to this email and we’ll support you.\n\n` +
        `Thanks,\nEduTech Team`;

    if (channel !== "email") {
      // Future: SMS / WhatsApp integrations (Twilio, etc.)
      return res.json({
        ok: true,
        simulated: true,
        channel,
        to: student.email,
        message: "Non-email channels are not configured; simulated send."
      });
    }

    const result = await sendEmail({
      to: student.email,
      subject: subject?.trim() || defaultSubject,
      text
    });

    if (!result.ok && !result.simulated) {
      return res.status(500).json({ message: "Failed to send notification" });
    }

    return res.json({
      ok: true,
      simulated: result.simulated,
      reason: result.reason,
      channel: "email",
      to: student.email
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send notification" });
  }
};

