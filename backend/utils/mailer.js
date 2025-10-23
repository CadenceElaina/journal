const nodemailer = require("nodemailer");
const config = require("./config");

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
    console.error("Email transporter configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
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

    console.log("Email sent successfully to:", to);
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email to:", to);
    console.error("Error details:", error);
    throw error;
  }
};

module.exports = {
  transport,
  sendEmail,
};
