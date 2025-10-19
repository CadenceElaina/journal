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

const sendEmail = async (to, subject, text) => {
  const info = await transport.sendMail({
    from: '"myemail"',
    subject: subject,
    to: to,
    text: text, //Plain text
    html: "", //HTML body
  });

  //log
};

module.exports = {
  transport,
  sendEmail,
};
