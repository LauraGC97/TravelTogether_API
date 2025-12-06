// Jodo Mario yo queria llamarlo miTiaLaDelPueblo, pero al final me has convencido con Services,
// pero mi tia fue mi primera opción ... XD

import nodemailer from 'nodemailer';
import { nodemailerMjmlPlugin } from 'nodemailer-mjml';
import path from 'path' ;
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAIL_USER,
        pass: process.env.NODEMAIL_PASS
    }
});

transporter.use('compile', nodemailerMjmlPlugin({
    templateFolder: path.join(__dirname, '../templates')
}))

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: 'u2714507676',
            to: to,
            subject: subject,
            text: text,
            templateLayoutName: 'baseEmail'
        });
        console.log('Message sent : ', info.messageId);
    } catch (error) {
        console.log('Message sent : ', error.error);
    }


};

export { sendEmail };
