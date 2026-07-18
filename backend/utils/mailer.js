const nodemailer = require('nodemailer');
const config = require('../config/env');

// Create the transporter once. When email credentials are not configured we
// fall back to logging the message so local development still works.
let transporter = null;
if (config.email.enabled) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.email.user, pass: config.email.pass },
  });
}

const sendEmail = async (to, subject, text) => {
  try {
    if (transporter) {
      await transporter.sendMail({ from: config.email.user, to, subject, text });
      // eslint-disable-next-line no-console
      console.log(`[mail] sent to ${to}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[mail:mock] To: ${to} | Subject: ${subject} | ${text}`);
    }
  } catch (error) {
    // Never let a mail failure break the request flow.
    // eslint-disable-next-line no-console
    console.error('[mail] error:', error.message);
  }
};

module.exports = { sendEmail };
