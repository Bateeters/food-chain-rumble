require('dotenv').config();
const sendEmail = require('./utils/sendEmail');
const { getVerificationEmailTemplate } = require('./utils/emailTemplates');

const testEmail = async () => {
    try {
        console.log('Testing Resend email...');
        
        const testUrl = 'http://localhost:3000/verify-email/test-token-123';
        const template = getVerificationEmailTemplate('TestUser', testUrl);
        
        await sendEmail({
            email: 'brianteetersdesign@gmail.com',
            subject: template.subject,
            html: template.html,
            text: template.text
        });
        
        console.log('Test email sent! Check your inbox.');
        console.log('Sent to: BrianTeetersDesign@gmail.com');
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Full error:', error);
    }
};

testEmail();