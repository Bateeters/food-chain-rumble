const getVerificationEmailTemplate = (username, verificationUrl) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    background-color: #0a0a14;
                }
                .container {
                    background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
                    padding: 40px;
                    border-radius: 10px;
                    color: #fff;
                    max-width: 500px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #00d4ff;
                    margin: 0;
                }
                .content {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 30px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #00d4ff 0%, #0096c7 100%);
                    color: #0f0f1e;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
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
                <div class="header">
                    <h1>Food Chain Rumble</h1>
                </div>
                <div class="content">
                    <h2>Welcome, ${username}!</h2>
                    <p>Thanks for joining Food Chain Rumble. Please verify your email address to activate your account and start battling!</p>
                    
                    <center>
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </center>
                    
                    <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
                    <p class="link">${verificationUrl}</p>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #aaa;">
                        This link will expire in 24 hours.
                    </p>
                </div>
                <div class="footer">
                    <p>If you didn't create an account, please ignore this email.</p>
                    <p>© ${new Date().getFullYear()} Food Chain Rumble</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const getPasswordResetEmailTemplate = (username, resetUrl) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    background-color: #0a0a14;
                }
                .container {
                    background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
                    padding: 40px;
                    border-radius: 10px;
                    color: #fff;
                    max-width: 500px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #00d4ff;
                    margin: 0;
                }
                .content {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 30px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #ff6b9d 0%, #c9184a 100%);
                    color: #fff;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #888;
                    font-size: 14px;
                }
                .link {
                    color: #00d4ff;
                    word-break: break-all;
                }
                .warning {
                    background: rgba(255, 107, 157, 0.1);
                    border-left: 4px solid #ff6b9d;
                    padding: 15px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎮 Food Chain Rumble</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${username},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    
                    <center>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </center>
                    
                    <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
                    <p class="link">${resetUrl}</p>
                    
                    <div class="warning">
                        <strong>Security Notice:</strong><br>
                        This link will expire in 1 hour.<br>
                        If you didn't request this, please ignore this email.
                    </div>
                </div>
                <div class="footer">
                    <p>Your password will not be changed unless you click the link above and create a new one.</p>
                    <p>© ${new Date().getFullYear()} Food Chain Rumble</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const getWelcomeEmailTemplate = (username) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    background-color: #0a0a14;
                }
                .container {
                    background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
                    padding: 40px;
                    border-radius: 10px;
                    color: #fff;
                    max-width: 500px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #00d4ff;
                    margin: 0;
                }
                .content {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 30px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #888;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Food Chain Rumble!</h1>
                </div>
                <div class="content">
                    <h2>You're All Set, ${username}!</h2>
                    <p>Your email has been verified and your account is now active.</p>
                    
                    <p>Here's what you can do now:</p>
                    <ul class="features">
                        <li>Track your match history</li>
                        <li>Join the community forums</li>
                        <li>⬆Vote on posts and share strategies</li>
                    </ul>
                    <p style="margin-top: 30px;">See you in the arena!</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Food Chain Rumble</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate
};