const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
            text: options.text // Plain text fallback
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error('Email could not be sent');
        }

        console.log(`Email sent to ${options.email}`, data);
        return { success: true, data };
    } catch (error) {
        console.error('Email Send Error:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;