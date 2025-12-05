import nodemailer from 'nodemailer';

const trasporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'u2714507676@gmail.com',
        pass: 'tmwa jlyu fgby rrub'
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        const info = await trasporter.sendMail({
            from: 'u2714507676',
            to: to,
            subject: subject,
            text: text
        });
        console.log('Message sent : ', info.messageId);
    } catch (error) {
        console.log('Message sent : ', error.error);
    }


};

export { sendEmail };
