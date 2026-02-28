const nodemailer = require("nodemailer");
const config = require("./config");
const logger = require("./logger");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.EMAIL,
    pass: config.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration on startup
transport.verify(function (error) {
  if (error) {
    logger.error("Email transporter configuration error:", error);
  } else {
    logger.info("Email server is ready to send messages");
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transport.sendMail({
      from: `"Journal App" <${config.EMAIL}>`,
      subject: subject,
      to: to,
      text: text, //Plain text
      html: "", //HTML body
    });

    logger.info("Email sent successfully to:", to);
    return info;
  } catch (error) {
    logger.error("Error sending email to:", to);
    logger.error("Error details:", error);
    throw error;
  }
};

module.exports = {
  transport,
  sendEmail,
};
