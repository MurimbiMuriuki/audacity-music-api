var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const nodemailer = require("nodemailer");

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBoolean(process.env.SMTP_SECURE, false);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER and SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

module.exports = {
  async sendContactMessage(payload) {
    try {
      const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
      if (!receiverEmail) {
        throw new Error("CONTACT_RECEIVER_EMAIL is missing.");
      }

      const senderEmail = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;
      const transporter = getTransporter();

      const email = payload.email.trim();
      const message = payload.message.trim();
      const submittedBy = payload.userName || "Audacity Music User";

      const subject = `[Audacity Music] Contact Us message from ${email}`;
      const text = `New Contact Us message\\n\\nFrom: ${email}\\nName: ${submittedBy}\\nUser ID: ${payload.userId || "N/A"}\\n\\nMessage:\\n${message}`;
      const html = `
        <h3>New Contact Us Message</h3>
        <p><strong>From:</strong> ${escapeHtml(email)}</p>
        <p><strong>Name:</strong> ${escapeHtml(submittedBy)}</p>
        <p><strong>User ID:</strong> ${escapeHtml(payload.userId || "N/A")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\\n/g, "<br>")}</p>
      `;

      const mailResult = await transporter.sendMail({
        from: senderEmail,
        to: receiverEmail,
        replyTo: email,
        subject,
        text,
        html,
      });

      return {
        messageId: mailResult.messageId,
      };
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
};
