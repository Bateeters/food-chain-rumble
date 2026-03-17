require('dotenv').config();
const sendEmail = require('./utils/sendEmail');
const {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate
} = require('./utils/emailTemplates');

const TEST_EMAIL = 'brianteetersdesign@gmail.com';
const TEST_USER = 'TestUser';

const testAll = async () => {
    const templates = [
        {
            name: 'Verification Email',
            subject: 'Verify Your Food Chain Rumble Account',
            html: getVerificationEmailTemplate(TEST_USER, 'http://localhost:3000/verify-email/test-token-123')
        },
        {
            name: 'Password Reset Email',
            subject: 'Reset Your Food Chain Rumble Password',
            html: getPasswordResetEmailTemplate(TEST_USER, 'http://localhost:3000/reset-password/test-token-123')
        },
        {
            name: 'Welcome Email',
            subject: 'Welcome to Food Chain Rumble!',
            html: getWelcomeEmailTemplate(TEST_USER)
        }
    ];

    for (const template of templates) {
        try {
            console.log(`Sending: ${template.name}...`);
            await sendEmail({ email: TEST_EMAIL, subject: template.subject, html: template.html });
            console.log(`✓ ${template.name} sent`);
        } catch (error) {
            console.error(`✗ ${template.name} failed:`, error.message);
        }
    }
};

testAll();
