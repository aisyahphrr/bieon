require('dotenv').config();
const { sendMail } = require('./src/services/mailService');

async function test() {
    console.log("RESEND_SMTP_HOST:", process.env.RESEND_SMTP_HOST);
    console.log("RESEND_SMTP_USER:", process.env.RESEND_SMTP_USER);
    console.log("RESEND_SMTP_PASS:", process.env.RESEND_SMTP_PASS);

    const result = await sendMail({
        to: 'daffa.kindi123@gmail.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        transport: 'resend'
    });
    console.log("Result:", result);
}
test();
