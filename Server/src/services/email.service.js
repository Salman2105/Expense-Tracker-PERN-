const nodemailer = require("nodemailer");
const env = require("../../config/env");

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const { host, port, secure, user, password } = env.email;
  if (!host || !user || !password || !env.email.from) {
    throw new Error("Email service is not configured");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) =>
  getTransporter().sendMail({
    from: env.email.from,
    to,
    subject,
    text,
    ...(html && { html }),
  });

const sendBudgetAlert = async ({ to, categoryName, threshold, spent, limit }) =>
  sendEmail({
    to,
    subject: `Budget alert: ${categoryName} reached ${threshold}%`,
    text: [
      `Your ${categoryName} budget has reached ${threshold}% of its limit.`,
      `Spent: ${spent}`,
      `Budget: ${limit}`,
    ].join("\n"),
  });

const resetTransporterForTests = () => {
  transporter = undefined;
};

module.exports = {
  sendEmail,
  sendBudgetAlert,
  resetTransporterForTests,
};
