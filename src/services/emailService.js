// Jodo Mario yo queria llamarlo miTiaLaDelPueblo, pero al final me has convencido con Services,
// pero mi tia fue mi primera opción ... XD

import nodemailer from 'nodemailer';
import { nodemailerMjmlPlugin } from 'nodemailer-mjml';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import logger from '../config/logger.js';

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

const sendEmail = async ( subject, text, templateName, variables = []) => {

    // Variables necesarias para realizar la modificación del template con datos personalizados
    // a cada email

    const mjmlPath = path.join(__dirname, '..', 'templates', `${templateName}.mjml`);
    const mjmlSource = await fs.readFile(mjmlPath, 'utf8');
    const template = Handlebars.compile(mjmlSource);

    for (const item of variables) {

        const { email, ...templateData } = item;

        const mjmlRendered = template(templateData);
        const { html, errors } = mjml2html(mjmlRendered);

        if (errors && errors.length) {
            logger.warn('MJML warnings:', errors);
        }

        try {

            const info = await transporter.sendMail({
                from: 'u2714507676',
                to: email,
                subject: subject,
                text: text,
                html: html
            });

            const mensaje = 'Email enviado correctamente a : ' + email;
            logger.info(mensaje, info.messageId);

        } catch (error) {

            logger.error('Message sent : ', error);
        }
    }

};

export { sendEmail };
