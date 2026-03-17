const getVerificationEmailTemplate = (username, verificationUrl) => {
    return {
        subject: 'Verify Your Food Chain Rumble Account',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                        border-radius: 12px;
                        padding: 40px;
                        text-align: center;
                    }
                    .logo {
                        font-size: 2rem;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #00d4ff;
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    p {
                        color: #ddd;
                        margin-bottom: 30px;
                        font-size: 16px;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #00d4ff 0%, #0096c7 100%);
                        color: #0f0f1e;
                        padding: 14px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        color: #888;
                        font-size: 14px;
                    }
                    .link {
                        color: #00d4ff;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🦁⚔️</div>
                    <h1>Welcome to Food Chain Rumble!</h1>
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>Thanks for joining the arena! Please verify your email address to activate your account and start battling.</p>
                    
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    
                    <div class="footer">
                        <p>Or copy and paste this link into your browser:</p>
                        <p class="link">${verificationUrl}</p>
                        <p style="margin-top: 30px;">This link expires in 24 hours.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Welcome to Food Chain Rumble!

Hi ${username},

Thanks for joining! Please verify your email address by clicking the link below:

${verificationUrl}

This link expires in 24 hours.

If you didn't create an account, please ignore this email.

- The Food Chain Rumble Team
        `
    };
};

const getPasswordResetEmailTemplate = (username, resetUrl) => {
    return {
        subject: 'Reset Your Food Chain Rumble Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                        border-radius: 12px;
                        padding: 40px;
                        text-align: center;
                    }
                    .logo {
                        font-size: 2rem;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #ff6b9d;
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    p {
                        color: #ddd;
                        margin-bottom: 30px;
                        font-size: 16px;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #ff6b9d 0%, #ff5588 100%);
                        color: white;
                        padding: 14px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        color: #888;
                        font-size: 14px;
                    }
                    .link {
                        color: #ff6b9d;
                        word-break: break-all;
                    }
                    .warning {
                        background: rgba(255, 107, 157, 0.1);
                        border: 1px solid rgba(255, 107, 157, 0.3);
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🔒</div>
                    <h1>Password Reset Request</h1>
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    
                    <div class="footer">
                        <p>Or copy and paste this link into your browser:</p>
                        <p class="link">${resetUrl}</p>
                        <p style="margin-top: 30px;">This link expires in 1 hour.</p>
                        <div class="warning">
                            <p style="margin: 0;"><strong>If you didn't request this, please ignore this email.</strong></p>
                            <p style="margin: 5px 0 0 0;">Your password will not be changed.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Password Reset Request

Hi ${username},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link expires in 1 hour.

If you didn't request this, please ignore this email. Your password will not be changed.

- The Food Chain Rumble Team
        `
    };
};

const getWelcomeEmailTemplate = (username) => {
    return {
        subject: 'Welcome to Food Chain Rumble - Your Account is Verified!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                        border-radius: 12px;
                        padding: 40px;
                        text-align: center;
                    }
                    .logo {
                        font-size: 3rem;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #00d4ff;
                        margin-bottom: 20px;
                        font-size: 28px;
                    }
                    p {
                        color: #ddd;
                        margin-bottom: 20px;
                        font-size: 16px;
                    }
                    .features {
                        text-align: left;
                        margin: 30px auto;
                        color: #ddd;
                        max-width: 400px;
                    }
                    .features li {
                        margin-bottom: 10px;
                    }
                    .highlight {
                        color: #00d4ff;
                        font-weight: 600;
                        font-size: 18px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🎉</div>
                    <h1>You're All Set, ${username}!</h1>
                    <p>Your email has been verified and your account is now active.</p>
                    
                    <p>Here's what you can do now:</p>
                    <ul class="features">
                        <li>Track your match history</li>
                        <li>Join the community forums</li>
                        <li>⬆Vote on posts and share strategies</li>
                    </ul>
                    
                    <p style="margin-top: 30px;">Ready to rumble?</p>
                    <p class="highlight">Let the battles begin!</p>
                </div>
            </body>
            </html>
        `,
        text: `
You're All Set, ${username}!

Your email has been verified and your account is now active.

Here's what you can do now:
- Track your match history
- Join the community forums
- Vote on posts and share strategies

Ready to rumble? Let the battles begin!

- The Food Chain Rumble Team
        `
    };
};

module.exports = {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate
};